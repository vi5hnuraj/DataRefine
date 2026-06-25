import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DatasetHealth({ statistics, qualityReport }: { statistics: any, qualityReport: any }) {
  const total = statistics?.totalRecords || 1;
  const numErrors = qualityReport?.validationErrors?.length || 0;
  
  // Calculate penalty percentages
  const errorPenalty = Math.min((numErrors / total) * 50, 50); // up to 50 pts
  const duplicatePenalty = Math.min(((statistics?.duplicateRecords || 0) / total) * 30, 30); // up to 30 pts
  
  const totalColumns = Object.keys(statistics?.columnStats || {}).length || 1;
  const nullPenalty = Math.min(((statistics?.nullValues || 0) / (total * totalColumns)) * 20, 20); // up to 20 pts
  
  let score = 100 - errorPenalty - duplicatePenalty - nullPenalty;
  score = Math.max(0, Math.round(score));
  
  let rating = "Excellent";
  let colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  let textColor = "text-emerald-500";
  
  if (score < 70) {
    rating = "Needs Attention";
    colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
    textColor = "text-red-500";
  } else if (score < 90) {
    rating = "Good";
    colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
    textColor = "text-blue-500";
  }

  return (
    <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Dataset Health Score</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-5xl font-bold tracking-tight ${textColor}`}>{score}</h2>
            <span className="text-muted-foreground">/ 100</span>
          </div>
        </div>
        <Badge variant="outline" className={`px-4 py-2 rounded-full text-sm font-medium ${colorClass}`}>
          {rating}
        </Badge>
      </CardContent>
    </Card>
  );
}
