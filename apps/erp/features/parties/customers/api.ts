"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PartyFormValues, PartyRecord } from "../shared";

function extractPartyArray(res: any): PartyRecord[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  for (const key of [
    "data",
    "customers",
    "vendors",
    "parties",
    "rows",
    "records",
    "result",
    "payload",
  ]) {
    if (Array.isArray(res[key])) return res[key];
    if (res[key] && res[key] !== res) {
      const nested = extractPartyArray(res[key]);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function extractPartySingle(
  res: any,
  id: string | number,
): PartyRecord | null {
  if (!res) return null;
  if (Array.isArray(res)) {
    const matchingParty = res.find(
      (party) =>
        String(party?.party_id ?? party?.id ?? "") === String(id),
    );
    if (matchingParty) return matchingParty;
    const onlyParty = res.length === 1 ? res[0] : null;
    return onlyParty?.party_id == null && onlyParty?.id == null
      ? onlyParty
      : null;
  }
  if (typeof res !== "object") return null;
  const recordId = res.party_id ?? res.id;
  if (recordId != null) {
    return String(recordId) === String(id) ? res : null;
  }

  for (const key of [
    "customer",
    "vendor",
    "party",
    "customers",
    "vendors",
    "parties",
    "data",
    "result",
    "payload",
    "record",
  ]) {
    if (res[key] != null) {
      const party = extractPartySingle(res[key], id);
      if (party) return party;
    }
  }

  return null;
}

function normalizeParty(record: any): PartyRecord | null {
  if (!record || typeof record !== "object") return null;
  const normalized = record as PartyRecord & {
    company_name?: string;
    name?: string;
  };
  return {
    ...normalized,
    id: normalized.id ?? normalized.party_id ?? "",
    party_id: normalized.party_id ?? normalized.id ?? "",
    party_name:
      normalized.party_name ?? normalized.company_name ?? normalized.name ?? "",
    phone: normalized.phone ?? "",
  };
}

export function useCustomers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["customers", "list", params],
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.party.customers, params);
      return extractPartyArray(res);
    },
  });
}

export function useCustomer(id: string | number) {
  return useQuery({
    queryKey: ["customers", id],
    retry: false,
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.party.customer(id));
      const record = normalizeParty(extractPartySingle(res, id));
      if (!record || (!record.id && !record.party_id)) {
        throw new Error("Customer not found");
      }
      return record;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PartyFormValues) =>
      apiClient.post<PartyRecord>(endpoints.party.customers, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: { id: string | number; body: PartyFormValues }) =>
      apiClient.put<PartyRecord>(endpoints.party.customer(id), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(endpoints.party.customer(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
