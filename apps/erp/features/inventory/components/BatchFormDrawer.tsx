"use client";

import { useItems } from "@/features/items/api";
import { Button } from "@altrex/ui";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Batch, BatchFormValues } from "../schema";

function extractList<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);
  for (const nestedValue of Object.values(value)) {
    const nested = extractList<T>(nestedValue, visited);
    if (nested.length > 0) return nested;
  }
  return [];
}

interface BatchFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BatchFormValues) => void;
  isPending: boolean;
  initialData?: Batch | null;
}

export function BatchFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  initialData,
}: BatchFormDrawerProps) {
  const [itemId, setItemId] = useState<string | number>("");
  const [batchNo, setBatchNo] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Fetch items list for dropdown selector
  const { data: itemsResponse, isLoading: isLoadingItems } = useItems();
  const itemsList = useMemo(() => extractList<any>(itemsResponse), [itemsResponse]);

  useEffect(() => {
    if (initialData) {
      setItemId(initialData.item_id || "");
      setBatchNo(initialData.batch_no || "");
      setMfgDate(initialData.mfg_date || "");
      setExpiryDate(initialData.expiry_date || "");
      setStatus(initialData.status || "active");
    } else {
      setItemId("");
      setBatchNo("");
      setMfgDate("");
      setExpiryDate("");
      setStatus("active");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !batchNo.trim()) return;

    onSubmit({
      item_id: Number(itemId),
      batch_no: batchNo.trim(),
      mfg_date: mfgDate,
      expiry_date: expiryDate,
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
              {initialData ? "Edit Item Batch" : "Add Item Batch"}
            </h3>
            <p className="altrex-dialog-subtitle" style={{ color: "var(--altrex-muted, #64748b)" }}>
              {initialData
                ? "Update batch numbers, manufacturing or expiry dates."
                : "Register a new manufacturing batch for inventory tracking."}
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
                Select Item *
              </span>
              <select
                className="altrex-input"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--altrex-border, #cbd5e1)",
                  backgroundColor: "var(--altrex-bg, #ffffff)",
                  color: "var(--altrex-text, #0f172a)",
                }}
              >
                <option value="">-- Choose Item --</option>
                {itemsList.map((item: any) => {
                  const id = item.item_id ?? item.id;
                  const name = item.item_name ?? item.name ?? `Item #${id}`;
                  const code = item.item_code ?? item.code ? ` (${item.item_code ?? item.code})` : "";
                  return (
                    <option key={id} value={id}>
                      {name}
                      {code}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="altrex-field">
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                Batch Number *
              </span>
              <input
                className="altrex-input"
                placeholder="e.g. BATCH/0124, LOT-2026-X"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="altrex-field">
                <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                  Mfg. Date
                </span>
                <input
                  type="date"
                  className="altrex-input"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
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
                  Expiry Date
                </span>
                <input
                  type="date"
                  className="altrex-input"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
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
            </div>

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
            <Button type="submit" disabled={isPending || isLoadingItems}>
              {isPending ? "Saving..." : initialData ? "Update Batch" : "Save Batch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
