import { z } from "zod";

export const uomSchema = z.object({
  unit_name: z.string().min(1, "Unit name is required"),
  unit_code: z.string().min(1, "Unit code is required"),
  unit_type: z.string().optional(),
});

export const taxTypeSchema = z.object({
  tax_name: z.string().min(1, "Tax name is required"),
  tax_percentage: z.union([z.number(), z.string()]),
  tax_type: z.enum(["fixed", "percentage"]),
  applicable_on: z.enum(["sales", "purchase", "both"]).optional(),
});

export const currencySchema = z.object({
  currency_name: z.string().min(1, "Currency name is required"),
  currency_code: z.string().min(1, "Currency code is required"),
  symbol: z.string().min(1, "Currency symbol is required"),
});

export const paymentTermSchema = z.object({
  term_name: z.string().min(1, "Term name is required"),
  due_days: z.union([z.number(), z.string()]),
  description: z.string().optional(),
});

export const bankSchema = z.object({
  bank_name: z.string().min(1, "Bank name is required"),
  ifsc_code: z.string().optional(),
  branch_name: z.string().optional(),
});

export const countrySchema = z.object({
  country_name: z.string().min(1, "Country name is required"),
});

export const stateSchema = z.object({
  state_name: z.string().min(1, "State name is required"),
  country_id: z.union([z.number(), z.string()]),
});

export const citySchema = z.object({
  city_name: z.string().min(1, "City name is required"),
  state_id: z.union([z.number(), z.string()]),
});

export type UomValues = z.infer<typeof uomSchema>;
export type TaxTypeValues = z.infer<typeof taxTypeSchema>;
export type CurrencyValues = z.infer<typeof currencySchema>;
export type PaymentTermValues = z.infer<typeof paymentTermSchema>;
export type BankValues = z.infer<typeof bankSchema>;
export type CountryValues = z.infer<typeof countrySchema>;
export type StateValues = z.infer<typeof stateSchema>;
export type CityValues = z.infer<typeof citySchema>;
