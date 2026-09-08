"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PartyFormValues, PartyRecord } from "../shared";

function extractPartyArray(res: any): PartyRecord[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  for (const key of ["data", "customers", "parties", "rows", "records", "result", "payload"]) {
    if (Array.isArray(res[key])) return res[key];
    if (res[key] && res[key] !== res) {
      const nested = extractPartyArray(res[key]);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function extractPartySingle(res: any): PartyRecord | null {
  if (!res) return null;
  if (Array.isArray(res)) return res[0] || null;
  if (res.data) return Array.isArray(res.data) ? res.data[0] : res.data;
  if (res.customer) return res.customer;
  if (res.party) return res.party;
  return res;
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
      const record = extractPartySingle(res);
      if (!record || (!record.id && !record.party_id && !record.party_name)) {
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
    mutationFn: ({ id, body }: { id: string | number; body: PartyFormValues }) =>
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
