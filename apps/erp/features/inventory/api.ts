import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Warehouse,
  Batch,
  StockSummary,
  StockLedgerEntry,
  StockTransfer,
  StockAdjustment,
  WarehouseFormValues,
  BatchFormValues,
  StockTransferFormValues,
  StockAdjustmentFormValues,
} from "./schema";

export function useInventoryResource<T, TCreate, TUpdate>(
  key: string,
  endpoint: string,
) {
  const qc = useQueryClient();
  const hooks = createResourceHooks<T, TCreate, TUpdate>(key, endpoint, apiClient, qc);

  return {
    useList: (params?: Record<string, string>) => hooks.useList(params),
    useDetail: (id: string | number) => hooks.useDetail(String(id)),
    useCreate: () => hooks.useCreate(),
    useUpdate: () => hooks.useUpdate(),
    useDelete: () => hooks.useDelete(),
  };
}

export const warehouseApi = {
  useList: (params?: Record<string, string>) =>
    useInventoryResource<Warehouse, WarehouseFormValues, Partial<WarehouseFormValues>>(
      "warehouses",
      endpoints.inventory.warehouse
    ).useList(params),
  useDetail: (id: string | number) =>
    useInventoryResource<Warehouse, WarehouseFormValues, Partial<WarehouseFormValues>>(
      "warehouses",
      endpoints.inventory.warehouse
    ).useDetail(id),
  useCreate: () =>
    useInventoryResource<Warehouse, WarehouseFormValues, Partial<WarehouseFormValues>>(
      "warehouses",
      endpoints.inventory.warehouse
    ).useCreate(),
  useUpdate: () =>
    useInventoryResource<Warehouse, WarehouseFormValues, Partial<WarehouseFormValues>>(
      "warehouses",
      endpoints.inventory.warehouse
    ).useUpdate(),
  useDelete: () =>
    useInventoryResource<Warehouse, WarehouseFormValues, Partial<WarehouseFormValues>>(
      "warehouses",
      endpoints.inventory.warehouse
    ).useDelete(),
};

export const batchApi = {
  useList: (params?: Record<string, string>) =>
    useInventoryResource<Batch, BatchFormValues, Partial<BatchFormValues>>(
      "batches",
      endpoints.inventory.batch
    ).useList(params),
  useDetail: (id: string | number) =>
    useInventoryResource<Batch, BatchFormValues, Partial<BatchFormValues>>(
      "batches",
      endpoints.inventory.batch
    ).useDetail(id),
  useCreate: () =>
    useInventoryResource<Batch, BatchFormValues, Partial<BatchFormValues>>(
      "batches",
      endpoints.inventory.batch
    ).useCreate(),
  useUpdate: () =>
    useInventoryResource<Batch, BatchFormValues, Partial<BatchFormValues>>(
      "batches",
      endpoints.inventory.batch
    ).useUpdate(),
  useDelete: () =>
    useInventoryResource<Batch, BatchFormValues, Partial<BatchFormValues>>(
      "batches",
      endpoints.inventory.batch
    ).useDelete(),
};

export const stockApi = {
  useSummary: (params?: Record<string, string | number>) => {
    return useQuery<StockSummary[]>({
      queryKey: ["stock-summary", params],
      queryFn: async () => {
        const queryStr = params ? "?" + new URLSearchParams(params as any).toString() : "";
        const res = await apiClient.get<any>(`${endpoints.inventory.stockSummary}${queryStr}`);
        return (res.data?.data || res.data || []) as StockSummary[];
      },
    });
  },
  useLedger: (params?: Record<string, string | number>) => {
    return useQuery<StockLedgerEntry[]>({
      queryKey: ["stock-ledger", params],
      queryFn: async () => {
        const queryStr = params ? "?" + new URLSearchParams(params as any).toString() : "";
        const res = await apiClient.get<any>(`${endpoints.inventory.stockLedger}${queryStr}`);
        return (res.data?.data || res.data || []) as StockLedgerEntry[];
      },
    });
  },
};

export const transferApi = {
  useList: (params?: Record<string, string>) =>
    useInventoryResource<StockTransfer, StockTransferFormValues, Partial<StockTransferFormValues>>(
      "transfers",
      endpoints.inventory.transfer
    ).useList(params),
  useDetail: (id: string | number) =>
    useInventoryResource<StockTransfer, StockTransferFormValues, Partial<StockTransferFormValues>>(
      "transfers",
      endpoints.inventory.transfer
    ).useDetail(id),
  useCreate: () =>
    useInventoryResource<StockTransfer, StockTransferFormValues, Partial<StockTransferFormValues>>(
      "transfers",
      endpoints.inventory.transfer
    ).useCreate(),
  useDelete: () =>
    useInventoryResource<StockTransfer, StockTransferFormValues, Partial<StockTransferFormValues>>(
      "transfers",
      endpoints.inventory.transfer
    ).useDelete(),
  useUpdateStatus: () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, status }: { id: string | number; status: string }) => {
        const url = endpoints.inventory.transferStatus(id, status);
        const res = await apiClient.post<any>(url);
        return res.data;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["transfers"] });
        qc.invalidateQueries({ queryKey: ["stock-summary"] });
        qc.invalidateQueries({ queryKey: ["stock-ledger"] });
      },
    });
  },
};

export const adjustmentApi = {
  useList: (params?: Record<string, string>) =>
    useInventoryResource<StockAdjustment, StockAdjustmentFormValues, Partial<StockAdjustmentFormValues>>(
      "adjustments",
      endpoints.inventory.adjustment
    ).useList(params),
  useDetail: (id: string | number) =>
    useInventoryResource<StockAdjustment, StockAdjustmentFormValues, Partial<StockAdjustmentFormValues>>(
      "adjustments",
      endpoints.inventory.adjustment
    ).useDetail(id),
  useCreate: () =>
    useInventoryResource<StockAdjustment, StockAdjustmentFormValues, Partial<StockAdjustmentFormValues>>(
      "adjustments",
      endpoints.inventory.adjustment
    ).useCreate(),
  useDelete: () =>
    useInventoryResource<StockAdjustment, StockAdjustmentFormValues, Partial<StockAdjustmentFormValues>>(
      "adjustments",
      endpoints.inventory.adjustment
    ).useDelete(),
  useUpdateStatus: () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, status }: { id: string | number; status: string }) => {
        const url = endpoints.inventory.adjustmentStatus(id, status);
        const res = await apiClient.post<any>(url);
        return res.data;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["adjustments"] });
        qc.invalidateQueries({ queryKey: ["stock-summary"] });
        qc.invalidateQueries({ queryKey: ["stock-ledger"] });
      },
    });
  },
};
