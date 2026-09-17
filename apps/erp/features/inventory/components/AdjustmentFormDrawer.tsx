"use client";

import { useItems } from "@/features/items/api";
import { uomApi } from "@/features/masters/api";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button } from "@altrex/ui";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StockAdjustmentFormValues } from "../schema";

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

interface AdjustmentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: StockAdjustmentFormValues) => void;
  isPending: boolean;
}

interface LineItem {
  item_id: string | number;
  batch_id?: string | number | null;
  adjustment_type: "increase" | "decrease";
  quantity: number;
  unit_id?: string | number | null;
}

export function AdjustmentFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: AdjustmentFormDrawerProps) {
  const [adjustmentDate, setAdjustmentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [warehouseId, setWarehouseId] = useState<string | number>("");
  const [reason, setReason] = useState<string>("Physical stock count correction");
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item_id: "", batch_id: null, adjustment_type: "increase", quantity: 1, unit_id: null },
  ]);

  // Fetch Items
  const { data: itemsResponse } = useItems();
  const itemsList = useMemo(() => extractList<any>(itemsResponse), [itemsResponse]);

  // Fetch UOMs
  const { data: uomsData } = uomApi.useList();
  const uomsList = useMemo(() => extractList<any>(uomsData), [uomsData]);

  // Fetch Warehouses
  const { data: warehousesResponse } = useQuery({
    queryKey: ["warehouses-select-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.inventory.warehouse);
      return extractList<any>(res);
    },
    enabled: isOpen,
  });
  const warehousesList = useMemo(
    () => extractList<any>(warehousesResponse),
    [warehousesResponse]
  );

  // Fetch Batches
  const { data: batchesResponse } = useQuery({
    queryKey: ["batches-select-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.inventory.batch);
      return extractList<any>(res);
    },
    enabled: isOpen,
  });
  const batchesList = useMemo(
    () => extractList<any>(batchesResponse),
    [batchesResponse]
  );

  useEffect(() => {
    if (!isOpen) {
      setAdjustmentDate(new Date().toISOString().slice(0, 10));
      setWarehouseId("");
      setReason("Physical stock count correction");
      setNotes("");
      setLineItems([
        { item_id: "", batch_id: null, adjustment_type: "increase", quantity: 1, unit_id: null },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setLineItems((prev) => [
      ...prev,
      { item_id: "", batch_id: null, adjustment_type: "increase", quantity: 1, unit_id: null },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof LineItem, value: any) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!warehouseId) {
      alert("Please select a warehouse.");
      return;
    }

    const validItems = lineItems.filter((i) => i.item_id && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      alert("Please add at least one valid item with quantity > 0.");
      return;
    }

    onSubmit({
      adjustment_date: adjustmentDate,
      warehouse_id: Number(warehouseId),
      reason: reason.trim(),
      status: "draft",
      notes: notes.trim(),
      itemsDetails: validItems.map((i) => ({
        item_id: Number(i.item_id),
        batch_id: i.batch_id ? Number(i.batch_id) : null,
        adjustment_type: i.adjustment_type,
        quantity: Number(i.quantity),
        unit_id: i.unit_id ? Number(i.unit_id) : null,
      })),
    });
  };

  return (
    <div className="altrex-dialog-backdrop" onClick={onClose}>
      <div
        className="altrex-dialog altrex-dialog-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--altrex-bg-card, #ffffff)",
          color: "var(--altrex-text, #0f172a)",
          borderColor: "var(--altrex-border, #e2e8f0)",
          maxWidth: "820px",
          width: "90%",
        }}
      >
        <div
          className="altrex-dialog-header"
          style={{ borderBottom: "1px solid var(--altrex-border, #e2e8f0)" }}
        >
          <div>
            <h3 className="altrex-dialog-title" style={{ color: "var(--altrex-text, #0f172a)" }}>
              Create Stock Adjustment
            </h3>
            <p className="altrex-dialog-subtitle" style={{ color: "var(--altrex-muted, #64748b)" }}>
              Record physical stock corrections, damages, or manual inventory updates.
            </p>
          </div>
          <button type="button" className="altrex-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="altrex-dialog-body"
            style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "75vh", overflowY: "auto" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <label className="altrex-field">
                <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                  Adjustment Date *
                </span>
                <input
                  type="date"
                  className="altrex-input"
                  value={adjustmentDate}
                  onChange={(e) => setAdjustmentDate(e.target.value)}
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
                  Warehouse *
                </span>
                <select
                  className="altrex-input"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
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
                  <option value="">-- Choose Warehouse --</option>
                  {warehousesList.map((wh: any) => {
                    const id = wh.warehouse_id ?? wh.id;
                    const name = wh.warehouse_name ?? wh.name ?? `Warehouse #${id}`;
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="altrex-field">
                <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                  Adjustment Reason
                </span>
                <input
                  className="altrex-input"
                  placeholder="e.g. Physical count correction, Damage"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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

            {/* Line Items Repeater */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "14px" }}>
                  Adjusted Items *
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddRow}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "4px 8px" }}
                >
                  <Plus size={14} /> Add Line Item
                </Button>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid var(--altrex-border, #e2e8f0)",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--altrex-bg, #f8fafc)", borderBottom: "1px solid var(--altrex-border, #e2e8f0)" }}>
                    <th style={{ padding: "8px", textAlign: "left", color: "var(--altrex-text, #0f172a)", width: "30%" }}>Item</th>
                    <th style={{ padding: "8px", textAlign: "left", color: "var(--altrex-text, #0f172a)", width: "20%" }}>Batch (Optional)</th>
                    <th style={{ padding: "8px", textAlign: "left", color: "var(--altrex-text, #0f172a)", width: "20%" }}>Adjustment Type</th>
                    <th style={{ padding: "8px", textAlign: "left", color: "var(--altrex-text, #0f172a)", width: "15%" }}>Quantity</th>
                    <th style={{ padding: "8px", textAlign: "left", color: "var(--altrex-text, #0f172a)", width: "10%" }}>Unit</th>
                    <th style={{ padding: "8px", textAlign: "center", color: "var(--altrex-text, #0f172a)", width: "5%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((row, index) => {
                    const itemBatches = batchesList.filter(
                      (b: any) => String(b.item_id) === String(row.item_id)
                    );

                    return (
                      <tr key={index} style={{ borderBottom: "1px solid var(--altrex-border, #e2e8f0)" }}>
                        <td style={{ padding: "6px" }}>
                          <select
                            className="altrex-input"
                            value={row.item_id}
                            onChange={(e) => handleUpdateRow(index, "item_id", e.target.value)}
                            required
                            style={{ width: "100%", padding: "6px 8px" }}
                          >
                            <option value="">Select Item</option>
                            {itemsList.map((item: any) => {
                              const id = item.item_id ?? item.id ?? item.tbl_items_id;
                              const name = item.item_name ?? item.name ?? `Item #${id}`;
                              return (
                                <option key={id} value={id}>
                                  {name}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td style={{ padding: "6px" }}>
                          <select
                            className="altrex-input"
                            value={row.batch_id || ""}
                            onChange={(e) => handleUpdateRow(index, "batch_id", e.target.value || null)}
                            style={{ width: "100%", padding: "6px 8px" }}
                          >
                            <option value="">All / No Batch</option>
                            {itemBatches.map((b: any) => {
                              const id = b.batch_id ?? b.id;
                              return (
                                <option key={id} value={id}>
                                  {b.batch_no}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td style={{ padding: "6px" }}>
                          <select
                            className="altrex-input"
                            value={row.adjustment_type}
                            onChange={(e) =>
                              handleUpdateRow(index, "adjustment_type", e.target.value as "increase" | "decrease")
                            }
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              color: row.adjustment_type === "increase" ? "#10b981" : "#ef4444",
                              fontWeight: 600,
                            }}
                          >
                            <option value="increase">+ Increase Stock</option>
                            <option value="decrease">- Decrease Stock</option>
                          </select>
                        </td>
                        <td style={{ padding: "6px" }}>
                          <input
                            type="number"
                            step="any"
                            min="0.0001"
                            className="altrex-input"
                            value={row.quantity}
                            onChange={(e) => handleUpdateRow(index, "quantity", parseFloat(e.target.value) || 0)}
                            required
                            style={{ width: "100%", padding: "6px 8px" }}
                          />
                        </td>
                        <td style={{ padding: "6px" }}>
                          <select
                            className="altrex-input"
                            value={row.unit_id || ""}
                            onChange={(e) => handleUpdateRow(index, "unit_id", e.target.value || null)}
                            style={{ width: "100%", padding: "6px 8px" }}
                          >
                            <option value="">NOS</option>
                            {uomsList.map((u: any) => {
                              const id = u.unit_id ?? u.id;
                              const code = u.unit_code ?? u.unit_name ?? `Unit #${id}`;
                              return (
                                <option key={id} value={id}>
                                  {code}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                        <td style={{ padding: "6px", textAlign: "center" }}>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRemoveRow(index)}
                            disabled={lineItems.length <= 1}
                            style={{ padding: "4px", color: "var(--altrex-danger-text, #ef4444)" }}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <label className="altrex-field">
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", marginBottom: "4px", display: "block" }}>
                Notes / Verification Details
              </span>
              <textarea
                className="altrex-input"
                placeholder="Additional audit notes or stock audit ticket reference..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
          </div>

          <div
            className="altrex-dialog-footer"
            style={{ borderTop: "1px solid var(--altrex-border, #e2e8f0)", padding: "16px" }}
          >
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Save Stock Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
