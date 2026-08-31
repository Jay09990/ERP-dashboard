"use client";

import { PermissionMatrix } from "@/features/auth/permissions/components/PermissionMatrix";
import { useUserPermissions, useUpdateUserPermissions } from "@/features/auth/permissions/api";
import { useUsers } from "@/features/auth/users/api";

export function UserPermissionsWrapper({ id }: { id: string }) {
  const { data: initialPermissions = [], isLoading: loadingPerms } = useUserPermissions(id);
  const { mutateAsync: updatePermissions, isPending: savingPerms } = useUpdateUserPermissions(id);

  // Fetch all users to find details locally, avoiding 404 from GET /api/auth/users/:id
  const { data: usersData, isLoading: loadingUsers } = useUsers();
  const users = Array.isArray(usersData) ? usersData : (usersData as any)?.users ?? [];
  const user = users.find((u: any) => u.user_id.toString() === id);

  const handleSave = async (permissions: any[]) => {
    try {
      await updatePermissions(permissions);
      alert("User permissions overridden successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update permissions");
    }
  };

  // Fixed: was "loadingUser" (undefined) — correct variable is "loadingUsers".
  if (loadingPerms || loadingUsers) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading permissions...</span>
      </div>
    );
  }

  const name = user ? `${user.firstName} ${user.lastName ?? ""}`.trim() : id;

  return (
    <PermissionMatrix
      title={`Override Permissions for User: ${name}`}
      initialPermissions={initialPermissions}
      onSave={handleSave}
      isSaving={savingPerms}
    />
  );
}