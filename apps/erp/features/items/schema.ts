import { z } from "zod";

export const itemTypeSchema = z.object({
  item_type_name: z.string().min(1, "Item type name is required"),
});

export const itemCategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
  parent_category_id: z.union([z.number(), z.string(), z.null()]).optional(),
});

export const itemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  item_code: z.string().optional(),
  hsn_code: z.string().optional(),
  item_type: z.union([z.number(), z.string()]).optional(),
  item_parent_category: z.union([z.number(), z.string(), z.null()]).optional(),
  item_category: z.union([z.number(), z.string(), z.null()]).optional(),
  
  // Units & conversion
  unit_id: z.union([z.number(), z.string()]).optional(),
  conv_unit_id: z.union([z.number(), z.string(), z.null()]).optional(),
  conv_rate: z.union([z.number(), z.string()]).optional(),

  // Sales Pricing
  sales_currency_id: z.union([z.number(), z.string()]).optional(),
  sales_min_price: z.union([z.number(), z.string()]).optional(),
  sales_rate: z.union([z.number(), z.string()]).optional(),
  sales_discount_percent: z.union([z.number(), z.string()]).optional(),

  // Purchase Pricing
  purchase_currency_id: z.union([z.number(), z.string()]).optional(),
  purchase_min_price: z.union([z.number(), z.string()]).optional(),
  purchase_rate: z.union([z.number(), z.string()]).optional(),
  purchase_discount_percent: z.union([z.number(), z.string()]).optional(),

  tax_id: z.union([z.number(), z.string()]).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ItemTypeValues = z.infer<typeof itemTypeSchema>;
export type ItemCategoryValues = z.infer<typeof itemCategorySchema>;
export type ItemValues = z.infer<typeof itemSchema>;

export type ItemType = {
  item_type_id: number;
  item_type_name: string;
  created_at?: string;
};

export type ItemCategory = {
  category_id: number;
  category_name: string;
  parent_category_id: number | null;
  created_at?: string;
};

export type Item = {
  item_id: number;
  item_name: string;
  item_code?: string;
  hsn_code?: string;
  item_type?: number;
  item_parent_category?: number;
  item_category?: number;
  unit_id?: number;
  conv_unit_id?: number;
  conv_rate?: number | string;
  sales_currency_id?: number;
  sales_min_price?: number | string;
  sales_rate?: number | string;
  sales_discount_percent?: number | string;
  purchase_currency_id?: number;
  purchase_min_price?: number | string;
  purchase_rate?: number | string;
  purchase_discount_percent?: number | string;
  tax_id?: number;
  status: "active" | "inactive";
  created_at?: string;
};
