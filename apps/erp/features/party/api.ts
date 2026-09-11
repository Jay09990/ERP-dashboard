"use client";

import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Party } from "./types";

const queryClient_ = () => {
  return useQueryClient();
};

// ── Customer endpoints ─────────────────────────────────────────────────────

const customerEndpoints = {
  list: "/api/party/customers",
  detail: (id: string | number) => `/api/party/customers/${id}`,
};

/** List all customers */
export function useCustomers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["customers", "list", params],
    queryFn: async () => {
      const data = await apiClient.get<{ customers: Party[] }>(
        customerEndpoints.list,
        params,
      );
      return data.customers;
    },
  });
}

/** Single customer by id */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const data = await apiClient.get<{ customer?: Party } & Party>(
        customerEndpoints.detail(id),
      );
      return data.customer || data;
    },
  });
}

/** Create customer */
export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (party: Party) =>
      apiClient.post<{ customer: Party }>(customerEndpoints.list, party),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

/** Update customer */
export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, party }: { id: number; party: Party }) =>
      apiClient.put<{ customer: Party }>(customerEndpoints.detail(id), party),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
}

/** Delete customer (soft delete) */
export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete<{ message: string }>(customerEndpoints.detail(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

// ── Vendor endpoints ───────────────────────────────────────────────────────

const vendorEndpoints = {
  list: "/api/party/vendors",
  detail: (id: string | number) => `/api/party/vendors/${id}`,
};

/** List all vendors */
export function useVendors(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["vendors", "list", params],
    queryFn: async () => {
      const data = await apiClient.get<{ vendors: Party[] }>(
        vendorEndpoints.list,
        params,
      );
      return data.vendors;
    },
  });
}

/** Single vendor by id */
export function useVendor(id: string) {
  return useQuery({
    queryKey: ["vendors", id],
    queryFn: async () => {
      const data = await apiClient.get<{ vendor?: Party } & Party>(
        vendorEndpoints.detail(id),
      );
      return data.vendor || data;
    },
  });
}

/** Create vendor */
export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (party: Party) =>
      apiClient.post<{ vendor: Party }>(vendorEndpoints.list, party),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

/** Update vendor */
export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, party }: { id: number; party: Party }) =>
      apiClient.put<{ vendor: Party }>(vendorEndpoints.detail(id), party),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      qc.invalidateQueries({ queryKey: ["vendors", id] });
    },
  });
}

/** Delete vendor (soft delete) */
export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete<{ message: string }>(vendorEndpoints.detail(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}