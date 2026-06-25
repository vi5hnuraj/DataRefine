import { SQSEvent, SQSHandler } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import Papa from 'papaparse';
import { Extractor } from './lib/etl/extractor';
import { Validator } from './lib/etl/validator';
import { Cleaner } from './lib/etl/cleaner';
import { Transformer } from './lib/etl/transformer';
import { Statistics } from './lib/etl/statistics';
import { GroqAuditor } from './lib/ai/groq-auditor';
import { DatasetRepository } from './lib/repositories/dataset.repository';
import dbConnect from './lib/db/mongoose';
import { PipelineStatus } from './lib/models/Dataset';

const s3Client = new S3Client({});
const dbConnectionPromise = dbConnect();

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export const lambdaHandler: SQSHandler = async (event: SQSEvent) => {
    console.log("DataRefine ETL Lambda invoked");
    await dbConnectionPromise;

    for (const record of event.Records) {
        try {
            const parsedBody = JSON.parse(record.body);
            let s3Event = parsedBody;
            if (parsedBody.Message) {
                s3Event = JSON.parse(parsedBody.Message);
            }
            if (!s3Event.Records || !s3Event.Records[0]) continue;
            
            const bucket = s3Event.Records[0].s3.bucket.name;
            const key = decodeURIComponent(s3Event.Records[0].s3.object.key.replace(/\+/g, ' '));

            if (key.startsWith('processed/')) {
                console.log(`Ignoring processed file loopback: ${key}`);
                continue;
            }

            console.log(`Processing file: s3://${bucket}/${key}`);

            const getObjCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
            const s3Response = await s3Client.send(getObjCmd);
            if (!s3Response.Body) throw new Error("Empty S3 body");
            
            const userId = s3Response.Metadata?.userid;
            
            const csvString = await streamToString(s3Response.Body as Readable);
            
            const dataset = await DatasetRepository.createDataset(
                key.split('/').pop() || key,
                Buffer.byteLength(csvString, 'utf8'),
                'csv',
                `s3://${bucket}/${key}`,
                userId
            );
            const datasetId = dataset.id || dataset._id;

            try {
                await DatasetRepository.updateDatasetStatus(datasetId, PipelineStatus.PROCESSING);
                
                const startTime = Date.now();
                
                const extractRun = await DatasetRepository.createPipelineRun(datasetId, "EXTRACT", PipelineStatus.PROCESSING);
                const rawData = Extractor.extractCsv(csvString);
                await DatasetRepository.updatePipelineRun(extractRun.id || extractRun._id, PipelineStatus.COMPLETED);

                const validateRun = await DatasetRepository.createPipelineRun(datasetId, "VALIDATE", PipelineStatus.PROCESSING);
                const validatedData = Validator.validate(rawData);
                await DatasetRepository.updatePipelineRun(validateRun.id || validateRun._id, PipelineStatus.COMPLETED);

                const cleanRun = await DatasetRepository.createPipelineRun(datasetId, "CLEAN", PipelineStatus.PROCESSING);
                const cleanedData = Cleaner.clean(validatedData);
                await DatasetRepository.updatePipelineRun(cleanRun.id || cleanRun._id, PipelineStatus.COMPLETED);

                const transformRun = await DatasetRepository.createPipelineRun(datasetId, "TRANSFORM", PipelineStatus.PROCESSING);
                const transformedData = Transformer.transform(cleanedData);
                await DatasetRepository.updatePipelineRun(transformRun.id || transformRun._id, PipelineStatus.COMPLETED);

                const statsRun = await DatasetRepository.createPipelineRun(datasetId, "STATISTICS", PipelineStatus.PROCESSING);
                const finalOutput = Statistics.generate(transformedData, startTime);
                await DatasetRepository.updatePipelineRun(statsRun.id || statsRun._id, PipelineStatus.COMPLETED);

                await DatasetRepository.saveStatistics(datasetId, finalOutput.statistics as any);
                
                await DatasetRepository.saveQualityReport(datasetId, finalOutput.qualityReport as any);

                // Phase 3: Persist Processed Data
                const processedCsv = Papa.unparse(finalOutput.processedData);
                const processedKey = `processed/${datasetId}/processed.csv`;
                
                await s3Client.send(new PutObjectCommand({
                    Bucket: bucket,
                    Key: processedKey,
                    Body: processedCsv,
                    ContentType: 'text/csv'
                }));

                await DatasetRepository.saveProcessedFile(
                    datasetId,
                    'processed.csv',
                    'csv',
                    `s3://${bucket}/${processedKey}`
                );

                const aiRun = await DatasetRepository.createPipelineRun(datasetId, "AI_AUDIT", PipelineStatus.PROCESSING);
                const aiReport = await GroqAuditor.auditDataset(dataset.filename, finalOutput);

                if (aiReport) {
                    await DatasetRepository.saveAiReport(datasetId, aiReport);
                }
                await DatasetRepository.updatePipelineRun(aiRun.id || aiRun._id, PipelineStatus.COMPLETED);

                await DatasetRepository.updateDatasetStatus(datasetId, PipelineStatus.COMPLETED);
                console.log(`Successfully processed ${datasetId}`);

            } catch (error: any) {
                console.error(`Pipeline failed for ${datasetId}:`, error);
                await DatasetRepository.updateDatasetStatus(datasetId, PipelineStatus.FAILED);
                throw error;
            }
        } catch (parseError) {
            console.error("Failed to parse SQS/SNS message:", parseError);
        }
    }
};
