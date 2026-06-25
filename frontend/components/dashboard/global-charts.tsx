"use client";

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export function GlobalCharts({ history }: { history: any[] | undefined | null }) {
  if (history === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[300px] border border-dashed border-border/50 rounded-xl text-muted-foreground mt-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (history === null) {
    return (
      <div className="flex items-center justify-center min-h-[300px] border border-dashed border-red-500/50 rounded-xl text-red-500 bg-red-500/5 mt-8">
        Error loading analytics data.
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 border border-dashed border-border/50 rounded-xl text-center text-muted-foreground mt-8 min-h-[300px] flex items-center justify-center">
        Not enough historical datasets to display analytics.
      </div>
    );
  }

  // 1. Records Processed per Dataset
  const recordsData = history
    .filter(d => d.statistics)
    .map(d => ({
      name: d.filename.length > 15 ? d.filename.substring(0, 15) + '...' : d.filename,
      records: d.statistics.totalRecords || 0,
      valid: d.statistics.validRecords || 0,
    }))
    .slice(0, 15); // Top 15 datasets

  // 2. Aggregate Validation Errors
  const globalErrors: Record<string, number> = {};
  history.forEach((d) => {
    if (d.qualityReport?.validationErrors) {
      d.qualityReport.validationErrors.forEach((err: any) => {
        const type = err.errorType || 'UNKNOWN_ERROR';
        globalErrors[type] = (globalErrors[type] || 0) + 1;
      });
    }
  });

  const errorData = Object.keys(globalErrors)
    .map((type) => ({
      name: type.replace(/_/g, " "),
      count: globalErrors[type],
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Processing Time Analysis
  const processingTimeData = history
    .filter(d => d.statistics?.processingTimeMs)
    .map(d => ({
      name: d.filename.length > 15 ? d.filename.substring(0, 15) + '...' : d.filename,
      time: d.statistics.processingTimeMs || 0,
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Records per Dataset Chart */}
      <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Records Processed per Dataset</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {recordsData.length > 0 ? (
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recordsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  <Bar dataKey="records" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Records" />
                  <Bar dataKey="valid" fill="#10b981" radius={[4, 4, 0, 0]} name="Valid Records" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[300px] flex items-center justify-center border border-dashed border-border/50 rounded-md text-muted-foreground text-sm">
              Not enough historical datasets.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors Breakdown */}
      <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Global Validation Errors</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {errorData.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              <div className="w-full lg:w-1/2 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {errorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart layout="vertical" data={errorData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" width={100} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="w-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-border/50 rounded-md text-emerald-500 text-sm font-medium bg-emerald-500/10">
              <span className="text-2xl mb-2">🎉</span>
              No validation errors found!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Time Analysis */}
      <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg lg:col-span-2 min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">ETL Processing Time Analysis (ms)</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {processingTimeData.length > 0 ? (
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processingTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  <Bar dataKey="time" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Processing Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[300px] flex items-center justify-center border border-dashed border-border/50 rounded-md text-muted-foreground text-sm">
              Not enough historical datasets.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
