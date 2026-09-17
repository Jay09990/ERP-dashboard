import { z } from "zod";

export const warehouseSchema = z.object({
  warehouse_name: z.string().min(1, "Warehouse name is required"),
  address: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const batchSchema = z.object({
  item_id: z.union([z.number(), z.string().min(1, "Item selection is required")]),
  batch_no: z.string().min(1, "Batch number is required"),
  mfg_date: z.string().optional().default(""),
  expiry_date: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const transferItemDetailSchema = z.object({
  item_id: z.union([z.number(), z.string().min(1, "Item is required")]),
  batch_id: z.union([z.number(), z.string()]).optional().nullable(),
  quantity: z.number().min(0.0001, "Quantity must be greater than 0"),
  unit_id: z.union([z.number(), z.string()]).optional().nullable(),
});

export const stockTransferSchema = z.object({
  transfer_date: z.string().min(1, "Transfer date is required"),
  from_warehouse_id: z.union([z.number(), z.string().min(1, "Source warehouse is required")]),
  to_warehouse_id: z.union([z.number(), z.string().min(1, "Destination warehouse is required")]),
  status: z.enum(["draft", "in_transit", "completed", "cancelled"]).default("draft"),
  notes: z.string().optional().default(""),
  itemsDetails: z.array(transferItemDetailSchema).min(1, "At least one item is required"),
});

export const adjustmentItemDetailSchema = z.object({
  item_id: z.union([z.number(), z.string().min(1, "Item is required")]),
  batch_id: z.union([z.number(), z.string()]).optional().nullable(),
  adjustment_type: z.enum(["increase", "decrease"]).default("increase"),
  quantity: z.number().min(0.0001, "Quantity must be greater than 0"),
  unit_id: z.union([z.number(), z.string()]).optional().nullable(),
});

export const stockAdjustmentSchema = z.object({
  adjustment_date: z.string().min(1, "Adjustment date is required"),
  warehouse_id: z.union([z.number(), z.string().min(1, "Warehouse is required")]),
  reason: z.string().optional().default(""),
  status: z.enum(["draft", "approved", "cancelled"]).default("draft"),
  notes: z.string().optional().default(""),
  itemsDetails: z.array(adjustmentItemDetailSchema).min(1, "At least one item is required"),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
export type BatchFormValues = z.infer<typeof batchSchema>;
export type StockTransferFormValues = z.infer<typeof stockTransferSchema>;
export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;

export interface Warehouse {
  id: number;
  warehouse_id?: number;
  warehouse_name: string;
  address?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

export interface Batch {
  id: number;
  batch_id?: number;
  item_id: number;
  batch_no: string;
  mfg_date?: string;
  expiry_date?: string;
  status: "active" | "inactive";
  item_name?: string;
  item_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StockSummary {
  id?: number | string;
  item_id: number;
  item_name?: string;
  item_code?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  quantity?: number;
  current_stock?: number;
  unit_name?: string;
  uom?: string;
  reorder_level?: number;
}

export interface StockLedgerEntry {
  id: number;
  ledger_id?: number;
  transaction_date?: string;
  created_at?: string;
  item_id: number;
  item_name?: string;
  warehouse_id?: number;
  warehouse_name?: string;
  voucher_type?: string;
  voucher_no?: string;
  transaction_type?: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT" | string;
  quantity: number;
  rate?: number;
  balance?: number;
  remarks?: string;
}

export interface StockTransferItemDetail {
  id?: number;
  transfer_detail_id?: number;
  transfer_id?: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  batch_id?: number | null;
  batch_no?: string;
  quantity: number;
  unit_id?: number | null;
  unit_name?: string;
}

export interface StockTransfer {
  id: number;
  transfer_id?: number;
  transfer_no?: string;
  transfer_date: string;
  from_warehouse_id: number;
  from_warehouse_name?: string;
  to_warehouse_id: number;
  to_warehouse_name?: string;
  status: "draft" | "in_transit" | "completed" | "cancelled" | string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  itemsDetails?: StockTransferItemDetail[];
}

export interface StockAdjustmentItemDetail {
  id?: number;
  adjustment_detail_id?: number;
  adjustment_id?: number;
  item_id: number;
  item_name?: string;
  item_code?: string;
  batch_id?: number | null;
  batch_no?: string;
  adjustment_type: "increase" | "decrease" | string;
  quantity: number;
  unit_id?: number | null;
  unit_name?: string;
}

export interface StockAdjustment {
  id: number;
  adjustment_id?: number;
  adjustment_no?: string;
  adjustment_date: string;
  warehouse_id: number;
  warehouse_name?: string;
  reason?: string;
  status: "draft" | "approved" | "cancelled" | string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  itemsDetails?: StockAdjustmentItemDetail[];
}
