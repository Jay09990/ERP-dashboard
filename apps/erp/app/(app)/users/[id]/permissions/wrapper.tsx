"use client";

import { PermissionMatrix } from "@/features/auth/permissions/components/PermissionMatrix";
import {
  useAllPermissions,
  useRolePermissions,
  useUpdateUserPermissions,
  useUserPermissions,
} from "@/features/auth/permissions/api";
import { useUsers } from "@/features/auth/users/api";
import { useMemo } from "react";

export function UserPermissionsWrapper({ id }: { id: string }) {
  const { data: userPermissions = [], isLoading: loadingUserPerms } = useUserPermissions(id);
  const { mutateAsync: updatePermissions, isPending: savingPerms } = useUpdateUserPermissions(id);

  // Fetch all users to find details locally, avoiding 404 from GET /api/auth/users/:id
  const { data: usersData, isLoading: loadingUsers } = useUsers();
  const users = Array.isArray(usersData) ? usersData : (usersData as any)?.users ?? [];
  const user = users.find(
    (u: any) => (u.user_id ?? u.id)?.toString() === id,
  );

  const roleId = (user?.roleId ?? user?.role_id ?? "").toString();
  const { data: rolePermissions = [], isLoading: loadingRolePerms } = useRolePermissions(roleId);
  const { data: allPermissions = [], isLoading: loadingAll } = useAllPermissions();

  const combinedPermissions = useMemo(() => {
    if (!allPermissions.length) return userPermissions;

    const roleMap = new Map(
      (rolePermissions || []).map((p: any) => [p.permission_name, p.is_allowed]),
    );
    const userMap = new Map(
      (userPermissions || []).map((p: any) => [p.permission_name, p.is_allowed]),
    );

    return allPermissions.map((p: any) => {
      const hasUserOverride = userMap.has(p.permission_name);
      const userAllowed = userMap.get(p.permission_name);
      const roleAllowed = roleMap.get(p.permission_name) || false;

      return {
        ...p,
        is_allowed: hasUserOverride ? !!userAllowed : roleAllowed,
        inherited: !hasUserOverride && roleAllowed,
      };
    });
  }, [allPermissions, rolePermissions, userPermissions]);

  const handleSave = async (permissions: any[]) => {
    try {
      await updatePermissions(permissions);
      alert("User permissions saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update permissions");
    }
  };

  if (loadingUserPerms || loadingUsers || (roleId && loadingRolePerms) || loadingAll) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  const fn = user?.firstName ?? user?.first_name ?? "";
  const ln = user?.lastName ?? user?.last_name ?? "";
  const name = `${fn} ${ln}`.trim() || user?.email || id;

  return (
    <PermissionMatrix
      title={`Permissions for User: ${name}`}
      initialPermissions={combinedPermissions}
      onSave={handleSave}
      isSaving={savingPerms}
    />
  );
}