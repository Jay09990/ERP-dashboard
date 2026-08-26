"use client";

import { Menu, Monitor, Moon, PanelLeft, Sun } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { navigation } from "@/config/navigation";
import { useUiStore } from "@/stores/ui-store";

export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const themePreference = useUiStore((state) => state.themePreference);
  const cycleTheme = useUiStore((state) => state.cycleTheme);
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
          {navigation.map((item) => (
            <Link className="altrex-nav-link" href={item.href} key={item.href}>
              {collapsed ? item.label.slice(0, 1) : item.label}
            </Link>
          ))}
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
          <button
            type="button"
            className="altrex-icon-button"
            aria-label={`Theme: ${themePreference}`}
            title={`Theme: ${themePreference}`}
            onClick={cycleTheme}
          >
            {themePreference === "dark" ? (
              <Moon size={20} />
            ) : themePreference === "light" ? (
              <Sun size={20} />
            ) : (
              <Monitor size={20} />
            )}
          </button>
          <span className="altrex-topbar-title">Company workspace</span>
        </header>
        <main className="altrex-content">{children}</main>
      </div>
    </div>
  );
}
