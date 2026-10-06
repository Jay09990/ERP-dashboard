"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Loader2,
  LogOut,
  Menu,
  PanelLeft,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ThemeDropdown } from "@/components/theme-dropdown";
import {
  NavChildItem,
  type NavParentItem,
  NavSubGroup,
  navigationConfig,
} from "@/config/navigation";
import { seedModeEnabled } from "@/config/seed-mode";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getPermissionSet } from "@/lib/auth/permissions";
import { clearToken } from "@/lib/auth/token";
import { useSessionStore } from "@/stores/session-store";
import { useUiStore } from "@/stores/ui-store";

// Static module-scoped helpers for route matching to preserve reference identity across renders
function isRouteActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/") {
    return pathname === href;
  }
  return pathname.startsWith(href);
}

function isParentActive(pathname: string, parent: NavParentItem) {
  if (parent.href) {
    return isRouteActive(pathname, parent.href, true);
  }
  if (parent.children) {
    return parent.children.some((child) => isRouteActive(pathname, child.href));
  }
  if (parent.subGroups) {
    return parent.subGroups.some((sg) =>
      sg.items.some((child) => isRouteActive(pathname, child.href)),
    );
  }
  return false;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setSession = useSessionStore((state) => state.setSession);
  const session = useSessionStore((state) => state.session);

  const [loggingOut, setLoggingOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFlyout, setActiveFlyout] = useState<string | null>(null);

  // Close flyout on Escape key press
  useEffect(() => {
    if (!activeFlyout) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveFlyout(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFlyout]);

  // Pure helper to check permission against session permissions reference.
  // Defined at component scope using useCallback to avoid closure allocation on every render.
  const sessionPermissions = session?.permissions;

  // Helper to check if a specific route is active
  const isRouteActive = useCallback(
    (href: string, exact?: boolean) => {
      if (exact || href === "/") {
        return pathname === href;
      }
      return pathname.startsWith(href);
    },
    [pathname],
  );

  // Helper to check if a parent item contains the active route
  const isParentActive = useCallback(
    (parent: NavParentItem) => {
      if (parent.href) {
        return isRouteActive(parent.href, true);
      }
      if (parent.children) {
        return parent.children.some((child) => isRouteActive(child.href));
      }
      if (parent.subGroups) {
        return parent.subGroups.some((sg) =>
          sg.items.some((child) => isRouteActive(child.href)),
        );
      }
      return false;
    },
    [isRouteActive],
  );

  // Auto-expand the parent that contains the active route on pathname change
  useEffect(() => {
    for (const parent of navigationConfig) {
      if (isParentActive(pathname, parent)) {
        setOpenGroups((prev) => ({ ...prev, [parent.id]: true }));
      }
    }
  }, [isParentActive]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // No backend logout endpoint — JWT is stateless.
      // Clear client-side token and session; redirect to login.
      clearToken();
      setSession(null);
      queryClient.clear();
    } catch (error) {
      console.error("Logout cleanup failed:", error);
    } finally {
      window.location.href = "/login?logout=1";
    }
  };

  // Permission filtering helper — login returns objects; normalize to name strings.
  const checkHasPermission = useCallback(
    (permKey?: string) => {
      if (!permKey) return true;
      if (!sessionPermissions) return true;
      return sessionHasPermission(sessionPermissions, permKey);
    },
    [sessionPermissions],
  );

  // Filtered navigation based on permissions and search query.
  // Uses checkHasPermission and sessionPermissions dependencies to avoid re-evaluating navigation
  // permissions when unrelated state (such as activeFlyout or loggingOut) updates.
  const filteredNav = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return navigationConfig
      .filter((parent) => checkHasPermission(parent.permission))
      .map((parent) => {
        if (parent.href) {
          const matches =
            !q ||
            parent.label.toLowerCase().includes(q) ||
            parent.id.toLowerCase().includes(q);
          return matches ? parent : null;
        }

        if (parent.children) {
          const visibleChildren = parent.children.filter(
            (c) =>
              checkHasPermission(c.permission) &&
              (!q ||
                c.label.toLowerCase().includes(q) ||
                parent.label.toLowerCase().includes(q)),
          );
          if (visibleChildren.length === 0) return null;
          return { ...parent, children: visibleChildren };
        }

        if (parent.subGroups) {
          const visibleSubGroups = parent.subGroups
            .map((sg) => {
              const visibleItems = sg.items.filter(
                (item) =>
                  checkHasPermission(item.permission) &&
                  (!q ||
                    item.label.toLowerCase().includes(q) ||
                    sg.title.toLowerCase().includes(q) ||
                    parent.label.toLowerCase().includes(q)),
              );
              return { ...sg, items: visibleItems };
            })
            .filter((sg) => sg.items.length > 0);

          if (visibleSubGroups.length === 0) return null;
          return { ...parent, subGroups: visibleSubGroups };
        }

        return parent;
      })
      .filter(Boolean) as NavParentItem[];
  }, [checkHasPermission, searchQuery]);

  return (
    <div
      className={`altrex-shell ${collapsed ? "altrex-shell-collapsed" : ""}`}
    >
      <a href="#main-content" className="altrex-skip-link">
        Skip to main content
      </a>
      <aside className="altrex-sidebar">
        {/* Brand bar */}
        <div className="altrex-brand">
          <span className="altrex-brand-mark">A</span>
          {collapsed ? null : <span>Altrex ERP</span>}
        </div>

        {/* Sidebar Scrollable Nav */}
        <div className="altrex-sidebar-nav">
          {/* Quick Search Bar (when expanded) */}
          {!collapsed && (
            <div className="altrex-nav-search-wrap">
              <Search className="altrex-nav-search-icon" size={14} />
              <input
                type="text"
                className="altrex-nav-search-input"
                placeholder="Search menu..."
                aria-label="Search navigation menu"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && searchQuery) {
                    setSearchQuery("");
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--altrex-muted)",
                    padding: 2,
                  }}
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <nav aria-label="Primary navigation">
            {filteredNav.map((parent) => {
              const Icon = parent.icon;
              const isDirectLink = Boolean(parent.href);
              const parentActive = isParentActive(pathname, parent);
              const isExpanded = Boolean(openGroups[parent.id] || searchQuery);

              // Standalone direct link (e.g. Dashboard)
              if (isDirectLink && parent.href) {
                const active = isRouteActive(pathname, parent.href, true);
                return (
                  <Link
                    key={parent.id}
                    href={parent.href}
                    className={`altrex-nav-parent-btn ${
                      active
                        ? "altrex-nav-parent-active altrex-nav-child-active"
                        : ""
                    }`}
                    title={collapsed ? parent.label : undefined}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    {collapsed ? null : <span>{parent.label}</span>}
                  </Link>
                );
              }

              // Collapsed Mode (Icon only with Flyout Popover)
              if (collapsed) {
                const isOpenFlyout = activeFlyout === parent.id;
                return (
                  <div
                    key={parent.id}
                    className="altrex-nav-collapsed-wrapper"
                    onMouseEnter={() => setActiveFlyout(parent.id)}
                    onMouseLeave={() => setActiveFlyout(null)}
                    onFocus={() => setActiveFlyout(parent.id)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setActiveFlyout(null);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className={`altrex-nav-parent-btn ${
                        parentActive ? "altrex-nav-parent-active" : ""
                      }`}
                      aria-label={parent.label}
                      aria-haspopup="true"
                      aria-expanded={isOpenFlyout}
                      aria-controls={`flyout-menu-${parent.id}`}
                      title={parent.label}
                      onClick={() => {
                        toggleSidebar();
                        setOpenGroups((prev) => ({
                          ...prev,
                          [parent.id]: true,
                        }));
                        setActiveFlyout(null);
                      }}
                    >
                      <Icon size={18} style={{ flexShrink: 0 }} />
                    </button>

                    {/* Collapsed Flyout Popover */}
                    {isOpenFlyout && (
                      <div
                        id={`flyout-menu-${parent.id}`}
                        className="altrex-nav-flyout"
                        role="menu"
                        aria-label={parent.label}
                      >
                        <div
                          className="altrex-nav-flyout-header"
                          role="presentation"
                        >
                          {parent.label}
                        </div>

                        {parent.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isRouteActive(
                            pathname,
                            child.href,
                          );
                          return (
                            <Link
                              key={child.id}
                              href={child.href}
                              role="menuitem"
                              onClick={() => setActiveFlyout(null)}
                              className={`altrex-nav-child-link ${
                                childActive ? "altrex-nav-child-active" : ""
                              }`}
                            >
                              {ChildIcon && <ChildIcon size={14} />}
                              <span>{child.label}</span>
                              {child.badge && (
                                <span className="altrex-nav-badge">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}

                        {parent.subGroups?.map((sg) => (
                          <div
                            key={sg.id}
                            className="altrex-nav-subgroup"
                            role="group"
                            aria-label={sg.title}
                          >
                            <span className="altrex-nav-subgroup-title">
                              {sg.title}
                            </span>
                            {sg.items.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = isRouteActive(
                                pathname,
                                child.href,
                              );
                              return (
                                <Link
                                  key={child.id}
                                  href={child.href}
                                  role="menuitem"
                                  onClick={() => setActiveFlyout(null)}
                                  className={`altrex-nav-child-link ${
                                    childActive ? "altrex-nav-child-active" : ""
                                  }`}
                                >
                                  {ChildIcon && <ChildIcon size={14} />}
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Expanded Mode (Accordion with Children / SubGroups)
              return (
                <div key={parent.id} className="altrex-nav-group">
                  <button
                    type="button"
                    className={`altrex-nav-parent-btn ${
                      parentActive ? "altrex-nav-parent-active" : ""
                    } ${isExpanded ? "altrex-nav-parent-open" : ""}`}
                    onClick={() => toggleGroup(parent.id)}
                    aria-expanded={isExpanded}
                  >
                    <Icon size={18} style={{ flexShrink: 0 }} />
                    <span>{parent.label}</span>
                    <ChevronRight
                      size={15}
                      className={`altrex-nav-chevron ${
                        isExpanded ? "altrex-nav-chevron-rotated" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="altrex-nav-children">
                      {/* Standard direct children */}
                      {parent.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isRouteActive(pathname, child.href);
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={`altrex-nav-child-link ${
                              childActive ? "altrex-nav-child-active" : ""
                            }`}
                          >
                            {ChildIcon && (
                              <ChildIcon size={14} style={{ flexShrink: 0 }} />
                            )}
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {child.label}
                            </span>
                            {child.badge && (
                              <span className="altrex-nav-badge">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}

                      {/* Sub-grouped children (e.g. inside Masters) */}
                      {parent.subGroups?.map((sg) => (
                        <div key={sg.id} className="altrex-nav-subgroup">
                          <span className="altrex-nav-subgroup-title">
                            {sg.title}
                          </span>
                          {sg.items.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isRouteActive(
                              pathname,
                              child.href,
                            );
                            return (
                              <Link
                                key={child.id}
                                href={child.href}
                                className={`altrex-nav-child-link ${
                                  childActive ? "altrex-nav-child-active" : ""
                                }`}
                              >
                                {ChildIcon && (
                                  <ChildIcon
                                    size={14}
                                    style={{ flexShrink: 0 }}
                                  />
                                )}
                                <span
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {child.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="altrex-main">
        <header className="altrex-topbar">
          <button
            type="button"
            className="altrex-icon-button"
            aria-label="Toggle sidebar"
            aria-expanded={!collapsed}
            onClick={toggleSidebar}
          >
            {collapsed ? <Menu size={20} /> : <PanelLeft size={20} />}
          </button>

          <span className="altrex-topbar-title">Enterprise Operations</span>

          {seedModeEnabled && (
            <span
              role="status"
              style={{
                borderRadius: 999,
                padding: "4px 10px",
                color: "#854d0e",
                background: "#fef3c7",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Demo data · read only
            </span>
          )}

          <div className="altrex-topbar-end">
            <ThemeDropdown />

            <button
              type="button"
              id="topbar-logout"
              className="altrex-icon-button"
              aria-label={loggingOut ? "Signing out..." : "Sign out"}
              aria-busy={loggingOut}
              title={loggingOut ? "Signing out..." : "Sign out"}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Loader2 className="animate-spin" size={19} />
              ) : (
                <LogOut size={19} />
              )}
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="altrex-content">
          {children}
        </main>
      </div>
    </div>
  );
}
