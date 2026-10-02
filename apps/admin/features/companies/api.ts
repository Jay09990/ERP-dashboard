"use client";

import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Company } from "./types";

// ── Shared hooks (follow ERP pattern: createResourceHooks called inside each hook) ──

export function useCompanies(params?: Record<string, string>) {
  const qc = useQueryClient();
  return createResourceHooks<Company, never, never>(
    "companies",
    endpoints.companies,
    apiClient,
    qc,
  ).useList(params);
}

export function useCompany(id: string) {
  const qc = useQueryClient();
  return createResourceHooks<Company, never, never>(
    "companies",
    endpoints.companies,
    apiClient,
    qc,
  ).useDetail(id);
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return createResourceHooks<Company, never, never>(
    "companies",
    endpoints.companies,
    apiClient,
    qc,
  ).useCreate();
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return createResourceHooks<Company, never, never>(
    "companies",
    endpoints.companies,
    apiClient,
    qc,
  ).useUpdate();
}

// ── Custom mutations (not covered by the generic factory) ─────────────────────

/** Soft-deactivate: DELETE /api/admin/companies/:id (does NOT drop the DB) */
export function useDeactivateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete<{ message: string }>(endpoints.company(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

/** Hard-delete: DELETE /api/admin/companies/:id/harddelete (drops tenant DB) */
export function useHardDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete<{ message: string }>(endpoints.companyHardDelete(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

/** Change status: POST /api/change_status/:companyId/:status */
export function useChangeCompanyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: { id: number; status: "active" | "inactive" }) =>
      apiClient.post<{ message: string }>(
        endpoints.changeCompanyStatus(id, status),
        {},
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

/** List all companies (alias for useCompanies for backward compat) */
export function useListCompanies(params?: Record<string, string>) {
  return useCompanies(params);
}
