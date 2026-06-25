import * as fs from 'fs';
import Papa from 'papaparse';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

async function getS3ObjectAsString(s3Url: string, format?: string): Promise<string | null> {
  if (!s3Url.startsWith('s3://')) return null;
  const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-north-1' });
  const [bucket, ...keyParts] = s3Url.replace('s3://', '').split('/');
  const key = keyParts.join('/');
  try {
    // Only fetch the first 20KB for CSV previews to prevent memory issues.
    // For JSON we must fetch the whole file to avoid SyntaxError on parse.
    const commandParams: any = { Bucket: bucket, Key: key };
    if (format === 'csv') {
        commandParams.Range = 'bytes=0-20000';
    }
    const response = await s3Client.send(new GetObjectCommand(commandParams));
    const str = await response.Body?.transformToString('utf-8');
    return str || null;
  } catch (err) {
    console.error("S3 error:", err);
    return null;
  }
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatColumnLabel } from "@/lib/utils/format";

export async function DatasetPreview({ dataset }: { dataset: any }) {
  // Parse Original
  let originalData: any[] = [];
  let originalCols: string[] = [];
  try {
    if (dataset.storageUrl) {
      if (dataset.storageUrl.startsWith('s3://')) {
        const chunk = await getS3ObjectAsString(dataset.storageUrl, dataset.format);
        if (chunk) {
          if (dataset.format === 'csv') {
            const parsed = Papa.parse(chunk, { header: true, preview: 10 });
            originalData = parsed.data;
            originalCols = parsed.meta.fields || [];
          } else {
            const parsed = JSON.parse(chunk);
            originalData = Array.isArray(parsed) ? parsed.slice(0, 10) : [];
            if (originalData.length > 0) originalCols = Object.keys(originalData[0]);
          }
        }
      } else if (fs.existsSync(dataset.storageUrl)) {
        if (dataset.format === 'csv') {
          const chunk = fs.readFileSync(dataset.storageUrl, 'utf8');
          const parsed = Papa.parse(chunk, { header: true, preview: 10 });
          originalData = parsed.data;
          originalCols = parsed.meta.fields || [];
        } else {
          const str = fs.readFileSync(dataset.storageUrl, 'utf8');
          const parsed = JSON.parse(str);
          originalData = Array.isArray(parsed) ? parsed.slice(0, 10) : [];
          if (originalData.length > 0) originalCols = Object.keys(originalData[0]);
        }
      }
    }
  } catch (e) {
    console.error("Preview original err", e);
  }

  // Parse Processed
  let processedData: any[] = [];
  let processedCols: string[] = [];
  try {
    if (dataset.processedFile?.storageUrl) {
      let str = null;
      if (dataset.processedFile.storageUrl.startsWith('s3://')) {
        str = await getS3ObjectAsString(dataset.processedFile.storageUrl, dataset.processedFile.format);
      } else if (fs.existsSync(dataset.processedFile.storageUrl)) {
        str = fs.readFileSync(dataset.processedFile.storageUrl, 'utf8');
      }
      
      if (str) {
        if (dataset.processedFile.format === 'csv') {
            const parsed = Papa.parse(str, { header: true, preview: 10 });
            processedData = parsed.data;
            processedCols = parsed.meta.fields || [];
        } else {
            const parsed = JSON.parse(str);
            processedData = Array.isArray(parsed) ? parsed.slice(0, 10) : [];
            if (processedData.length > 0) processedCols = Object.keys(processedData[0]);
        }
      }
    }
  } catch (e) {
    console.error("Preview processed err", e);
  }

  const totalRecords = dataset.statistics?.totalRecords || 0;
  const colCount = Object.keys(dataset.statistics?.numericColumns || {}).length || originalCols.length || processedCols.length;
  
  // Extract unique data types from columnStats
  const typeSet = new Set<string>();
  if (dataset.statistics?.numericColumns) {
    Object.values(dataset.statistics.numericColumns).forEach((stat: any) => typeSet.add('number'));
  }
  const dataTypes = typeSet.size > 0 ? Array.from(typeSet).join(", ") : "Mixed";

  const renderTable = (data: any[], cols: string[]) => {
    if (data.length === 0) return <p className="text-muted-foreground p-8 text-sm text-center border border-dashed rounded-md min-h-[200px] flex items-center justify-center">Preview not available.</p>;
    return (
      <div className="overflow-x-auto rounded-md border border-border/50 max-h-[400px]">
        <Table className="text-xs min-w-max">
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              {cols.map((col) => (
                <TableHead key={col} className="whitespace-nowrap px-4 py-3">{formatColumnLabel(col)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {cols.map((col) => (
                  <TableCell key={col} className="whitespace-nowrap truncate max-w-[300px] px-4 py-2 border-r border-border/10 last:border-0">
                    {String(row[col] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px] flex flex-col">
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-border/50 gap-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Row Count</p>
              <p className="text-lg font-semibold text-foreground">{totalRecords.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Column Count</p>
              <p className="text-lg font-semibold text-foreground">{colCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Detected Types</p>
              <p className="text-sm font-medium text-foreground mt-1 max-w-[200px] truncate">{dataTypes}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Cleaned</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">Modified</span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">Validated</span>
          </div>
        </div>

        <Tabs defaultValue="processed" className="w-full flex-grow flex flex-col">
          <TabsList className="mb-4 inline-flex self-start">
            <TabsTrigger value="processed">Processed Dataset</TabsTrigger>
            <TabsTrigger value="original">Original Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="processed" className="mt-0 flex-grow">
            {renderTable(processedData, processedCols)}
            <p className="text-xs text-muted-foreground mt-4 text-right">Showing top 10 rows max</p>
          </TabsContent>
          
          <TabsContent value="original" className="mt-0 flex-grow">
            {renderTable(originalData, originalCols)}
            <p className="text-xs text-muted-foreground mt-4 text-right">Showing top 10 rows max</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
