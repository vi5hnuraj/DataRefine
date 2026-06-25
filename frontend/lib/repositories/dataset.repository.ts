import mongoose from 'mongoose';
import dbConnect from '../db/mongoose';
import { Dataset, PipelineRun, DatasetStatistics, DataQualityReport, ProcessedFile, AiAuditorReport, PipelineStatus } from '../models/Dataset';

export class DatasetRepository {
  static async createDataset(filename: string, originalSize: number, format: string, storageUrl: string, userId?: string) {
    await dbConnect();
    const dataset = await Dataset.create({
      userId,
      filename,
      originalSize,
      format,
      storageUrl,
      status: PipelineStatus.PENDING,
    });
    return JSON.parse(JSON.stringify(dataset.toJSON()));
  }

  static async updateDatasetStatus(id: string, status: PipelineStatus | string) {
    await dbConnect();
    const dataset = await Dataset.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    );
    return dataset ? JSON.parse(JSON.stringify(dataset.toJSON())) : null;
  }

  static async saveProcessedFile(datasetId: string, filename: string, format: string, storageUrl: string) {
    await dbConnect();
    const processed = await ProcessedFile.create({ datasetId, filename, format, storageUrl });
    return JSON.parse(JSON.stringify(processed.toJSON()));
  }

  static async createPipelineRun(datasetId: string, stage: string, status: PipelineStatus | string, logs?: string) {
    await dbConnect();
    const run = await PipelineRun.create({ datasetId, stage, status, logs });
    return JSON.parse(JSON.stringify(run.toJSON()));
  }

  static async updatePipelineRun(runId: string, status: PipelineStatus | string, logs?: string) {
    await dbConnect();
    const run = await PipelineRun.findByIdAndUpdate(
      runId,
      { status, logs, completedAt: new Date() },
      { returnDocument: 'after' }
    );
    return run ? JSON.parse(JSON.stringify(run.toJSON())) : null;
  }

  static async saveStatistics(datasetId: string, stats: any) {
    await dbConnect();
    const statistics = await DatasetStatistics.create({ datasetId, ...stats });
    return JSON.parse(JSON.stringify(statistics.toJSON()));
  }

  static async saveQualityReport(datasetId: string, report: any) {
    await dbConnect();
    const qualityReport = await DataQualityReport.create({ datasetId, ...report });
    return JSON.parse(JSON.stringify(qualityReport.toJSON()));
  }

  static async saveAiReport(datasetId: string, report: any) {
    await dbConnect();
    const aiReport = await AiAuditorReport.create({ datasetId, ...report });
    return JSON.parse(JSON.stringify(aiReport.toJSON()));
  }

  static async getDatasetHistory(userId?: string) {
    await dbConnect();
    const filter = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
    const datasets = await Dataset.find(filter)
      .populate('statistics')
      .populate('qualityReport')
      .populate('aiReport')
      .sort({ createdAt: -1 })
      .exec();

    return JSON.parse(JSON.stringify(datasets.map(d => d.toJSON())));
  }

  static async getDatasetResults(id: string) {
    await dbConnect();
    const dataset = await Dataset.findById(id)
      .populate('statistics')
      .populate('qualityReport')
      .populate('processedFile')
      .populate('aiReport')
      .populate({
        path: 'runs',
        options: { sort: { startedAt: 1 } }
      })
      .exec();

    return dataset ? JSON.parse(JSON.stringify(dataset.toJSON())) : null;
  }
}
