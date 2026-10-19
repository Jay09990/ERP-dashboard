"use client";

import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Company } from "./types";

type CompanyListResponse =
  | Company[]
  | { companies?: Company[]; data?: unknown; rows?: Company[] };
type CompanyApiRecord = Company & {
  db_username?: string;
  db_password?: string;
};
type CompanyDetailResponse =
  | CompanyApiRecord
  | {
      company?: CompanyApiRecord;
      companies?: CompanyApiRecord[];
      data?: unknown;
    };

function removeDatabaseCredentials(company: CompanyApiRecord): Company {
  const {
    db_username: _username,
    db_password: _password,
    ...safeCompany
  } = company;
  return safeCompany;
}

function normalizeCompanyList(response: CompanyListResponse): Company[] {
  if (Array.isArray(response)) return response.map(removeDatabaseCredentials);
  if (Array.isArray(response.companies)) {
    return response.companies.map(removeDatabaseCredentials);
  }
  if (Array.isArray(response.rows)) {
    return response.rows.map(removeDatabaseCredentials);
  }
  if (response.data !== undefined) {
    return normalizeCompanyList(response.data as CompanyListResponse);
  }
  throw new Error("The companies response did not contain a company list.");
}

export const companiesQueryKey = (params?: Record<string, string>) =>
  ["companies", "list", params] as const;

export async function fetchCompanies(params?: Record<string, string>) {
  return normalizeCompanyList(
    await apiClient.get<CompanyListResponse>(endpoints.companies, params),
  );
}

function normalizeCompany(
  response: CompanyDetailResponse,
  id: string,
): Company {
  if ("company_id" in response) return removeDatabaseCredentials(response);
  if (response.company) return removeDatabaseCredentials(response.company);
  if (Array.isArray(response.companies)) {
    const company = response.companies.find(
      (item) => String(item.company_id) === id,
    );
    if (company) return removeDatabaseCredentials(company);
    if (response.companies.length === 1) {
      return removeDatabaseCredentials(response.companies[0]);
    }
  }
  if (response.data !== undefined) {
    return normalizeCompany(response.data as CompanyDetailResponse, id);
  }
  throw new Error("The company response did not contain company details.");
}

// ── Shared hooks (follow ERP pattern: createResourceHooks called inside each hook) ──

export function useCompanies(params?: Record<string, string>) {
  return useQuery({
    queryKey: companiesQueryKey(params),
    queryFn: () => fetchCompanies(params),
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["companies", id],
    queryFn: async () =>
      normalizeCompany(
        await apiClient.get<CompanyDetailResponse>(endpoints.company(id)),
        id,
      ),
    enabled: Boolean(id),
  });
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
