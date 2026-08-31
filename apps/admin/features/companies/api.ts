"use client";

import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Company } from "./types";

// The resource-hook factory covers: useList, useDetail, useCreate, useUpdate, useDelete
// For companies we don't use the factory's useDelete (it maps to hard-delete by default).
// We expose deactivate and hardDelete as separate named mutations below.
const queryClient_ = () => {
  // lazy — accessed inside hook body where React context exists
  // biome-ignore lint/react-hooks/rules-of-hooks: called inside hooks only
  return useQueryClient();
};

export const companyHooks = createResourceHooks<Company, never, never>(
  "companies",
  endpoints.companies,
  apiClient,
  // queryClient injected at call-site; factory accepts it as 4th arg
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  null as any,
);

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

/** List all companies */
export function useCompanies(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["companies", "list", params],
    queryFn: async () => {
      const data = await apiClient.get<{ companies: Company[] }>(
        endpoints.companies,
        params,
      );
      return data.companies;
    },
  });
}

/** Single company by id */
export function useCompany(id: string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: async () => {
      const data = await apiClient.get<{ company?: Company } & Company>(
        `${endpoints.companies}/${id}`,
      );
      return data.company || data;
    },
  });
}
