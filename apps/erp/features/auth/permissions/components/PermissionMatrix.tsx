"use client";

import { Button } from "@altrex/ui";
import { Check, CheckSquare, Shield, Square } from "lucide-react";
import { useEffect, useState } from "react";
import type { PermissionItem } from "../api";

interface Props {
  initialPermissions: PermissionItem[];
  onSave: (permissions: PermissionItem[]) => Promise<void> | void;
  isSaving?: boolean;
  title: string;
}

export function PermissionMatrix({
  initialPermissions,
  onSave,
  isSaving,
  title,
}: Props) {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);

  useEffect(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

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
    onSave(permissions);
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

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Access Control Matrix</span>
          <h1>{title}</h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--altrex-muted)",
              fontSize: "14px",
            }}
          >
            Granted <strong>{grantedCount}</strong> of{" "}
            <strong>{totalCount}</strong> available permissions.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Check size={16} />
          {isSaving ? "Saving Changes..." : "Save Permissions"}
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "20px",
          marginTop: "24px",
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
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--altrex-line)",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Shield size={18} color="var(--altrex-primary)" />
                  <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    {moduleName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleAllInModule(moduleName, !allAllowed)
                  }
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "var(--altrex-link)",
                    fontSize: "12px",
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
                  gap: "8px",
                  flex: 1,
                }}
              >
                {items.map((item) => (
                  <label
                    key={item.permission_name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
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
                        width: "16px",
                        height: "16px",
                        accentColor: "var(--altrex-primary)",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
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
    </>
  );
}
