"use client";

import { createContext, ReactNode, useState } from "react";

export const Context = createContext<{
  streamPromise?: Promise<ReadableStream>;
  setStreamPromise: (v: Promise<ReadableStream> | undefined) => void;
}>({
  setStreamPromise: () => {},
});

import { AuthProvider } from "@/components/auth-provider";

export default function Providers({ children }: { children: ReactNode }) {
  const [streamPromise, setStreamPromise] = useState<Promise<ReadableStream>>();

  return (
    <AuthProvider>
      <Context value={{ streamPromise, setStreamPromise }}>{children}</Context>
    </AuthProvider>
  );
}
