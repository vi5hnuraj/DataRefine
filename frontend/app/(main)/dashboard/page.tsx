import Header from "@/components/header";
import { DatasetRepository } from "@/lib/repositories/dataset.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GlobalCharts } from "@/components/dashboard/global-charts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Database, CheckCircle, Target, Award, AlertTriangle, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function GlobalDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return null; // Handled by middleware redirect
  }
  const userId = (session.user as any).id;
  const history = await DatasetRepository.getDatasetHistory(userId);
  
  const totalDatasets = history.length;
  const completedJobs = history.filter((d: any) => d.status === 'COMPLETED').length;
  const failedJobs = history.filter((d: any) => d.status === 'FAILED').length;
  const totalRecords = history.reduce((acc: number, d: any) => acc + (d.statistics?.totalRecords || 0), 0);
  
  // Enriched datasets with Health Score logic
  const enrichedDatasets = history.map((dataset: any) => {
    let healthScore = 0;
    if (dataset.statistics && dataset.qualityReport) {
      const total = dataset.statistics.totalRecords || 1;
      const numErrors = dataset.qualityReport.validationErrors?.length || 0;
      const errorPenalty = Math.min((numErrors / total) * 50, 50);
      const duplicatePenalty = Math.min(((dataset.statistics.duplicateCount || 0) / total) * 30, 30);
      const totalColumns = Object.keys(dataset.statistics.columnStats || {}).length || 1;
      const nullPenalty = Math.min(((dataset.statistics.nullCount || 0) / (total * totalColumns)) * 20, 20);
      let score = 100 - errorPenalty - duplicatePenalty - nullPenalty;
      healthScore = Math.max(0, Math.round(score));
    }
    return { ...dataset, healthScore };
  });

  const validScores = enrichedDatasets.filter((d: any) => d.status === 'COMPLETED' && d.healthScore > 0);
  const avgQualityScore = validScores.length > 0 
    ? Math.round(validScores.reduce((acc: number, d: any) => acc + d.healthScore, 0) / validScores.length)
    : 0;

  // KPIs
  const topQualityDataset = validScores.length > 0 ? validScores.reduce((prev: any, current: any) => (prev.healthScore > current.healthScore) ? prev : current) : null;
  const lowestQualityDataset = validScores.length > 0 ? validScores.reduce((prev: any, current: any) => (prev.healthScore < current.healthScore) ? prev : current) : null;
  const successRate = totalDatasets > 0 ? Math.round((completedJobs / totalDatasets) * 100) : 0;

  // Largest Datasets
  const largestDatasets = [...enrichedDatasets]
    .sort((a, b) => (b.statistics?.totalRecords || 0) - (a.statistics?.totalRecords || 0))
    .slice(0, 5);

  // Performance Ranking
  const rankingDatasets = [...validScores]
    .sort((a, b) => b.healthScore - a.healthScore)
    .slice(0, 10);

  // AI Insights extraction
  const aiReports = enrichedDatasets.filter((d: any) => d.aiReport && d.aiReport.executiveSummary !== "AI review unavailable.").map((d: any) => ({ ...d.aiReport, filename: d.filename }));

  const allRisks = aiReports.flatMap((r: any) => r.keyRisks || []);
  const riskCounts = allRisks.reduce((acc: any, risk: string) => { acc[risk] = (acc[risk] || 0) + 1; return acc; }, {});
  const topRisks = Object.entries(riskCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);

  const allRecs = aiReports.flatMap((r: any) => r.recommendations || []);
  const recCounts = allRecs.reduce((acc: any, rec: string) => { acc[rec] = (acc[rec] || 0) + 1; return acc; }, {});
  const topRecs = Object.entries(recCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);

  const bestAiDataset = aiReports.length > 0 ? aiReports.reduce((prev: any, current: any) => (prev.aiQualityScore > current.aiQualityScore) ? prev : current) : null;
  const worstAiDataset = aiReports.length > 0 ? aiReports.reduce((prev: any, current: any) => (prev.aiQualityScore < current.aiQualityScore) ? prev : current) : null;

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <Header />
      <main className="flex-grow mx-auto max-w-[1400px] w-full px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Global Analytics Dashboard
          </h1>
        </div>

        {/* Level 1 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/50 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Records Processed</p>
                  <p className="text-3xl font-bold text-foreground">{totalRecords.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across {totalDatasets} datasets</p>
                </div>
                <Database className="w-5 h-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Global Average Score</p>
                  <p className="text-3xl font-bold text-purple-500">{avgQualityScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall data health</p>
                </div>
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pipeline Success Rate</p>
                  <p className="text-3xl font-bold text-emerald-500">{successRate}%</p>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${successRate}%` }}></div>
                  </div>
                </div>
                <Target className="w-5 h-5 text-emerald-500 ml-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-md border-border/50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Top Quality Dataset</p>
                  <p className="text-lg font-bold text-emerald-500 truncate max-w-[150px]" title={topQualityDataset?.filename}>
                    {topQualityDataset ? topQualityDataset.filename : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score: {topQualityDataset ? topQualityDataset.healthScore : 0}/100
                  </p>
                </div>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Charts Grid */}
        <GlobalCharts history={enrichedDatasets} />

        {/* AI Insights Overview */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">🤖</span> AI Insights Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-md border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-md text-orange-400">Most Common AI Risks</CardTitle>
              </CardHeader>
              <CardContent>
                {topRisks.length > 0 ? (
                  <ul className="space-y-3">
                    {topRisks.map(([risk, count]: any, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-muted-foreground mr-4">{risk}</span>
                        <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30 whitespace-nowrap">{count} {count === 1 ? 'dataset' : 'datasets'}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No AI risks generated yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-md border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-md text-emerald-400">Top AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {topRecs.length > 0 ? (
                  <ul className="space-y-3">
                    {topRecs.map(([rec, count]: any, idx) => (
                      <li key={idx} className="flex justify-between items-start border-b border-border/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-muted-foreground mr-4">{rec}</span>
                        <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30 whitespace-nowrap">{count} {count === 1 ? 'dataset' : 'datasets'}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No AI recommendations generated yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-md border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] lg:col-span-2">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2"><Award className="w-4 h-4" /> Highest Rated by AI</h4>
                    {bestAiDataset ? (
                      <div className="bg-muted/30 p-3 rounded-lg border border-emerald-500/20">
                        <p className="font-medium text-sm text-foreground truncate">{bestAiDataset.filename}</p>
                        <p className="text-xs text-emerald-500 mt-1">AI Score: {bestAiDataset.aiQualityScore}/100 • {bestAiDataset.productionReadiness}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">AI Confidence: {bestAiDataset.confidenceScore > 90 ? '🟢 High' : bestAiDataset.confidenceScore >= 70 ? '🟡 Medium' : '🔴 Low'} ({bestAiDataset.confidenceScore || 0}%)</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Lowest Rated by AI</h4>
                    {worstAiDataset ? (
                      <div className="bg-muted/30 p-3 rounded-lg border border-red-500/20">
                        <p className="font-medium text-sm text-foreground truncate">{worstAiDataset.filename}</p>
                        <p className="text-xs text-red-500 mt-1">AI Score: {worstAiDataset.aiQualityScore}/100 • {worstAiDataset.productionReadiness}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">AI Confidence: {worstAiDataset.confidenceScore > 90 ? '🟢 High' : worstAiDataset.confidenceScore >= 70 ? '🟡 Medium' : '🔴 Low'} ({worstAiDataset.confidenceScore || 0}%)</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" /> Top 5 Largest Datasets
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dataset</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Total Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {largestDatasets.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No datasets</TableCell></TableRow>
                  ) : largestDatasets.map((dataset: any) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">{dataset.filename}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(dataset.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-mono text-blue-500">{dataset.statistics?.totalRecords || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" /> Dataset Performance Ranking
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Dataset</TableHead>
                    <TableHead className="text-right">Health Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankingDatasets.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">No valid datasets</TableCell></TableRow>
                  ) : rankingDatasets.map((dataset: any, index: number) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium text-muted-foreground">#{index + 1}</TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">{dataset.filename}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={dataset.healthScore >= 90 ? "border-emerald-500 text-emerald-500" : dataset.healthScore >= 70 ? "border-yellow-500 text-yellow-500" : "border-red-500 text-red-500"}>
                          {dataset.healthScore}/100
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
