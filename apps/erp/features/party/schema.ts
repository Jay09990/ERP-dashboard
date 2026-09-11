import { z } from "zod";

export const addressSchema = z.object({
  address_id: z.number().optional(),
  address_type: z.enum(["billing", "shipping", "both"]),
  address_label: z.string().min(1, "Address label is required"),
  attention_to: z.string().min(1, "Attention to is required"),
  phone: z.string().min(1, "Phone is required"),
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city_id: z.number().min(1, "City is required"),
  state_id: z.number().min(1, "State is required"),
  country_id: z.number().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
});

export const contactPersonSchema = z.object({
  person_id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
});

export const partySchema = z.object({
  id: z.number().optional(),
  party_name: z.string().min(1, "Party name is required"),
  party_type: z.enum(["customer", "vendor"]),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  gst_no: z.string().optional(),
  pan_no: z.string().optional(),
  address: z.string().optional(),
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
  contactPersons: z.array(contactPersonSchema).min(1, "At least one contact person is required"),
});

export type PartyFormValues = z.infer<typeof partySchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type ContactPersonFormValues = z.infer<typeof contactPersonSchema>;