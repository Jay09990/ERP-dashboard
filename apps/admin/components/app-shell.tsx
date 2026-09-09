"use client";

import { LogOut, Menu, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ThemeDropdown } from "@/components/theme-dropdown";
import { navigation } from "@/config/navigation";
import { apiClient } from "@/lib/api/client";
import { clearToken } from "@/lib/auth/token";
import { endpoints } from "@/lib/api/endpoints";
import { useSessionStore } from "@/stores/session-store";
import { useUiStore } from "@/stores/ui-store";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setSession = useSessionStore((state) => state.setSession);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await apiClient.post(endpoints.admin.logout, {});
    } catch (error) {
      // Log it — don't silently assume "session already expired".
      // If this fires consistently, the endpoint path itself is likely wrong.
      console.error("Logout request failed:", error);
    } finally {
      clearToken();
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
          {collapsed ? null : <span>Altrex Admin</span>}
        </div>
        <nav className="altrex-sidebar-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              className={`altrex-nav-child-link ${
                pathname === item.href ? "altrex-nav-child-active" : ""
              }`}
              href={item.href}
              key={item.href}
              title={collapsed ? item.label : undefined}
            >
              <span>{collapsed ? item.label.slice(0, 1) : item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="altrex-main">
        <header className="altrex-topbar">
          {/* Sidebar toggle */}
          <button
            type="button"
            className="altrex-icon-button"
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
          >
            {collapsed ? <Menu size={20} /> : <PanelLeft size={20} />}
          </button>

          {/* Title — pushes right-side controls to the end */}
          <span className="altrex-topbar-title">Platform workspace</span>

          {/* Right-side controls */}
          <div className="altrex-topbar-end">
            {/* Theme dropdown */}
            <ThemeDropdown />

            {/* Logout */}
            <button
              type="button"
              id="topbar-logout"
              className="altrex-icon-button"
              aria-label="Sign out"
              title="Sign out"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="altrex-content">{children}</main>
      </div>
    </div>
  );
}
