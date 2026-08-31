import { z } from "zod";

export const roleSchema = z.object({
  role_name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

export type RoleValues = z.infer<typeof roleSchema>;

export type Role = {
  role_id: number;
  role_name: string;
  description: string | null;
  is_deleted?: boolean;
  created_at?: string;
};
