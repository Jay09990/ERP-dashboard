import { z } from "zod";

export const partyAddressSchema = z.object({
  address_id: z.union([z.string(), z.number()]).optional(),
  address_type: z.enum(["billing", "shipping", "both"]).default("billing"),
  address_label: z.string().min(1, "Address label is required"),
  attention_to: z.string().optional(),
  phone: z.string().optional(),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  country_id: z.union([z.string(), z.number()]).nullable().optional(),
  state_id: z.union([z.string(), z.number()]).nullable().optional(),
  city_id: z.union([z.string(), z.number()]).nullable().optional(),
  pincode: z.string().optional(),
});

export const partyContactPersonSchema = z.object({
  person_id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
});

export const partySchema = z.object({
  party_name: z.string().min(1, "Party name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gst_no: z.string().optional(),
  pan_no: z.string().optional(),
  website: z.string().optional(),
  contact_name: z.string().optional(),
  notes: z.string().optional(),
  opening_balance: z.union([z.string(), z.number()]).optional().default("0"),
  currency_id: z.union([z.string(), z.number()]).optional().default(1),
  authorized_signature: z.string().optional().nullable(),
  addresses: z.array(partyAddressSchema).default([]),
  contactPersons: z.array(partyContactPersonSchema).default([]),
});

export type PartyAddressFormValues = z.infer<typeof partyAddressSchema>;
export type PartyContactPersonFormValues = z.infer<typeof partyContactPersonSchema>;
export type PartyFormValues = z.infer<typeof partySchema>;
