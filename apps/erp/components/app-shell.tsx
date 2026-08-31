"use client";

import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeft,
  Settings,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ThemeDropdown } from "@/components/theme-dropdown";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useSessionStore } from "@/stores/session-store";
import { useUiStore } from "@/stores/ui-store";

const navigationItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Company Profile", href: "/profile", icon: Building2 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Roles", href: "/roles", icon: ShieldCheck },
  { label: "Customers", href: "/customers", icon: UserCheck },
  { label: "Vendors", href: "/vendors", icon: Truck },
  { label: "Items", href: "/items", icon: Package },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setSession = useSessionStore((state) => state.setSession);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await apiClient.post(endpoints.auth.logout, {});
    } catch (error) {
      // Log it — don't silently assume "session already expired".
      // If this fires consistently, the endpoint path itself is likely wrong.
      console.error("Logout request failed:", error);
    } finally {
      setSession(null);        // clear cached permissions/user immediately
      queryClient.clear();     // drop all cached query data — critical before a new user can log in
      router.push("/login");
    }
  };

  return (
    <div
      className={`altrex-shell ${collapsed ? "altrex-shell-collapsed" : ""}`}
    >
      <aside className="altrex-sidebar">
        <div className="altrex-brand">
          <span className="altrex-brand-mark">A</span>
          {collapsed ? null : <span>Altrex ERP</span>}
        </div>
        <nav aria-label="Primary navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={`altrex-nav-link ${
                  isActive ? "altrex-nav-link-active" : ""
                }`}
                href={item.href}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {collapsed ? null : <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="altrex-main">
        <header className="altrex-topbar">
          <button
            type="button"
            className="altrex-icon-button"
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
          >
            {collapsed ? <Menu size={20} /> : <PanelLeft size={20} />}
          </button>

          <span className="altrex-topbar-title">Enterprise Operations</span>

          <div className="altrex-topbar-end">
            <ThemeDropdown />

            <button
              type="button"
              id="topbar-logout"
              className="altrex-icon-button"
              aria-label="Sign out"
              title="Sign out"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        <main className="altrex-content">{children}</main>
      </div>
    </div>
  );
}
