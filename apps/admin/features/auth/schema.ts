import { z } from "zod";

export const adminRegisterSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const companyRegisterSchema = z.object({
  companyName: z.string().trim().min(2, "Enter the registered company name.").max(120, "Company name must be 120 characters or fewer."),
  companyCode: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,19}$/, "Use 2-20 letters, numbers, hyphens, or underscores."),
  companyEmail: z.string().trim().email("Enter a valid company email address.").max(160, "Email must be 160 characters or fewer."),
  gstNo: z.string().trim().toUpperCase().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid 15-character GSTIN, for example 24ABCDE1234F1Z5."),
  phone: z.string().trim().regex(/^(?:\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number with 10 digits."),
  address: z.string().trim().min(10, "Enter the complete registered address.").max(250, "Address must be 250 characters or fewer."),
  subscriptionPlanId: z.coerce.number().int().min(1).max(4, "Select a valid subscription plan."),
  superAdminFirstName: z.string().trim().regex(/^[A-Za-z][A-Za-z '\u002D]{1,49}$/, "Use 2-50 letters, spaces, apostrophes, or hyphens."),
  superAdminLastName: z.string().trim().regex(/^[A-Za-z][A-Za-z '\u002D]{1,49}$/, "Use 2-50 letters, spaces, apostrophes, or hyphens."),
  superAdminEmail: z.string().trim().email("Enter a valid super admin email address.").max(160, "Email must be 160 characters or fewer."),
  superAdminPhone: z.string().trim().regex(/^(?:\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number with 10 digits."),
  superAdminPassword: z.string().min(8, "Use at least 8 characters.").max(72, "Password must be 72 characters or fewer.").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, "Use uppercase, lowercase, number, and special character."),
  db_name: z.string().trim().regex(/^[a-z][a-z0-9_]{2,62}$/, "Use 3-63 lowercase letters, numbers, or underscores; start with a letter."),
});

export type AdminRegisterValues = z.infer<typeof adminRegisterSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type CompanyRegisterValues = z.infer<typeof companyRegisterSchema>;
