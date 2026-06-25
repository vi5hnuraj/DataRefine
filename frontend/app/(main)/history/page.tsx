import { DatasetRepository } from '@/lib/repositories/dataset.repository';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoRefresh } from './auto-refresh';
import { HistoryDataTable } from '@/components/history/history-data-table';

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  console.log("HISTORY PAGE SESSION:", JSON.stringify(session, null, 2));
  
  if (!session || !session.user || !(session.user as any).id) {
    console.log("Session or user ID missing, returning null");
    return null; // Handled by middleware redirect
  }
  
  const userId = (session.user as any).id;
  const datasets = await DatasetRepository.getDatasetHistory(userId);
  console.log("FETCHED DATASETS LENGTH:", datasets.length);
  const isPollingNeeded = datasets.some((d: any) => d.status === 'PENDING' || d.status === 'PROCESSING');

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-6">
      <AutoRefresh isPollingNeeded={isPollingNeeded} />
      <h1 className="text-3xl font-bold tracking-tight mb-6">Dataset History</h1>
      <HistoryDataTable datasets={datasets} />
    </div>
  );
}
