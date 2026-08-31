"use client";

import { Button, DataTable, FilterBar } from "@altrex/ui";
import { Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteRole, useRoles } from "../api";
import type { Role } from "../schema";
import { RoleFormModal } from "./RoleFormModal";
import { PermissionMatrixModal } from "../../permissions/components/PermissionMatrixModal";

export function RoleList() {
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [activePermissionRole, setActivePermissionRole] = useState<Role | null>(null);

  const { data: responseData, isLoading, error } = useRoles();
  const roles: Role[] = Array.isArray(responseData)
    ? responseData
    : ((responseData as any)?.roles ?? (responseData as any)?.data ?? []);
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const filtered = search.trim()
    ? roles.filter(
        (r) =>
          r.role_name?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : roles;

  const columns = [
    {
      key: "role_name" as const,
      label: "Role Name",
      render: (r: Role) => (
        <span style={{ fontWeight: 600 }}>{r.role_name}</span>
      ),
    },
    {
      key: "description" as const,
      label: "Description",
      render: (r: Role) => r.description || "—",
    },
    {
      key: "role_id" as const,
      label: "Actions",
      render: (r: Role) => (
        <div className="altrex-row-actions">
          <Button
            variant="outline"
            onClick={() => {
              setActiveRole(r);
              setIsOpenModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setActivePermissionRole(r);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Shield size={14} />
            Permissions
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete the role "${r.role_name}"?`,
                )
              ) {
                deleteRole(r.role_id.toString());
              }
            }}
            disabled={isDeleting}
            style={{ color: "var(--altrex-danger-text)" }}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Access Control</span>
          <h1>Roles</h1>
        </div>
        <Button
          onClick={() => {
            setActiveRole(null);
            setIsOpenModal(true);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Add Role
        </Button>
      </div>

      <FilterBar>
        <input
          className="altrex-input"
          placeholder="Search by role name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "320px" }}
        />
      </FilterBar>

      {isLoading ? (
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading roles...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load roles from the server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filtered}
        />
      )}

      {isOpenModal && (
        <RoleFormModal
          role={activeRole}
          onClose={() => {
            setIsOpenModal(false);
            setActiveRole(null);
          }}
        />
      )}

      {activePermissionRole && (
        <PermissionMatrixModal
          roleId={activePermissionRole.role_id.toString()}
          roleName={activePermissionRole.role_name}
          onClose={() => {
            setActivePermissionRole(null);
          }}
        />
      )}
    </>
  );
}
