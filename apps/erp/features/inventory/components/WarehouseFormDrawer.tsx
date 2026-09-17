"use client";

import { Button } from "@altrex/ui";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Warehouse, WarehouseFormValues } from "../schema";

interface WarehouseFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: WarehouseFormValues) => void;
  isPending: boolean;
  initialData?: Warehouse | null;
}

export function WarehouseFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  initialData,
}: WarehouseFormDrawerProps) {
  const [warehouseName, setWarehouseName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (initialData) {
      setWarehouseName(initialData.warehouse_name || "");
      setAddress(initialData.address || "");
      setStatus(initialData.status || "active");
    } else {
      setWarehouseName("");
      setAddress("");
      setStatus("active");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseName.trim()) return;

    onSubmit({
      warehouse_name: warehouseName.trim(),
      address: address.trim(),
      status,
    });
  };

  return (
    <div className="altrex-dialog-backdrop" onClick={onClose}>
      <div
        className="altrex-dialog altrex-dialog-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--altrex-bg-card, #ffffff)",
          color: "var(--altrex-text, #0f172a)",
          borderColor: "var(--altrex-border, #e2e8f0)",
        }}
      >
        <div className="altrex-dialog-header" style={{ borderBottom: "1px solid var(--altrex-border, #e2e8f0)" }}>
          <div>
            <h3 className="altrex-dialog-title" style={{ color: "var(--altrex-text, #0f172a)" }}>
              {initialData ? "Edit Warehouse" : "Add Warehouse"}
            </h3>
            <p className="altrex-dialog-subtitle" style={{ color: "var(--altrex-muted, #64748b)" }}>
              {initialData
                ? "Update warehouse details and status."
                : "Register a new storage location or warehouse facility."}
            </p>
          </div>
          <button type="button" className="altrex-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="altrex-dialog-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label className="altrex-field">
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                Warehouse Name *
              </span>
              <input
                className="altrex-input"
                placeholder="e.g. Main Central Depot, Store Room 1"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--altrex-border, #cbd5e1)",
                  backgroundColor: "var(--altrex-bg, #ffffff)",
                  color: "var(--altrex-text, #0f172a)",
                }}
              />
            </label>

            <label className="altrex-field">
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                Address / Location
              </span>
              <textarea
                className="altrex-input"
                placeholder="Full address of the warehouse facility..."
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--altrex-border, #cbd5e1)",
                  backgroundColor: "var(--altrex-bg, #ffffff)",
                  color: "var(--altrex-text, #0f172a)",
                  resize: "vertical",
                }}
              />
            </label>

            <label className="altrex-field">
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                Status
              </span>
              <select
                className="altrex-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--altrex-border, #cbd5e1)",
                  backgroundColor: "var(--altrex-bg, #ffffff)",
                  color: "var(--altrex-text, #0f172a)",
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="altrex-dialog-footer" style={{ borderTop: "1px solid var(--altrex-border, #e2e8f0)", padding: "16px" }}>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : initialData ? "Update Warehouse" : "Save Warehouse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
