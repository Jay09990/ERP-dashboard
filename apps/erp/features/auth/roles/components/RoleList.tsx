"use client";

import { Button, DataTable, FilterBar } from "@altrex/ui";
import { Lock, Plus, Settings, Shield, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeleteRole, useRoles } from "../api";
import type { Role } from "../schema";
import { RoleFormModal } from "./RoleFormModal";
import { PermissionMatrixModal } from "../../permissions/components/PermissionMatrixModal";

const ROLE_COLORS = [
  { bg: "rgba(37, 99, 235, 0.12)", text: "#2563eb" },
  { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981" },
  { bg: "rgba(139, 92, 246, 0.12)", text: "#8b5cf6" },
  { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b" },
  { bg: "rgba(236, 72, 153, 0.12)", text: "#ec4899" },
];

function getRoleColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return ROLE_COLORS[hash % ROLE_COLORS.length];
}

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

  const filtered = useMemo(() =>
    search.trim()
      ? roles.filter(
          (r) =>
            r.role_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase()),
        )
      : roles,
    [roles, search]
  );

  const columns = [
    {
      key: "role_name" as const,
      label: "Role",
      render: (r: Role) => {
        const color = getRoleColor(r.role_name);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: color.bg,
                color: color.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={17} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "var(--altrex-text)", fontSize: "14px" }}>
                {r.role_name}
              </div>
              {r.description && (
                <div style={{ fontSize: "12px", color: "var(--altrex-muted)", marginTop: "2px" }}>
                  {r.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "role_id" as const,
      label: "Actions",
      render: (r: Role) => (
        <div className="altrex-row-actions" style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outline"
            onClick={() => {
              setActiveRole(r);
              setIsOpenModal(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", padding: "4px 10px" }}
          >
            <Settings size={13} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setActivePermissionRole(r);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              padding: "4px 10px",
            }}
          >
            <Lock size={13} />
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
            style={{
              color: "var(--altrex-danger-text)",
              borderColor: "rgba(220, 38, 38, 0.2)",
              fontSize: "12px",
              padding: "4px 10px",
            }}
          >
            <Trash2 size={13} />
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
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Roles & Permissions
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            Define access roles and configure permission levels for your organization.
          </p>
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

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(37, 99, 235, 0.1)",
              color: "var(--altrex-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              TOTAL ROLES
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {roles.length}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              CUSTOM ROLES
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {roles.length}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.1)",
              color: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              ROLES IN USE
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {roles.length}
            </div>
          </div>
        </div>
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
