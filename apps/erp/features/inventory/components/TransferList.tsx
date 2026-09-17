"use client";

import { exportToCSV } from "@/lib/export-csv";
import { Button, DataTable } from "@altrex/ui";
import { ArrowRightLeft, CheckCircle2, Download, PackageCheck, Plus, RefreshCw, Search, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { transferApi } from "../api";
import type { StockTransfer } from "../schema";
import { TransferFormDrawer } from "./TransferFormDrawer";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);

  const keysToTry = ["transfers", "stock_transfers", "data", "rows", "records", "result", "payload"];
  for (const k of keysToTry) {
    if (Array.isArray((value as any)[k])) return (value as any)[k];
  }

  for (const nested of Object.values(value)) {
    const records = extractRecords<T>(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

export function TransferList() {
  const { data: responseData, isLoading, error, refetch } = transferApi.useList();
  const transfers = useMemo(() => extractRecords<StockTransfer>(responseData), [responseData]);

  const { mutate: createTransfer, isPending: isCreating } = transferApi.useCreate();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = transferApi.useUpdateStatus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const getId = (t: StockTransfer) => t.transfer_id ?? t.id;

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const fromName = t.from_warehouse_name || "";
      const toName = t.to_warehouse_name || "";
      const notes = t.notes || "";
      const status = t.status || "draft";

      const q = search.toLowerCase();
      const matchesSearch =
        fromName.toLowerCase().includes(q) ||
        toName.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [transfers, search, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV<StockTransfer>(
      "Stock_Transfers",
      [
        {
          key: "transfer_date",
          label: "Transfer Date",
          transform: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "—"),
        },
        { key: "from_warehouse_name", label: "Source Warehouse", transform: (v, r) => v || `Warehouse #${r.from_warehouse_id}` },
        { key: "to_warehouse_name", label: "Destination Warehouse", transform: (v, r) => v || `Warehouse #${r.to_warehouse_id}` },
        { key: "status", label: "Status" },
        { key: "itemsDetails", label: "Items Count", transform: (v) => String(Array.isArray(v) ? v.length : 0) },
        { key: "notes", label: "Notes", transform: (v) => v || "" },
      ],
      filteredTransfers
    );
  };

  const handleSave = (values: any) => {
    createTransfer(values, {
      onSuccess: () => {
        setIsOpenDrawer(false);
      },
    });
  };

  const columns = [
    {
      key: "transfer_date" as const,
      label: "Transfer Details",
      render: (t: StockTransfer) => {
        const rawDate = t.transfer_date || t.created_at;
        const fmtDate = rawDate ? new Date(rawDate).toLocaleDateString("en-IN") : "—";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ArrowRightLeft size={16} style={{ color: "var(--altrex-primary, #2563eb)" }} />
            <div>
              <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "14px", display: "block" }}>
                {t.transfer_no || `Transfer #${getId(t)}`}
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
      key: "from_warehouse_name" as const,
      label: "Route (From → To)",
      render: (t: StockTransfer) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
          <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)" }}>
            {t.from_warehouse_name || `Warehouse #${t.from_warehouse_id}`}
          </span>
          <span style={{ color: "var(--altrex-muted, #94a3b8)" }}>→</span>
          <span style={{ fontWeight: 600, color: "var(--altrex-primary, #2563eb)" }}>
            {t.to_warehouse_name || `Warehouse #${t.to_warehouse_id}`}
          </span>
        </div>
      ),
    },
    {
      key: "itemsDetails" as const,
      label: "Line Items",
      render: (t: StockTransfer) => {
        const count = Array.isArray(t.itemsDetails) ? t.itemsDetails.length : 0;
        return (
          <span style={{ fontWeight: 500, color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
            {count} {count === 1 ? "item" : "items"}
          </span>
        );
      },
    },
    {
      key: "status" as const,
      label: "Status Flow",
      render: (t: StockTransfer) => {
        const status = (t.status || "draft").toLowerCase();
        let bgColor = "rgba(148, 163, 184, 0.1)";
        let textColor = "#64748b";
        let borderColor = "rgba(148, 163, 184, 0.2)";

        if (status === "in_transit") {
          bgColor = "rgba(37, 99, 235, 0.1)";
          textColor = "#2563eb";
          borderColor = "rgba(37, 99, 235, 0.2)";
        } else if (status === "completed") {
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
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "id" as const,
      label: "Workflow Actions",
      render: (t: StockTransfer) => {
        const id = getId(t);
        const status = (t.status || "draft").toLowerCase();

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {status === "draft" && (
              <Button
                variant="outline"
                onClick={() => updateStatus({ id, status: "in_transit" })}
                disabled={isUpdatingStatus}
                style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <Send size={12} /> Start Transit
              </Button>
            )}

            {status === "in_transit" && (
              <Button
                variant="outline"
                onClick={() => updateStatus({ id, status: "completed" })}
                disabled={isUpdatingStatus}
                style={{ padding: "4px 8px", fontSize: "11px", color: "#10b981", borderColor: "rgba(16,185,129,0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <CheckCircle2 size={12} /> Mark Complete
              </Button>
            )}

            {(status === "draft" || status === "in_transit") && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this transfer?")) {
                    updateStatus({ id, status: "cancelled" });
                  }
                }}
                disabled={isUpdatingStatus}
                style={{ padding: "4px 8px", fontSize: "11px", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <XCircle size={12} /> Cancel
              </Button>
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
            Stock Transfers
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted, #64748b)", fontSize: "14px" }}>
            Manage and track inter-warehouse inventory dispatch and receipt.
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
            Create Transfer
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
            placeholder="Search source/destination warehouse or notes..."
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
          <option value="in_transit">In Transit</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="altrex-table-state" style={{ color: "var(--altrex-muted, #64748b)" }}>
          <span className="altrex-spinner" />
          <span>Loading transfer records...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load stock transfer data from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filteredTransfers}
          rowKey={(t, idx) => getId(t) ?? idx}
        />
      )}

      <TransferFormDrawer
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        onSubmit={handleSave}
        isPending={isCreating}
      />
    </>
  );
}
