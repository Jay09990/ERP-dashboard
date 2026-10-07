import {
  additionalPermissionCatalog,
  legacyPermissionAliases,
} from "@/config/permissions";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PermissionItem = {
  permission_name: string;
  module_name: string;
  is_allowed: boolean;
  inherited?: boolean; // UI-specific flag if we want to show it
};

type PermissionResponse = PermissionItem[] | { permissions?: PermissionItem[] };

function permissionArray(response: PermissionResponse): PermissionItem[] {
  const permissions = Array.isArray(response)
    ? response
    : ((response as { permissions?: PermissionItem[] }).permissions ?? []);
  const normalized = new Map<string, PermissionItem>();

  for (const permission of permissions) {
    const canonicalName =
      legacyPermissionAliases[permission.permission_name] ??
      permission.permission_name;
    const existing = normalized.get(canonicalName);
    const isCanonical = canonicalName === permission.permission_name;
    const existingIsCanonical = existing?.permission_name === canonicalName;

    if (!existing || (isCanonical && !existingIsCanonical)) {
      normalized.set(canonicalName, {
        ...permission,
        permission_name: canonicalName,
      });
    }
  }

  return [...normalized.values()];
}

export function useAllPermissions() {
  return useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const response = await apiClient.get<
        { permissions?: PermissionItem[] } | PermissionItem[]
      >(endpoints.auth.permissions);
      const backendPermissions = permissionArray(response);
      const knownNames = new Set(
        backendPermissions.map((permission) => permission.permission_name),
      );
      const missingPermissions = additionalPermissionCatalog
        .filter((permission) => !knownNames.has(permission.permission_name))
        .map((permission) => ({ ...permission, is_allowed: false }));
      return [...missingPermissions, ...backendPermissions];
    },
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ["role-permissions", roleId],
    queryFn: async () => {
      const res = await apiClient.get<
        { permissions?: PermissionItem[] } | PermissionItem[]
      >(endpoints.auth.rolePermissions(roleId));
      return permissionArray(res);
    },
    enabled: !!roleId,
  });
}

export function useUpdateRolePermissions(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (permissions: PermissionItem[]) => {
      return apiClient.put<{ message: string }>(
        endpoints.auth.rolePermissions(roleId),
        {
          permissions,
        },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-permissions"] });
      qc.invalidateQueries({ queryKey: ["user-permissions"] });
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: async () => {
      const res = await apiClient.get<
        { permissions?: PermissionItem[] } | PermissionItem[]
      >(endpoints.auth.userPermissions(userId));
      return permissionArray(res);
    },
    enabled: !!userId,
  });
}

export function useUpdateUserPermissions(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (permissions: PermissionItem[]) => {
      return apiClient.put<{ message: string }>(
        endpoints.auth.userPermissions(userId),
        {
          permissions,
        },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-permissions", userId] });
    },
  });
}
