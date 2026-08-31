"use client";

import { Button, DataTable, FilterBar, StatusPill } from "@altrex/ui";
import { KeyRound, Plus, Shield, Trash2, UserPlus, UserX } from "lucide-react";
import { useState } from "react";
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

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : users;

  const columns = [
    {
      key: "status" as const,
      label: "Status",
      render: (u: User) => <StatusPill status={u.status} />,
    },
    {
      key: "firstName" as const,
      label: "Name",
      render: (u: User) => (
        <span style={{ fontWeight: 600 }}>
          {`${u.firstName} ${u.lastName ?? ""}`.trim()}
        </span>
      ),
    },
    { key: "email" as const, label: "Email" },
    {
      key: "phone" as const,
      label: "Phone",
      render: (u: User) => u.phone || "—",
    },
    {
      key: "user_id" as const,
      label: "Actions",
      render: (u: User) => (
        <div className="altrex-row-actions">
          <Button
            variant="outline"
            onClick={() => {
              setActiveUser(u);
              setIsOpenDrawer(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setActivePermissionUser(u);
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
                confirm(`Are you sure you want to delete user ${u.firstName}?`)
              ) {
                deleteUser(u.user_id.toString());
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
          <span className="altrex-eyebrow">Enterprise Access</span>
          <h1>Users</h1>
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

      <FilterBar>
        <input
          className="altrex-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "320px" }}
        />
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
          userId={activePermissionUser.user_id.toString()}
          userName={`${activePermissionUser.firstName} ${activePermissionUser.lastName ?? ""}`.trim()}
          onClose={() => {
            setActivePermissionUser(null);
          }}
        />
      )}
    </>
  );
}
