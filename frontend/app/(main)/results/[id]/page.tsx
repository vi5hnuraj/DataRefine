import { DatasetRepository } from '@/lib/repositories/dataset.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResultsCharts } from '@/components/results/results-charts';
import { DatasetHealth } from '@/components/results/dataset-health';
import { DatasetPreview } from '@/components/results/dataset-preview';
import Header from '@/components/header';
import { Download, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatColumnLabel, formatErrorMessage } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const dataset = await DatasetRepository.getDatasetResults(resolvedParams.id);
  const history = await DatasetRepository.getDatasetHistory();

  if (!dataset) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md bg-card/80 backdrop-blur-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Dataset not found. The ID may be invalid or the dataset was deleted.
              <div className="mt-4">
                <Link href="/history" className="text-sm font-medium hover:underline">← Back to History</Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isProcessing = dataset.status === 'PENDING' || dataset.status === 'PROCESSING';

  // Compute Global Metrics
  const totalDatasets = history.length;
  const successCount = history.filter((d: any) => d.status === 'COMPLETED').length;
  const successRate = totalDatasets > 0 ? Math.round((successCount / totalDatasets) * 100) : 0;
  const totalRecordsAll = history.reduce((acc: number, d: any) => acc + (d.statistics?.totalRecords || 0), 0);
  const avgRecords = totalDatasets > 0 ? Math.round(totalRecordsAll / totalDatasets) : 0;
  const lastProcessingDate = history.length > 0 ? new Date(history[0].createdAt).toLocaleDateString() : 'N/A';

  const stats = dataset.statistics || {};
  const quality = dataset.qualityReport || {};
  const runs = dataset.runs || [];

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <Header />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 pt-8">
        <div className="mb-8">
          <Link href="/history" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {dataset.filename}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Uploaded at {new Date(dataset.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge
              className={`text-sm px-4 py-1.5 ${dataset.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : dataset.status === 'FAILED' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}
              variant="outline"
            >
              {dataset.status}
            </Badge>
          </div>
        </div>

        {isProcessing && (
          <Alert className="mb-8 border-blue-500/50 bg-blue-500/10">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <AlertTitle className="text-blue-500 font-semibold">Processing Pipeline Running</AlertTitle>
            <AlertDescription className="text-blue-500/80">
              The ETL pipeline is currently processing this dataset. Results will appear here once complete.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-8">
          {/* Section A: Dataset Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Records", value: stats.totalRecords?.toLocaleString() || "0", color: "blue" },
              { label: "Valid Records", value: stats.validRecords?.toLocaleString() || "0", color: "emerald" },
              { label: "Duplicate Records", value: stats.duplicateRecords?.toLocaleString() || "0", color: "orange" },
              { label: "Null Values Found", value: stats.nullValues?.toLocaleString() || "0", color: "red" },
              { label: "Processing Time", value: stats.processingTimeMs ? `${stats.processingTimeMs}ms` : "N/A", color: "purple" },
              { label: "Success Rate", value: `${successRate}%`, color: "emerald" },
              { label: "Avg Records/Dataset", value: avgRecords.toLocaleString(), color: "blue" },
              { label: "Last Processing", value: lastProcessingDate, color: "muted" },
            ].map((kpi, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-md border-border/50">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 truncate">{kpi.label}</p>
                  <p className={`text-2xl font-bold text-${kpi.color}-500`}>{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Section B: Dataset Insights & Download Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <DatasetHealth statistics={stats} qualityReport={quality} />
            </div>
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-md border-border/50 min-h-[300px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Download Center</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 flex-grow">
                <a href={`/api/download?path=${dataset.storageUrl}`} target="_blank" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50">
                  <span className="text-sm font-medium">Original File</span>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
                {dataset.processedFile && (
                  <a href={`/api/download?path=${dataset.processedFile.storageUrl}`} target="_blank" className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors border border-emerald-500/20">
                    <span className="text-sm font-medium">Processed Dataset</span>
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <a href={`/api/report?id=${dataset.id}&type=quality`} target="_blank" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50">
                  <span className="text-sm font-medium">Quality Report (HTML)</span>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
                <a href={`/api/report?id=${dataset.id}&type=stats`} target="_blank" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50">
                  <span className="text-sm font-medium">Statistics (JSON)</span>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Section C: AI Auditor Review */}
          {dataset.aiReport && dataset.aiReport.executiveSummary !== "AI review unavailable." && (
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-card/50 backdrop-blur-md border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">🤖</span> AI Auditor Review
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={`px-3 py-1 ${dataset.aiReport.confidenceScore > 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : dataset.aiReport.confidenceScore >= 70 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                        AI Confidence: {dataset.aiReport.confidenceScore > 90 ? '🟢 High' : dataset.aiReport.confidenceScore >= 70 ? '🟡 Medium' : '🔴 Low'} ({dataset.aiReport.confidenceScore || 0}%)
                      </Badge>
                      <Badge variant="outline" className={`px-3 py-1 ${dataset.aiReport.productionReadiness.includes('Not Ready') ? 'bg-red-500/10 text-red-500 border-red-500/30' : dataset.aiReport.productionReadiness.includes('Minor') ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                        Production Readiness: {dataset.aiReport.productionReadiness}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">Executive Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{dataset.aiReport.executiveSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-400 mb-2">Data Quality Assessment</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{dataset.aiReport.dataQualityAssessment}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-orange-400 mb-2">Key Risks</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {dataset.aiReport.keyRisks.map((risk: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">{risk}</li>
                        ))}
                        {dataset.aiReport.keyRisks.length === 0 && <li className="text-sm text-muted-foreground">No significant risks identified.</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-400 mb-2">Recommendations</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        {dataset.aiReport.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                        ))}
                        {dataset.aiReport.recommendations.length === 0 && <li className="text-sm text-muted-foreground">No recommendations.</li>}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section D: ETL Execution Summary & Dataset Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur-md border-border/50 flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">ETL Execution Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center">
                <ul className="space-y-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Extracted raw dataset ({stats.totalRecords || 0} rows)
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    Found {stats.invalidRecords || 0} validation errors
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    Removed {stats.duplicateRecords || 0} duplicate hashes
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Standardized {stats.nullValues || 0} null values
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Transformed and output {stats.validRecords || 0} clean rows
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-md border-border/50 flex flex-col">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Dataset Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 flex-grow flex flex-col justify-center">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Original Rows</span>
                  <span className="text-sm font-semibold">{stats.totalRecords || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Duplicates Removed</span>
                  <span className="text-sm font-semibold text-orange-500">-{stats.duplicateRecords || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Empty Rows Removed</span>
                  <span className="text-sm font-semibold text-red-500">-{quality.emptyRowsRemoved || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-emerald-500">Processed Rows</span>
                  <span className="text-sm font-bold text-emerald-500">{stats.validRecords || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Assessment Comparison Card */}
            {dataset.aiReport && dataset.aiReport.executiveSummary !== "AI review unavailable." && (
              <Card className="bg-card/50 backdrop-blur-md border-purple-500/30 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Assessment Comparison</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">ETL Assessment</p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-xl font-bold text-blue-500">
                        {/* We use a quick hack to calculate the ETL score identical to dataset-health.tsx */}
                        {(() => {
                          const t = stats?.totalRecords || 1;
                          const e = quality?.validationErrors?.length || 0;
                          const ep = Math.min((e / t) * 50, 50);
                          const dp = Math.min(((stats?.duplicateRecords || 0) / t) * 30, 30);
                          const np = Math.min(((stats?.nullValues || 0) / (t * 1)) * 20, 20);
                          return Math.max(0, Math.round(100 - ep - dp - np));
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-xs font-semibold text-purple-400 mb-1 uppercase tracking-wider">AI Assessment</p>
                    <div className="flex justify-between items-end">
                      <span className="text-sm">Quality Score</span>
                      <span className="text-xl font-bold text-purple-400">{dataset.aiReport.aiQualityScore}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic mt-2">
                    * AI may identify semantic data risks not reflected in the deterministic numeric score.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Section D: Analytics Charts */}
          <ResultsCharts statistics={stats} qualityReport={quality} />

          {/* Section E: Dataset Preview */}
          <DatasetPreview dataset={dataset} />

          {/* Section F: Data Quality Report Table */}
          <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Validation Error Detail</CardTitle>
            </CardHeader>
            <CardContent>
              {quality.validationErrors && quality.validationErrors.length > 0 ? (
                <div className="overflow-x-auto border rounded-md border-border/50 max-h-96">
                  <Table className="text-xs min-w-full">
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-24 whitespace-nowrap">Row Number</TableHead>
                        <TableHead className="whitespace-nowrap">Column Name</TableHead>
                        <TableHead className="whitespace-nowrap">Error Type</TableHead>
                        <TableHead className="min-w-[300px]">Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quality.validationErrors.slice(0, 100).map((err: any, i: number) => {
                        const rowNum = err.row ?? err.rowIndex;
                        return (
                          <TableRow key={i}>
                            <TableCell className="font-mono">{rowNum !== undefined ? rowNum + 1 : "-"}</TableCell>
                            <TableCell className="font-medium text-blue-500 whitespace-nowrap">{formatColumnLabel(err.column)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/20 bg-red-500/10">
                                {err.errorType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatErrorMessage(err.message, err.column)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center border rounded-md border-border/50 border-dashed min-h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No validation errors found! Perfect health.</p>
                </div>
              )}
              {quality.validationErrors?.length > 100 && (
                <p className="text-xs text-muted-foreground mt-4 text-right">Showing first 100 errors. Download report for full details.</p>
              )}
            </CardContent>
          </Card>

          {/* Section G: Pipeline Execution Timeline (Horizontal) */}
          <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">ETL Pipeline Timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center">
              {runs.length > 0 ? (
                <div className="flex flex-col md:flex-row w-full gap-4 relative">
                  {runs.map((r: any, idx: number) => {
                    const start = new Date(r.startedAt);
                    const end = r.completedAt ? new Date(r.completedAt) : new Date();
                    const durationMs = r.completedAt ? end.getTime() - start.getTime() : 0;

                    return (
                      <div key={r.id} className="flex-1 min-w-[200px] flex flex-col relative z-10">
                        {/* Connecting Line for Desktop */}
                        {idx !== runs.length - 1 && (
                          <div className="hidden md:block absolute top-6 left-[50%] w-full h-[2px] bg-border/50 -z-10"></div>
                        )}
                        {/* Connecting Line for Mobile */}
                        {idx !== runs.length - 1 && (
                          <div className="md:hidden absolute top-6 left-6 w-[2px] h-full bg-border/50 -z-10"></div>
                        )}

                        <div className="flex md:flex-col items-center gap-4 md:gap-3">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-muted shadow z-10 shrink-0">
                            <div className={`w-3 h-3 rounded-full ${r.status === 'COMPLETED' ? 'bg-emerald-500' : r.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></div>
                          </div>

                          <div className="flex-1 w-full p-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-foreground">{r.stage}</span>
                              <Badge variant={r.status === 'COMPLETED' ? 'default' : r.status === 'FAILED' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                {r.status}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-1 text-[10px] text-muted-foreground border-t border-border/50 pt-2">
                              <div className="flex justify-between">
                                <span>Start:</span>
                                <span>{start.toLocaleTimeString()}</span>
                              </div>
                              {r.completedAt && (
                                <div className="flex justify-between">
                                  <span>End:</span>
                                  <span>{end.toLocaleTimeString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-medium text-foreground mt-1">
                                <span>Duration:</span>
                                <span>{durationMs}ms</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full flex items-center justify-center border border-dashed border-border/50 rounded-md text-muted-foreground text-sm p-8 min-h-[200px]">
                  No pipeline runs found.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
