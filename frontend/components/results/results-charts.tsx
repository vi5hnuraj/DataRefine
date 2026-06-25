"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#10b981", "#8b5cf6", "#3b82f6", "#f43f5e", "#f59e0b"];

export function ResultsCharts({ statistics, qualityReport }: { statistics: any, qualityReport: any }) {
  if (!statistics) {
    return (
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center min-h-[300px] border border-dashed border-border/50 rounded-xl text-muted-foreground mt-8">
        No dataset statistics available to visualize.
      </div>
    );
  }

  const pieData = [
    { name: "Valid Records", value: statistics?.validRecords || 0 },
    { name: "Invalid Records", value: statistics?.invalidRecords || 0 },
  ].filter(d => d.value > 0);

  // Aggregate errors by type
  const errorCounts: Record<string, number> = {};
  if (qualityReport && qualityReport.validationErrors) {
    qualityReport.validationErrors.forEach((err: any) => {
      const type = err.errorType || 'UNKNOWN_ERROR';
      errorCounts[type] = (errorCounts[type] || 0) + 1;
    });
  }

  const barData = Object.keys(errorCounts).map((type) => ({
    name: type.replace(/_/g, " "),
    count: errorCounts[type],
  }));

  // Dummy area chart for metrics since we only have one run
  const areaData = [
    { name: "Start", records: 0 },
    { name: "Extracted", records: statistics?.totalRecords || 0 },
    { name: "Cleaned", records: (statistics?.totalRecords || 0) - (statistics?.duplicateRecords || 0) - (qualityReport?.emptyRowsRemoved || 0) },
    { name: "Validated", records: statistics?.validRecords || 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Valid vs Invalid Records</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {pieData.length > 0 ? (
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[300px] flex items-center justify-center border border-dashed border-border/50 rounded-md text-muted-foreground text-sm">
              Insufficient data for records chart.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Validation Errors by Type</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {barData.length > 0 ? (
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-border/50 rounded-md text-emerald-500 text-sm font-medium bg-emerald-500/10">
              <span className="text-2xl mb-2">🎉</span>
              No validation errors found!
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg md:col-span-2 lg:col-span-1 min-h-[300px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Dataset Processing Metrics</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {areaData.some(d => d.records > 0) ? (
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="records" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full min-h-[300px] flex items-center justify-center border border-dashed border-border/50 rounded-md text-muted-foreground text-sm">
              Insufficient metric data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
