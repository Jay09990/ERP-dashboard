import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";
import type { Role, RoleValues } from "./schema";

export function useRoles(params?: Record<string, string>) {
  const qc = useQueryClient();
  return createResourceHooks<Role, RoleValues, RoleValues>(
    "roles",
    endpoints.auth.roles,
    apiClient,
    qc,
  ).useList(params);
}

export function useCreateRole() {
  const qc = useQueryClient();
  return createResourceHooks<Role, RoleValues, RoleValues>(
    "roles",
    endpoints.auth.roles,
    apiClient,
    qc,
  ).useCreate();
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return createResourceHooks<Role, RoleValues, RoleValues>(
    "roles",
    endpoints.auth.roles,
    apiClient,
    qc,
  ).useUpdate();
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return createResourceHooks<Role, RoleValues, RoleValues>(
    "roles",
    endpoints.auth.roles,
    apiClient,
    qc,
  ).useDelete();
}
