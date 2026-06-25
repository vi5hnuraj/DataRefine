import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatasetRepository } from "@/lib/repositories/dataset.repository";

export async function RecentActivity({ currentId }: { currentId: string }) {
  const history = await DatasetRepository.getDatasetHistory();
  const recent = history.filter((d: any) => d.id !== currentId).slice(0, 5);

  return (
    <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Processing Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other recent activity.</p>
        ) : (
          <div className="space-y-4">
            {recent.map((dataset: any) => (
              <Link 
                href={`/results/${dataset.id}`} 
                key={dataset.id}
                className="flex flex-col gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate max-w-[150px]" title={dataset.filename}>
                    {dataset.filename}
                  </p>
                  <Badge variant={dataset.status === "COMPLETED" ? "default" : dataset.status === "FAILED" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {dataset.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(dataset.createdAt).toLocaleDateString()} at {new Date(dataset.createdAt).toLocaleTimeString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
