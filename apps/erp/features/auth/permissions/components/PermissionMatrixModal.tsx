"use client";

import { Button } from "@altrex/ui";
import { Check, Search, Shield, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAllPermissions, useRolePermissions, useUpdateRolePermissions } from "../api";
import type { PermissionItem } from "../api";

interface Props {
  roleId: string;
  roleName: string;
  onClose: () => void;
}

export function PermissionMatrixModal({ roleId, roleName, onClose }: Props) {
  const { data: allPermissions, isLoading: isLoadingAll } = useAllPermissions();
  const { data: rolePermissions, isLoading: isLoadingRole } = useRolePermissions(roleId);
  const { mutate: updatePermissions, isPending: isSaving } = useUpdateRolePermissions(roleId);

  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [activeModule, setActiveModule] = useState<string>("");
  const [permSearch, setPermSearch] = useState("");

  useEffect(() => {
    if (allPermissions && rolePermissions) {
      const rolePermissionMap = new Map(
        rolePermissions.map((p: { permission_name: string; is_allowed: boolean }) => [p.permission_name, p.is_allowed])
      );
      const merged = allPermissions.map((p: PermissionItem) => ({
        ...p,
        is_allowed: rolePermissionMap.get(p.permission_name) || false,
      }));
      setPermissions(merged);
    } else if (allPermissions) {
      setPermissions(allPermissions.map((p: PermissionItem) => ({ ...p, is_allowed: false })));
    }
  }, [allPermissions, rolePermissions]);

  // derive module list
  const modules = useMemo(() => {
    const mods = Array.from(new Set(permissions.map((p) => p.module_name || "General")));
    if (activeModule === "" && mods.length > 0) setActiveModule(mods[0]);
    return mods;
  }, [permissions]);

  const handleToggle = (permissionName: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.permission_name === permissionName ? { ...p, is_allowed: !p.is_allowed } : p,
      ),
    );
  };

  const handleToggleAllInModule = (moduleName: string, enable: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        (p.module_name || "General") === moduleName ? { ...p, is_allowed: enable } : p,
      ),
    );
  };

  const handleSave = () => {
    updatePermissions(permissions, { onSuccess: () => onClose() });
  };

  const totalCount = permissions.length;
  const grantedCount = permissions.filter((p) => p.is_allowed).length;

  const activeModuleItems = useMemo(() => {
    const items = permissions.filter((p) => (p.module_name || "General") === activeModule);
    if (!permSearch.trim()) return items;
    return items.filter((p) => p.permission_name.toLowerCase().includes(permSearch.toLowerCase()));
  }, [permissions, activeModule, permSearch]);

  const activeModuleAllowed = activeModuleItems.every((p) => p.is_allowed);
  const activeModuleGranted = activeModuleItems.filter((p) => p.is_allowed).length;

  if (isLoadingAll || isLoadingRole) {
    return (
      <div className="altrex-dialog-backdrop">
        <div className="altrex-dialog">
          <div className="altrex-table-state">
            <span className="altrex-spinner" />
            <span>Loading permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="altrex-dialog-backdrop" onClick={onClose}>
      <div
        className="altrex-dialog altrex-dialog-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="altrex-dialog-header" style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(37,99,235,0.1)",
                color: "var(--altrex-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h2 className="altrex-dialog-title">
                Permissions — {roleName}
              </h2>
              <p className="altrex-dialog-subtitle" style={{ margin: 0 }}>
                <span style={{ color: "var(--altrex-primary)", fontWeight: 700 }}>{grantedCount}</span>
                {" "}of{" "}
                <span style={{ fontWeight: 700 }}>{totalCount}</span>
                {" "}permissions granted
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="altrex-icon-button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: "0 24px", flexShrink: 0 }}>
          <div
            style={{
              height: "4px",
              background: "var(--altrex-line)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: totalCount > 0 ? `${(grantedCount / totalCount) * 100}%` : "0%",
                background: "var(--altrex-primary)",
                borderRadius: "2px",
                transition: "width 300ms ease",
              }}
            />
          </div>
        </div>

        {/* Body — two-column layout */}
        <div
          className="altrex-dialog-body"
          style={{ padding: "0", display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}
        >
          {/* Module Sidebar */}
          <div
            style={{
              width: "200px",
              flexShrink: 0,
              borderRight: "1px solid var(--altrex-line)",
              padding: "16px 0",
              overflowY: "auto",
            }}
          >
            {modules.map((mod) => {
              const modItems = permissions.filter((p) => (p.module_name || "General") === mod);
              const modGranted = modItems.filter((p) => p.is_allowed).length;
              const isActive = mod === activeModule;
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => { setActiveModule(mod); setPermSearch(""); }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
                    border: "none",
                    borderLeft: isActive ? "3px solid var(--altrex-primary)" : "3px solid transparent",
                    color: isActive ? "var(--altrex-primary)" : "var(--altrex-text)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 150ms",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {mod}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: modGranted > 0 ? "var(--altrex-primary)" : "var(--altrex-muted)",
                      background: modGranted > 0 ? "rgba(37,99,235,0.1)" : "var(--altrex-raised)",
                      padding: "1px 6px",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                  >
                    {modGranted}/{modItems.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Permission Items */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {/* Module toolbar */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--altrex-line)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <div style={{ position: "relative", flex: 1, maxWidth: "280px" }}>
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--altrex-muted)",
                  }}
                />
                <input
                  className="altrex-input"
                  placeholder="Search permissions..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  style={{ paddingLeft: "32px", height: "34px", fontSize: "13px" }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleToggleAllInModule(activeModule, !activeModuleAllowed)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--altrex-border)",
                  borderRadius: "6px",
                  color: "var(--altrex-link)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "5px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                {activeModuleAllowed ? "Deselect All" : "Select All"}
              </button>
              <span style={{ fontSize: "12px", color: "var(--altrex-muted)", marginLeft: "auto" }}>
                {activeModuleGranted}/{activeModuleItems.length} selected
              </span>
            </div>

            {/* Items list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
              {activeModuleItems.length === 0 ? (
                <div style={{ color: "var(--altrex-muted)", fontSize: "13px", padding: "20px 0", textAlign: "center" }}>
                  No permissions found
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {activeModuleItems.map((item) => {
                    const actionParts = item.permission_name.split(":");
                    const action = actionParts[actionParts.length - 1];
                    const actionColors: Record<string, { bg: string; color: string }> = {
                      view: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
                      create: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
                      update: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
                      delete: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
                    };
                    const chip = actionColors[action] || { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" };

                    return (
                      <label
                        key={item.permission_name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "background 120ms ease-out",
                          background: item.is_allowed
                            ? "color-mix(in srgb, var(--altrex-primary) 6%, var(--altrex-surface))"
                            : "transparent",
                          border: item.is_allowed
                            ? "1px solid rgba(37,99,235,0.15)"
                            : "1px solid transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.is_allowed}
                          onChange={() => handleToggle(item.permission_name)}
                          style={{
                            width: "16px",
                            height: "16px",
                            accentColor: "var(--altrex-primary)",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: item.is_allowed ? 600 : 400,
                            color: "var(--altrex-text)",
                            fontFamily: "monospace",
                            flex: 1,
                          }}
                        >
                          {item.permission_name}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: chip.bg,
                            color: chip.color,
                            flexShrink: 0,
                          }}
                        >
                          {action}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="altrex-dialog-footer" style={{ flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Check size={16} />
            {isSaving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </div>
    </div>
  );
}
