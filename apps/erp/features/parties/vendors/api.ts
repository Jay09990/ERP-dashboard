"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PartyFormValues, PartyRecord } from "../shared";

function extractPartyArray(res: any): PartyRecord[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  for (const key of ["data", "vendors", "parties", "rows", "records", "result", "payload"]) {
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
  if (res.vendor) return res.vendor;
  if (res.party) return res.party;
  return res;
}

export function useVendors(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["vendors", "list", params],
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.party.vendors, params);
      return extractPartyArray(res);
    },
  });
}

export function useVendor(id: string | number) {
  return useQuery({
    queryKey: ["vendors", id],
    retry: false,
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.party.vendor(id));
      const record = extractPartySingle(res);
      if (!record || (!record.id && !record.party_id && !record.party_name)) {
        throw new Error("Vendor not found");
      }
      return record;
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PartyFormValues) =>
      apiClient.post<PartyRecord>(endpoints.party.vendors, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string | number; body: PartyFormValues }) =>
      apiClient.put<PartyRecord>(endpoints.party.vendor(id), body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(endpoints.party.vendor(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}
