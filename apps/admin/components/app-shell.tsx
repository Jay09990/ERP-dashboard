"use client";

import { LogOut, Menu, PanelLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { navigation } from "@/config/navigation";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useUiStore } from "@/stores/ui-store";
import { ThemeDropdown } from "@/components/theme-dropdown";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // POST /api/admin/logout — no payload; server invalidates session cookie
      await apiClient.post(endpoints.admin.logout, {});
    } catch {
      // Even if the server call fails, clear client state and redirect.
      // The session may already be expired or the server may return 200 with no body.
    } finally {
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
        <nav aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link className="altrex-nav-link" href={item.href} key={item.href}>
              {collapsed ? item.label.slice(0, 1) : item.label}
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
