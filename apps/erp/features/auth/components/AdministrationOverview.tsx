"use client";

import { extractRecords } from "@/features/dashboard/utils";
import { useSessionStore } from "@/stores/session-store";
import {
  ArrowRight,
  Building2,
  Key,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useRoles } from "../roles/api";
import type { Role } from "../roles/schema";
import { useUsers } from "../users/api";
import type { User } from "../users/schema";

function getUserName(u: User): string {
  const first = u.firstName ?? u.first_name ?? "";
  const last = u.lastName ?? u.last_name ?? "";
  const full = `${first} ${last}`.trim();
  return full || u.email || "Unnamed User";
}

function getUserRole(u: User, rolesList: Role[]): string {
  if (u.role_name) return u.role_name;
  const rId = u.roleId ?? u.role_id;
  if (rId != null) {
    const match = rolesList.find((r) => String(r.role_id) === String(rId));
    if (match) return match.role_name;
    return `Role #${rId}`;
  }
  return "Standard Role";
}

function getRolePermissionCount(r: Role): string {
  const permCount = (r as any).permission_count ?? (r as any).permissions?.length;
  if (typeof permCount === "number") {
    return `${permCount} permissions`;
  }
  if (Array.isArray((r as any).permissions)) {
    return `${(r as any).permissions.length} permissions`;
  }
  return r.description || "Configured access";
}

export function AdministrationOverview() {
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { session } = useSessionStore();

  const users = useMemo(() => {
    if (Array.isArray(usersData)) return usersData as User[];
    const extracted = extractRecords(usersData);
    return extracted as unknown as User[];
  }, [usersData]);

  const roles = useMemo(() => {
    if (Array.isArray(rolesData)) return rolesData as Role[];
    const extracted = extractRecords(rolesData);
    return extracted as unknown as Role[];
  }, [rolesData]);

  const activeUsersCount = useMemo(() => {
    return users.filter((u) => u.status !== "inactive").length;
  }, [users]);

  const lastUsers = useMemo(() => {
    return [...users].slice(-8).reverse();
  }, [users]);

  const currentUserName = session?.user?.name || "System Admin";
  const currentUserRole = session?.isSuperAdmin
    ? "Super Administrator"
    : session?.user?.email
      ? `Staff (${session.user.email})`
      : "Authorized User";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">ADMINISTRATION & SECURITY</span>
          <h1>Administration Overview</h1>
          <p>
            Manage system users, access roles, security permissions, and enterprise settings.
          </p>
        </div>
        <div className="dashboard-actions">
          <Link href="/users" className="altrex-button altrex-button-primary">
            <Plus size={16} />
            New user
          </Link>
          <Link href="/roles" className="altrex-button altrex-button-secondary">
            <Settings size={16} />
            Configure roles
          </Link>
        </div>
      </header>

      {session?.user && (
        <div
          className="dashboard-notice"
          style={{
            background: "color-mix(in srgb, var(--altrex-primary) 8%, var(--altrex-surface))",
            color: "var(--altrex-text)",
            border: "1px solid color-mix(in srgb, var(--altrex-primary) 20%, var(--altrex-border))",
          }}
        >
          <Key size={16} style={{ color: "var(--altrex-primary)", flexShrink: 0 }} />
          <span>
            Active Session: <b>{session.user.name}</b> (
            {session.isSuperAdmin ? "Super Admin" : "User"})
            {session.user.email ? ` · ${session.user.email}` : ""}
            {session.company?.name ? ` · ${session.company.name}` : ""}
          </span>
        </div>
      )}

      {/* Metrics Row (3 cards) */}
      <section
        className="dashboard-metrics"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
      >
        <Link className="dashboard-metric dashboard-panel" href="/users">
          <div className="dashboard-metric-top">
            <span>Total Users</span>
            <i className="dashboard-icon blue">
              <Users size={17} />
            </i>
          </div>
          <strong>{usersLoading ? "—" : String(users.length)}</strong>
          <small>{activeUsersCount} active accounts</small>
        </Link>

        <Link className="dashboard-metric dashboard-panel" href="/roles">
          <div className="dashboard-metric-top">
            <span>Total Roles</span>
            <i className="dashboard-icon violet">
              <ShieldCheck size={17} />
            </i>
          </div>
          <strong>{rolesLoading ? "—" : String(roles.length)}</strong>
          <small>Access control profiles</small>
        </Link>

        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Current User</span>
            <i className="dashboard-icon green">
              <UserCheck size={17} />
            </i>
          </div>
          <strong>{currentUserName}</strong>
          <small>{currentUserRole}</small>
        </div>
      </section>

      {/* Panels */}
      <section
        className="dashboard-main-grid"
        style={{
          gridTemplateAreas: "none",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          alignItems: "start",
        }}
      >
        {/* Panel 1: Quick Links */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Quick Links</h2>
              <span>Administration and security modules</span>
            </div>
          </div>
          <div className="dashboard-network">
            <Link href="/users">
              <Users size={17} />
              <div>
                <span style={{ fontWeight: 600, display: "block" }}>Users</span>
                <small style={{ color: "var(--altrex-muted)", fontSize: "10px" }}>
                  Manage team accounts, credentials, and access status
                </small>
              </div>
              <b>{users.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/roles">
              <ShieldCheck size={17} />
              <div>
                <span style={{ fontWeight: 600, display: "block" }}>Roles & Permissions</span>
                <small style={{ color: "var(--altrex-muted)", fontSize: "10px" }}>
                  Define security roles and configure granular permissions
                </small>
              </div>
              <b>{roles.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/profile">
              <Building2 size={17} />
              <div>
                <span style={{ fontWeight: 600, display: "block" }}>Company Profile</span>
                <small style={{ color: "var(--altrex-muted)", fontSize: "10px" }}>
                  Manage business identity, GST credentials, and locations
                </small>
              </div>
              <span />
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* Panel 2: Users List */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent Users</h2>
              <span>Last 8 user accounts in the organization</span>
            </div>
            <Link
              href="/users"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "var(--altrex-primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              All users <ArrowRight size={12} />
            </Link>
          </div>
          {usersLoading ? (
            <div className="dashboard-empty">
              <span className="altrex-spinner" aria-hidden="true" />
              <span>Loading users...</span>
            </div>
          ) : lastUsers.length ? (
            <div className="dashboard-activity">
              {lastUsers.map((u) => (
                <Link
                  key={u.user_id ?? u.id ?? u.email}
                  href="/users"
                  className="dashboard-activity-row"
                >
                  <span className="dashboard-activity-icon">
                    <UserCheck size={16} />
                  </span>
                  <span className="dashboard-activity-name">
                    <b>{getUserName(u)}</b>
                    <small>
                      {u.email} · {getUserRole(u, roles)}
                    </small>
                  </span>
                  <strong
                    style={{
                      color:
                        u.status === "inactive"
                          ? "var(--altrex-muted)"
                          : "var(--altrex-success, #16a34a)",
                      fontSize: "10px",
                      textTransform: "capitalize",
                    }}
                  >
                    {u.status || "active"}
                  </strong>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Users size={25} />
              <span>No users found</span>
            </div>
          )}
        </section>

        {/* Panel 3: Roles List */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Roles & Permissions</h2>
              <span>Access control and security definitions</span>
            </div>
            <Link
              href="/roles"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "var(--altrex-primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>
          {rolesLoading ? (
            <div className="dashboard-empty">
              <span className="altrex-spinner" aria-hidden="true" />
              <span>Loading roles...</span>
            </div>
          ) : roles.length ? (
            <div className="dashboard-activity">
              {roles.map((r) => (
                <Link
                  key={r.role_id}
                  href="/roles"
                  className="dashboard-activity-row"
                >
                  <span className="dashboard-activity-icon">
                    <Lock size={16} />
                  </span>
                  <span className="dashboard-activity-name">
                    <b>{r.role_name}</b>
                    <small>{r.description || "System security role"}</small>
                  </span>
                  <strong style={{ fontSize: "11px" }}>
                    {getRolePermissionCount(r)}
                  </strong>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <ShieldCheck size={25} />
              <span>No roles defined</span>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
