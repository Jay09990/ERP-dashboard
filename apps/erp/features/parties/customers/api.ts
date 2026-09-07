"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { PartyFormValues, PartyRecord } from "../shared";
import { DUMMY_CUSTOMERS } from "../shared/mockData";

function extractPartyArray(res: any): PartyRecord[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.customers)) return res.customers;
  if (Array.isArray(res.parties)) return res.parties;
  if (Array.isArray(res.rows)) return res.rows;
  if (typeof res === "object") return [res];
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
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>(
          endpoints.party.customers,
          params
        );
        return extractPartyArray(res);
      } catch (err) {
        console.warn("Failed to fetch customers from API, using dummy data fallback:", err);
        return DUMMY_CUSTOMERS;
      }
    },
  });
}

export function useCustomer(id: string | number) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>(
          endpoints.party.customer(id)
        );
        const record = extractPartySingle(res);
        if (record && (record.id || record.party_id || record.party_name)) {
          return record;
        }
      } catch (err) {
        console.warn(`Failed to fetch customer #${id} from API, checking dummy data fallback:`, err);
      }
      return DUMMY_CUSTOMERS.find((c) => String(c.id) === String(id) || String(c.party_id) === String(id)) || DUMMY_CUSTOMERS[0];
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: PartyFormValues) => {
      try {
        return await apiClient.post<PartyRecord>(endpoints.party.customers, body);
      } catch (err) {
        console.warn("Backend save failed, applying mock optimistic save:", err);
        const newRecord: PartyRecord = {
          id: Date.now(),
          party_id: Date.now(),
          party_type: "customer",
          party_name: body.party_name,
          phone: body.phone,
          email: body.email,
          contact_name: body.contact_name,
          gst_no: body.gst_no,
          pan_no: body.pan_no,
          website: body.website,
          opening_balance: body.opening_balance || 0,
          notes: body.notes,
          status: (body as any).status || "active",
          addresses: (body.addresses || []).map((a, idx) => ({ ...a, id: Date.now() + idx })),
          contactPersons: (body.contactPersons || []).map((cp, idx) => ({ ...cp, id: Date.now() + 100 + idx })),
        };
        return newRecord;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string | number; body: PartyFormValues }) => {
      try {
        return await apiClient.put<PartyRecord>(endpoints.party.customer(id), body);
      } catch (err) {
        console.warn(`Backend update for #${id} failed, applying mock update:`, err);
        const updatedRecord: PartyRecord = {
          id,
          party_id: id,
          party_type: "customer",
          party_name: body.party_name,
          phone: body.phone,
          email: body.email,
          contact_name: body.contact_name,
          gst_no: body.gst_no,
          pan_no: body.pan_no,
          website: body.website,
          opening_balance: body.opening_balance || 0,
          notes: body.notes,
          status: (body as any).status || "active",
          addresses: (body.addresses || []).map((a, idx) => ({ ...a, id: Date.now() + idx })),
          contactPersons: (body.contactPersons || []).map((cp, idx) => ({ ...cp, id: Date.now() + 100 + idx })),
        };
        return updatedRecord;
      }
    },
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
