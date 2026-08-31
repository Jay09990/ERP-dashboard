"use client";

import type { ReactNode } from "react";

import { useSessionCheck } from "@/hooks/use-session-check";

export function SessionProvider({ children }: { children: ReactNode }) {
  useSessionCheck();
  return <>{children}</>;
}
