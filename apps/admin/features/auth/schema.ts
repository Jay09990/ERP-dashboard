import { z } from "zod";

export const adminRegisterSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminLoginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

// ─── Regexes per spec §1.3 ───────────────────────────────────────────────────
const companyNameRegex = /^[A-Za-z0-9&.,'\-\s]{3,100}$/;
const companyCodeRegex = /^[A-Z0-9]{2,10}$/;
const gstNoRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const indianPhoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const nameRegex = /^[A-Za-z][A-Za-z'\-\s]{1,49}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}]{8,64}$/;
const dbNameRegex = /^[a-z][a-z0-9_]{2,62}$/;

export const companyRegisterSchema = z
  .object({
    // Section 1 — Company Details
    companyName: z
      .string()
      .trim()
      .regex(
        companyNameRegex,
        "Company name must be 3–100 characters and can only include letters, numbers, spaces, and & . , ' -",
      ),
    companyCode: z
      .string()
      .trim()
      .regex(
        companyCodeRegex,
        "Company code must be 2–10 uppercase letters/numbers only (lowercase is auto-converted)",
      ),
    gstNo: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        gstNoRegex,
        "Enter a valid 15-character GSTIN, e.g. 22AAAAA0000A1Z5",
      ),
    address: z
      .string()
      .trim()
      .regex(/^.{10,250}$/, "Address must be 10–250 characters"),

    // Section 2 — Contact Details
    phone: z
      .string()
      .trim()
      .regex(
        indianPhoneRegex,
        "Enter a valid 10-digit mobile number starting with 6–9",
      ),
    companyEmail: z
      .string()
      .trim()
      .regex(emailRegex, "Enter a valid email address")
      .email("Enter a valid email address"),

    // Section 3 — Subscription Plan (only plan 1 selectable currently)
    subscriptionPlanId: z
      .number({
        required_error: "Select a subscription plan",
        invalid_type_error: "Select a subscription plan",
      })
      .int()
      .min(1, "Select a subscription plan"),

    // Section 4 — Super Admin & Database
    superAdminFirstName: z
      .string()
      .trim()
      .regex(
        nameRegex,
        "Must be 2–50 characters, starting with a letter (letters, spaces, apostrophes, hyphens only)",
      ),
    superAdminLastName: z
      .string()
      .trim()
      .regex(
        nameRegex,
        "Must be 2–50 characters, starting with a letter (letters, spaces, apostrophes, hyphens only)",
      ),
    superAdminEmail: z
      .string()
      .trim()
      .regex(emailRegex, "Enter a valid email address")
      .email("Enter a valid email address"),
    superAdminPhone: z
      .string()
      .trim()
      .regex(
        indianPhoneRegex,
        "Enter a valid 10-digit mobile number starting with 6–9",
      ),
    superAdminPassword: z
      .string()
      .regex(
        passwordRegex,
        "Password needs 8–64 characters with uppercase, lowercase, a number, and a special character",
      ),
    confirmPassword: z.string().min(1, "Passwords don't match"),
    db_name: z
      .string()
      .trim()
      .regex(
        dbNameRegex,
        "Database name must start with a lowercase letter and contain only lowercase letters, numbers, or underscores (max 63 characters)",
      ),
  })
  .refine((data) => data.superAdminPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type AdminRegisterValues = z.infer<typeof adminRegisterSchema>;
export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type CompanyRegisterValues = z.infer<typeof companyRegisterSchema>;
