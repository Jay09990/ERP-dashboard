"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { queryClient } from "@/lib/query-client";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}><ThemeProvider><SessionProvider>{children}</SessionProvider></ThemeProvider></QueryClientProvider>;
}