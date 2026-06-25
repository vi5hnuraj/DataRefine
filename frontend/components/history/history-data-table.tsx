"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export function HistoryDataTable({ datasets }: { datasets: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"createdAt" | "processingTime" | "healthScore">("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Compute enriched data with health score
  const enrichedData = datasets.map(d => {
    let healthScore = 0;
    if (d.statistics && d.qualityReport) {
      const total = d.statistics.totalRecords || 1;
      const numErrors = d.qualityReport.validationErrors?.length || 0;
      const errorPenalty = Math.min((numErrors / total) * 50, 50);
      const duplicatePenalty = Math.min(((d.statistics.duplicateRecords || 0) / total) * 30, 30);
      const totalColumns = Object.keys(d.statistics.columnStats || {}).length || 1;
      const nullPenalty = Math.min(((d.statistics.nullValues || 0) / (total * totalColumns)) * 20, 20);
      let score = 100 - errorPenalty - duplicatePenalty - nullPenalty;
      healthScore = Math.max(0, Math.round(score));
    }

    return { ...d, healthScore };
  });

  // Filter
  const filteredData = enrichedData.filter(d => {
    const matchesSearch = d.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    if (sortField === "createdAt") {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === "processingTime") {
      comparison = (a.statistics?.processingTimeMs || 0) - (b.statistics?.processingTimeMs || 0);
    } else if (sortField === "healthScore") {
      comparison = a.healthScore - b.healthScore;
    }
    return sortAsc ? comparison : -comparison;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
    setCurrentPage(1);
  };

  const formatTime = (ms: number) => {
    if (!ms) return "-";
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-9 bg-card/50 backdrop-blur-md"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
            <SelectTrigger className="bg-card/50 backdrop-blur-md">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-md bg-card/50 backdrop-blur-md overflow-x-auto">
        <table className="min-w-full divide-y divide-border/50">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dataset</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('createdAt')}>
                <div className="flex items-center gap-1">Upload Date <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Records</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('processingTime')}>
                <div className="flex items-center gap-1">Processing Time <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('healthScore')}>
                <div className="flex items-center gap-1">Health <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No datasets found.</td>
              </tr>
            )}
            {paginatedData.map(d => (
              <tr key={d.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm truncate max-w-[200px]" title={d.filename}>{d.filename}</span>
                    <Badge variant="outline" className="w-fit text-[10px] py-0">{d.format?.toUpperCase() || 'CSV'}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(d.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {d.status === 'COMPLETED' && <Badge className="bg-green-500 hover:bg-green-600 border-transparent text-white shadow">{d.status}</Badge>}
                  {d.status === 'FAILED' && <Badge variant="destructive">{d.status}</Badge>}
                  {d.status === 'PROCESSING' && <Badge className="bg-blue-500 hover:bg-blue-600 border-transparent text-white shadow">{d.status}</Badge>}
                  {d.status === 'PENDING' && <Badge className="bg-yellow-500 hover:bg-yellow-600 border-transparent text-white shadow">{d.status}</Badge>}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="font-mono">{d.statistics?.validRecords || 0}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                  {formatTime(d.statistics?.processingTimeMs)}
                </td>
                <td className="px-4 py-3">
                  {d.status === 'COMPLETED' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${d.healthScore}%` }}></div>
                      </div>
                      <span className="text-xs font-medium">{d.healthScore}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <Link href={`/results/${d.id}`} className="text-primary hover:text-primary/80 transition-colors">View Results</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
