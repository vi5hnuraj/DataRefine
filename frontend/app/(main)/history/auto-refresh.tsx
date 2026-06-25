"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoRefresh({ isPollingNeeded }: { isPollingNeeded: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!isPollingNeeded) return;
    const intervalId = setInterval(() => {
      router.refresh();
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isPollingNeeded, router]);

  return null;
}
