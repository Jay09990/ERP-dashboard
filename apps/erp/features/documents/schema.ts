import { z } from "zod";

export const documentLineItemSchema = z.object({
  item_id: z.union([z.number(), z.string()]),
  description: z.string().optional(),
  quantity: z.number().min(0.0001, "Quantity must be greater than 0"),
  hsn_code: z.string().optional(),
  unit_id: z.union([z.number(), z.string()]).optional(),
  unit_rate: z.number().min(0, "Rate cannot be negative"),
  discount_percent: z.number().min(0).default(0),
  discount_flat: z.number().min(0).default(0),
  tax_ids: z.array(z.union([z.number(), z.string()])).default([]),
});

export const salesDocumentSchema = z.object({
  party_id: z.union([z.number(), z.string().min(1, "Customer/Party is required")]),
  document_date: z.string().min(1, "Date is required"),
  valid_until: z.string().optional(),
  expected_delivery_date: z.string().optional(),
  customer_po_no: z.string().optional(),
  customer_po_date: z.string().optional(),
  billing_address_id: z.union([z.number(), z.string()]).optional(),
  shipping_address_id: z.union([z.number(), z.string()]).optional(),
  currency_id: z.union([z.number(), z.string()]).optional(),
  shipping_charges: z.number().default(0),
  round_off: z.number().default(0),
  terms_conditions: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "approved", "sent", "cancelled"]).default("draft"),
  itemsDetails: z.array(documentLineItemSchema).min(1, "At least one line item is required"),
});

export type DocumentLineItemValues = z.infer<typeof documentLineItemSchema>;
export type SalesDocumentValues = z.infer<typeof salesDocumentSchema>;
