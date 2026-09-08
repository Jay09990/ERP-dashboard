"use client";

import { Button, DataTable, FilterBar } from "@altrex/ui";
import { KeyRound, Plus, Shield, Trash2, UserPlus, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeleteUser, useUsers } from "../api";
import type { User } from "../schema";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { UserFormDrawer } from "./UserFormDrawer";
import { UserPermissionMatrixModal } from "../../permissions/components/UserPermissionMatrixModal";

export function UserList() {
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isOpenPasswordModal, setIsOpenPasswordModal] = useState(false);
  const [activePermissionUser, setActivePermissionUser] = useState<User | null>(null);

  const { data: responseData, isLoading, error } = useUsers();
  const users: User[] = Array.isArray(responseData)
    ? responseData
    : ((responseData as any)?.users ?? (responseData as any)?.data ?? []);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  // Filter status state
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getFirstName = (u: User) => u.firstName ?? u.first_name ?? "";
  const getLastName = (u: User) => u.lastName ?? u.last_name ?? "";
  const getRoleId = (u: User) => u.roleId ?? u.role_id;
  const getUserId = (u: User) => u.user_id ?? u.id;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const fn = getFirstName(u);
      const ln = getLastName(u);
      const matchSearch =
        !search.trim() ||
        fn.toLowerCase().includes(search.toLowerCase()) ||
        ln.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || u.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const activeCount = users.filter((u) => u.status === "active").length;
  const inactiveCount = users.filter((u) => u.status === "inactive").length;
  const uniqueRolesCount = new Set(users.map((u) => getRoleId(u)).filter(Boolean)).size;

  const getInitials = (firstName: string, lastName?: string) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return (f + l).toUpperCase() || "U";
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      "linear-gradient(135deg, #10b981, #047857)",
      "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      "linear-gradient(135deg, #f59e0b, #b45309)",
      "linear-gradient(135deg, #ec4899, #be185d)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const columns = [
    {
      key: "firstName" as const,
      label: "User",
      render: (u: User) => {
        const fn = getFirstName(u);
        const ln = getLastName(u);
        const fullName = `${fn} ${ln}`.trim() || u.email;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: getAvatarBg(fullName),
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px",
                flexShrink: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {getInitials(fn, ln)}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600, color: "var(--altrex-text)", fontSize: "14px" }}>
                {fullName}
              </span>
              <span style={{ fontSize: "12px", color: "var(--altrex-muted)" }}>
                {u.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status" as const,
      label: "Status",
      render: (u: User) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 600,
            background:
              u.status === "active"
                ? "rgba(16, 185, 129, 0.12)"
                : "rgba(100, 116, 139, 0.12)",
            color:
              u.status === "active"
                ? "#10b981"
                : "var(--altrex-muted)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: u.status === "active" ? "#10b981" : "#94a3b8",
            }}
          />
          {u.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "phone" as const,
      label: "Phone",
      render: (u: User) => (
        <span style={{ fontSize: "13px", color: "var(--altrex-text)" }}>
          {u.phone || "—"}
        </span>
      ),
    },
    {
      key: "user_id" as const,
      label: "Actions",
      render: (u: User) => {
        const userId = getUserId(u)?.toString() ?? "";
        const fn = getFirstName(u);
        return (
          <div className="altrex-row-actions" style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outline"
              onClick={() => {
                setActiveUser(u);
                setIsOpenDrawer(true);
              }}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setActivePermissionUser(u);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                padding: "4px 10px",
              }}
            >
              <Shield size={13} />
              Permissions
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (
                  confirm(`Are you sure you want to delete user ${fn || u.email}?`)
                ) {
                  deleteUser(userId);
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
        );
      },
    },
  ];

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Enterprise Access</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            User Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            Manage user accounts, credentials, status, and custom security roles.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button
            variant="outline"
            onClick={() => setIsOpenPasswordModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <KeyRound size={15} />
            Change Password
          </Button>
          <Button
            onClick={() => {
              setActiveUser(null);
              setIsOpenDrawer(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            Add User
          </Button>
        </div>
      </div>

      {/* KPI Cards Summary */}
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
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
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
            <UserPlus size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              TOTAL USERS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {users.length}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
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
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              ACTIVE USERS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {activeCount}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserX size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              INACTIVE USERS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {inactiveCount}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
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
            <KeyRound size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              ROLES ASSIGNED
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {uniqueRolesCount}
            </div>
          </div>
        </div>
      </div>

      <FilterBar>
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <input
            className="altrex-input"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "320px" }}
          />
          <select
            className="altrex-input altrex-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </FilterBar>

      {isLoading ? (
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading users...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load users from the server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filtered}
          rowKey={(u, idx) => getUserId(u) ?? idx}
        />
      )}

      {isOpenDrawer && (
        <UserFormDrawer
          user={activeUser}
          onClose={() => {
            setIsOpenDrawer(false);
            setActiveUser(null);
          }}
        />
      )}

      {isOpenPasswordModal && (
        <ChangePasswordModal onClose={() => setIsOpenPasswordModal(false)} />
      )}

      {activePermissionUser && (
        <UserPermissionMatrixModal
          userId={(getUserId(activePermissionUser) ?? "").toString()}
          userName={`${getFirstName(activePermissionUser)} ${getLastName(activePermissionUser)}`.trim() || activePermissionUser.email}
          roleId={(getRoleId(activePermissionUser) ?? "").toString()}
          onClose={() => {
            setActivePermissionUser(null);
          }}
        />
      )}
    </>
  );
}

