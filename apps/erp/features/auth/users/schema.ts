import { z } from "zod";

export const userCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().or(z.number()),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  profile_image: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]),
  roleId: z.string().or(z.number()),
});

export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
});

export type UserCreateValues = z.infer<typeof userCreateSchema>;
export type UserUpdateValues = z.infer<typeof userUpdateSchema>;
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export type User = {
  user_id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profile_image: string | null;
  status: "active" | "inactive";
  roleId: number;
  created_at: string;
};
