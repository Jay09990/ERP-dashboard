"use client";

import { exportToCSV } from "@/lib/export-csv";
import { Button, DataTable } from "@altrex/ui";
import { CheckCircle2, Download, Plus, RefreshCw, Scale, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { adjustmentApi } from "../api";
import type { StockAdjustment } from "../schema";
import { AdjustmentFormDrawer } from "./AdjustmentFormDrawer";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);

  const keysToTry = ["adjustments", "stock_adjustments", "data", "rows", "records", "result", "payload"];
  for (const k of keysToTry) {
    if (Array.isArray((value as any)[k])) return (value as any)[k];
  }

  for (const nested of Object.values(value)) {
    const records = extractRecords<T>(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

export function AdjustmentList() {
  const { data: responseData, isLoading, error, refetch } = adjustmentApi.useList();
  const adjustments = useMemo(() => extractRecords<StockAdjustment>(responseData), [responseData]);

  const { mutate: createAdjustment, isPending: isCreating } = adjustmentApi.useCreate();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = adjustmentApi.useUpdateStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const getId = (a: StockAdjustment) => a.stock_adjustment_id ?? a.adjustment_id ?? a.id;

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((a) => {
      const whName = a.warehouse_name || "";
      const reason = a.reason || "";
      const notes = a.notes || "";
      const status = a.status || "draft";

      const q = search.toLowerCase();
      const matchesSearch =
        whName.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [adjustments, search, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV<StockAdjustment>(
      "Stock_Adjustments",
      [
        {
          key: "adjustment_date",
          label: "Adjustment Date",
          transform: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—"),
        },
        { key: "warehouse_name", label: "Warehouse", transform: (v, r) => v || `Warehouse #${r.warehouse_id}` },
        { key: "reason", label: "Reason", transform: (v) => v || "—" },
        { key: "status", label: "Status" },
        { key: "itemsDetails", label: "Items Count", transform: (v) => String(Array.isArray(v) ? v.length : 0) },
        { key: "notes", label: "Notes", transform: (v) => v || "" },
      ],
      filteredAdjustments
    );
  };

  const handleSave = (values: any) => {
    createAdjustment(values, {
      onSuccess: () => {
        setIsOpenDrawer(false);
      },
    });
  };

  const columns = [
    {
      key: "adjustment_date" as const,
      label: "Adjustment Details",
      render: (a: StockAdjustment) => {
        const rawDate = a.adjustment_date || a.created_at;
        const fmtDate = rawDate ? new Date(rawDate).toLocaleDateString("en-IN") : "—";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Scale size={16} style={{ color: "var(--altrex-primary, #2563eb)" }} />
            <div>
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "14px", display: "block" }}>
                {a.adjustment_no || `Adjustment #${getId(a)}`}
              </span>
              <span style={{ color: "var(--altrex-muted, #64748b)", fontSize: "12px" }}>
                Date: {fmtDate}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "warehouse_name" as const,
      label: "Warehouse",
      render: (a: StockAdjustment) => (
        <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
          {a.warehouse_name || `Warehouse #${a.warehouse_id}`}
        </span>
      ),
    },
    {
      key: "reason" as const,
      label: "Reason",
      render: (a: StockAdjustment) => (
        <span style={{ color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
          {a.reason || "—"}
        </span>
      ),
    },
    {
      key: "itemsDetails" as const,
      label: "Line Items",
      render: (a: StockAdjustment) => {
        const count = Array.isArray(a.itemsDetails) ? a.itemsDetails.length : 0;
        return (
          <span style={{ fontWeight: 500, color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
            {count} {count === 1 ? "item" : "items"}
          </span>
        );
      },
    },
    {
      key: "status" as const,
      label: "Status",
      render: (a: StockAdjustment) => {
        const status = (a.status || "draft").toLowerCase();
        let bgColor = "rgba(148, 163, 184, 0.1)";
        let textColor = "#64748b";
        let borderColor = "rgba(148, 163, 184, 0.2)";

        if (status === "approved") {
          bgColor = "rgba(16, 185, 129, 0.1)";
          textColor = "#10b981";
          borderColor = "rgba(16, 185, 129, 0.2)";
        } else if (status === "cancelled") {
          bgColor = "rgba(239, 68, 68, 0.1)";
          textColor = "#ef4444";
          borderColor = "rgba(239, 68, 68, 0.2)";
        }

        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              textTransform: "capitalize",
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "id" as const,
      label: "Workflow Actions",
      render: (a: StockAdjustment) => {
        const id = getId(a);
        const status = (a.status || "draft").toLowerCase();
        if (id === undefined) return <span style={{ color: "var(--altrex-muted, #94a3b8)", fontSize: "12px" }}>—</span>;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {status === "draft" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateStatus({ id, status: "approved" })}
                  disabled={isUpdatingStatus}
                  style={{ padding: "4px 8px", fontSize: "11px", color: "#10b981", borderColor: "rgba(16,185,129,0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <CheckCircle2 size={12} /> Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this adjustment?")) {
                      updateStatus({ id, status: "cancelled" });
                    }
                  }}
                  disabled={isUpdatingStatus}
                  style={{ padding: "4px 8px", fontSize: "11px", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <XCircle size={12} /> Cancel
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="altrex-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <span className="altrex-eyebrow">Inventory Movements</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "var(--altrex-text, #0f172a)" }}>
            Stock Adjustments
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted, #64748b)", fontSize: "14px" }}>
            Audit and adjust physical stock counts, damages, or discrepancies.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="outline"
            onClick={() => refetch()}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={15} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={15} />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsOpenDrawer(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            New Adjustment
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          padding: "12px 16px",
          borderRadius: "8px",
          backgroundColor: "var(--altrex-bg-card, #ffffff)",
          border: "1px solid var(--altrex-border, #e2e8f0)",
          color: "var(--altrex-text, #0f172a)",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--altrex-muted, #94a3b8)",
            }}
          />
          <input
            className="altrex-input"
            placeholder="Search warehouse, reason, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: "34px",
              width: "100%",
              backgroundColor: "var(--altrex-bg, #f8fafc)",
              color: "var(--altrex-text, #0f172a)",
              borderColor: "var(--altrex-border, #cbd5e1)",
            }}
          />
        </div>

        <select
          className="altrex-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            width: "160px",
            backgroundColor: "var(--altrex-bg, #f8fafc)",
            color: "var(--altrex-text, #0f172a)",
            borderColor: "var(--altrex-border, #cbd5e1)",
          }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="altrex-table-state" style={{ color: "var(--altrex-muted, #64748b)" }}>
          <span className="altrex-spinner" />
          <span>Loading adjustment records...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load stock adjustment data from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filteredAdjustments}
          rowKey={(a, idx) => getId(a) ?? idx}
        />
      )}

      <AdjustmentFormDrawer
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        onSubmit={handleSave}
        isPending={isCreating}
      />
    </>
  );
}
