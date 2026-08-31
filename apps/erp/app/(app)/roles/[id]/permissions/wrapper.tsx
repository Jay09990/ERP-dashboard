"use client";

import { PermissionMatrix } from "@/features/auth/permissions/components/PermissionMatrix";
import { useRolePermissions, useUpdateRolePermissions } from "@/features/auth/permissions/api";
import { useRoles } from "@/features/auth/roles/api";

export function RolePermissionsWrapper({ id }: { id: string }) {
  const { data: initialPermissions = [], isLoading: loadingPerms } = useRolePermissions(id);
  const { mutateAsync: updatePermissions, isPending: savingPerms } = useUpdateRolePermissions(id);

  // Fetch all roles to find details locally, avoiding 404 from GET /api/auth/roles/:id
  // (that endpoint doesn't exist — only the collection GET and item PUT/DELETE are documented).
  const { data: rolesData, isLoading: loadingRoles } = useRoles();
  const roles = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.roles ?? [];
  const role = roles.find((r: any) => r.role_id?.toString() === id);

  const handleSave = async (permissions: any[]) => {
    try {
      await updatePermissions(permissions);
      alert("Permissions updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update permissions");
    }
  };

  if (loadingPerms || loadingRoles) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  return (
    <PermissionMatrix
      title={`Permissions for Role: ${role?.role_name || id}`}
      initialPermissions={initialPermissions}
      onSave={handleSave}
      isSaving={savingPerms}
    />
  );
}