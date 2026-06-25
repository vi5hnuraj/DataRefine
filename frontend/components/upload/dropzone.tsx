"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function Dropzone() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      // 1. Get presigned URL
      const presignedRes = await fetch("/api/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      
      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { url } = await presignedRes.json();

      // 2. Upload directly to S3
      const uploadRes = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || 'application/octet-stream',
        },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload directly to S3");
      
      // Delay briefly to allow Lambda to create the dataset record in MongoDB
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      router.push("/history");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardContent className="p-0">
        <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed transition-colors cursor-pointer ${error ? 'border-destructive bg-destructive/10' : 'border-muted-foreground/25 hover:border-primary/50 bg-card/50 hover:bg-muted/50'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Uploading and processing dataset...</p>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-muted-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="text-lg font-semibold">Click to upload</p>
                <p className="text-sm text-muted-foreground">CSV, Excel, or JSON (max 10,000 rows)</p>
                {error && <Badge variant="destructive" className="mt-4">{error}</Badge>}
              </>
            )}
          </div>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".csv,.xlsx,.json" />
        </label>
      </CardContent>
    </Card>
  );
}
