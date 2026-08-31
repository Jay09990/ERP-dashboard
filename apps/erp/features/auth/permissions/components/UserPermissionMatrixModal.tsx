"use client";

import { Button } from "@altrex/ui";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAllPermissions, useUpdateUserPermissions, useUserPermissions } from "../api";
import type { PermissionItem } from "../api";

interface Props {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function UserPermissionMatrixModal({ userId, userName, onClose }: Props) {
  const { data: allPermissions, isLoading: isLoadingAll } = useAllPermissions();
  const { data: userPermissions, isLoading: isLoadingUser } = useUserPermissions(userId);
  const { mutate: updatePermissions, isPending: isSaving } = useUpdateUserPermissions(userId);
  
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);

  // Merge all permissions with user's current permissions
  useEffect(() => {
    if (allPermissions && userPermissions) {
      const userPermissionMap = new Map(
        userPermissions.map(p => [p.permission_name, p.is_allowed])
      );
      
      const merged = allPermissions.map(p => ({
        ...p,
        is_allowed: userPermissionMap.get(p.permission_name) || false
      }));
      
      setPermissions(merged);
    } else if (allPermissions) {
      // If user has no permissions yet, show all permissions as unchecked
      setPermissions(allPermissions.map(p => ({ ...p, is_allowed: false })));
    }
  }, [allPermissions, userPermissions]);

  const handleToggle = (permissionName: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.permission_name === permissionName
          ? { ...p, is_allowed: !p.is_allowed }
          : p,
      ),
    );
  };

  const handleToggleAllInModule = (moduleName: string, enable: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        (p.module_name || "General") === moduleName
          ? { ...p, is_allowed: enable }
          : p,
      ),
    );
  };

  const handleSave = () => {
    updatePermissions(permissions, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // Group by module_name
  const grouped = permissions.reduce(
    (acc, item) => {
      const mod = item.module_name || "General";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(item);
      return acc;
    },
    {} as Record<string, PermissionItem[]>,
  );

  const totalCount = permissions.length;
  const grantedCount = permissions.filter((p) => p.is_allowed).length;

  if (isLoadingAll || isLoadingUser) {
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
      >
        <div className="altrex-dialog-header">
          <div>
            <h2 className="altrex-dialog-title">
              Edit Permissions: {userName}
            </h2>
            <p className="altrex-dialog-subtitle">
              Granted <strong>{grantedCount}</strong> of{" "}
              <strong>{totalCount}</strong> available permissions.
            </p>
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

        <div className="altrex-dialog-body" style={{ padding: "16px 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {Object.entries(grouped).map(([moduleName, items]) => {
              const allAllowed = items.every((i) => i.is_allowed);
              const someAllowed = items.some((i) => i.is_allowed);

              return (
                <section
                  key={moduleName}
                  className="altrex-detail-card"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "10px",
                      borderBottom: "1px solid var(--altrex-line)",
                      marginBottom: "10px",
                    }}
                  >
                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                      {moduleName}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleAllInModule(moduleName, !allAllowed)
                      }
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "var(--altrex-link)",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: "2px 6px",
                      }}
                    >
                      {allAllowed ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      flex: 1,
                    }}
                  >
                    {items.map((item) => (
                      <label
                        key={item.permission_name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background 120ms ease-out",
                          background: item.is_allowed
                            ? "color-mix(in srgb, var(--altrex-primary) 6%, var(--altrex-surface))"
                            : "transparent",
                        }}
                        className="altrex-hover-bg"
                      >
                        <input
                          type="checkbox"
                          checked={item.is_allowed}
                          onChange={() => handleToggle(item.permission_name)}
                          style={{
                            width: "14px",
                            height: "14px",
                            accentColor: "var(--altrex-primary)",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: item.is_allowed ? 600 : 400,
                            color: "var(--altrex-text)",
                            fontFamily: "monospace",
                          }}
                        >
                          {item.permission_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="altrex-dialog-footer">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
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
