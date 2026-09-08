import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PermissionItem = {
  permission_name: string;
  module_name: string;
  is_allowed: boolean;
  inherited?: boolean; // UI-specific flag if we want to show it
};

export function useAllPermissions() {
  return useQuery({
    queryKey: ["all-permissions"],
    queryFn: async () => {
      const response = await apiClient.get<
        { permissions?: PermissionItem[] } | PermissionItem[]
      >(endpoints.auth.permissions);
      return Array.isArray(response) ? response : (response as any).permissions || [];
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
      return Array.isArray(res) ? res : (res as any).permissions || [];
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
      return Array.isArray(res) ? res : (res as any).permissions || [];
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
