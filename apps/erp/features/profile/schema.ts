import { z } from "zod";

export const profileSchema = z.object({
  // Identity
  company_name: z.string().min(1, "Company name is required"),
  trade_name: z.string().optional(),
  logo: z.string().nullable().optional(),
  registration_number: z.string().optional(),
  gst_no: z.string().optional(),
  pan_no: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().optional(),
  contact_name: z.string().optional(),
  authorized_signature: z.string().nullable().optional(),

  // Address
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city_id: z.string().or(z.number()).nullable().optional(),
  state_id: z.string().or(z.number()).nullable().optional(),
  country_id: z.string().or(z.number()).nullable().optional(),
  pincode: z.string().optional(),

  // Banking
  bank_id: z.string().or(z.number()).nullable().optional(),
  account_holder_name: z.string().optional(),
  account_no: z.string().optional(),
  ifsc_code: z.string().optional(),
  swift_code: z.string().optional(),
  branch_name: z.string().optional(),
  upi_no: z.string().optional(),
  opening_balance: z.string().or(z.number()).nullable().optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
