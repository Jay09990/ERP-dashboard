"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { exportToCSV } from "@/lib/export-csv";
import { Button, DataTable } from "@altrex/ui";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, BookOpen, Building, Download, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useItems } from "@/features/items/api";
import { stockApi } from "../api";
import type { StockLedgerEntry } from "../schema";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);

  const keysToTry = ["ledger", "stock_ledger", "data", "rows", "records", "result", "payload"];
  for (const k of keysToTry) {
    if (Array.isArray((value as any)[k])) return (value as any)[k];
  }

  for (const nested of Object.values(value)) {
    const records = extractRecords<T>(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

export function StockLedgerView() {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [search, setSearch] = useState("");

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    if (selectedItemId) obj.itemId = selectedItemId;
    if (selectedWarehouseId) obj.warehouseId = selectedWarehouseId;
    return obj;
  }, [selectedItemId, selectedWarehouseId]);

  const { data: responseData, isLoading, error, refetch } = stockApi.useLedger(params);
  const ledgerEntries = useMemo(() => extractRecords<StockLedgerEntry>(responseData), [responseData]);

  // Fetch items for dropdown filter
  const { data: itemsResponse } = useItems();
  const itemsList = useMemo(() => extractRecords<any>(itemsResponse), [itemsResponse]);

  // Fetch warehouses for dropdown filter
  const { data: warehousesResponse } = useQuery({
    queryKey: ["warehouses-select-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.inventory.warehouse);
      const raw = res.data?.data || res.data || [];
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw.warehouses)) return raw.warehouses;
      if (Array.isArray(raw.rows)) return raw.rows;
      return [];
    },
  });
  const warehousesList: any[] = warehousesResponse || [];

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const itemName = entry.item_name || "";
      const whName = entry.warehouse_name || "";
      const voucherNo = entry.voucher_no || "";
      const voucherType = entry.voucher_type || "";
      const remarks = entry.remarks || "";

      const q = search.toLowerCase();
      return (
        itemName.toLowerCase().includes(q) ||
        whName.toLowerCase().includes(q) ||
        voucherNo.toLowerCase().includes(q) ||
        voucherType.toLowerCase().includes(q) ||
        remarks.toLowerCase().includes(q)
      );
    });
  }, [ledgerEntries, search]);

  const handleExportCSV = () => {
    exportToCSV<StockLedgerEntry>(
      "Stock_Ledger",
      [
        {
          key: "transaction_date",
          label: "Date",
          transform: (v, r) => (v || r.created_at ? new Date(v || r.created_at!).toLocaleDateString("en-IN") : "—"),
        },
        { key: "item_name", label: "Item", transform: (v, r) => v || `Item #${r.item_id}` },
        { key: "warehouse_name", label: "Warehouse", transform: (v, r) => v || `Warehouse #${r.warehouse_id || "N/A"}` },
        { key: "voucher_type", label: "Voucher Type", transform: (v) => v || "—" },
        { key: "voucher_no", label: "Voucher No", transform: (v) => v || "—" },
        { key: "transaction_type", label: "Type", transform: (v) => v || "IN" },
        { key: "quantity", label: "Quantity", transform: (v) => String(v ?? 0) },
        { key: "balance", label: "Running Balance", transform: (v) => (v != null ? String(v) : "—") },
      ],
      filteredEntries
    );
  };

  const columns = [
    {
      key: "transaction_date" as const,
      label: "Date",
      render: (e: StockLedgerEntry) => {
        const rawDate = e.transaction_date || e.created_at;
        const fmtDate = rawDate ? new Date(rawDate).toLocaleDateString("en-IN") : "—";
        return (
          <span style={{ color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
            {fmtDate}
          </span>
        );
      },
    },
    {
      key: "item_name" as const,
      label: "Item Details",
      render: (e: StockLedgerEntry) => (
        <div>
          <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "13px", display: "block" }}>
            {e.item_name || `Item #${e.item_id}`}
          </span>
        </div>
      ),
    },
    {
      key: "warehouse_name" as const,
      label: "Warehouse Location",
      render: (e: StockLedgerEntry) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Building size={14} style={{ color: "var(--altrex-muted, #94a3b8)" }} />
          <span style={{ color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
            {e.warehouse_name || (e.warehouse_id ? `Warehouse #${e.warehouse_id}` : "N/A")}
          </span>
        </div>
      ),
    },
    {
      key: "voucher_no" as const,
      label: "Reference Voucher",
      render: (e: StockLedgerEntry) => (
        <div>
          <span style={{ fontWeight: 500, color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
            {e.voucher_no || "—"}
          </span>
          {e.voucher_type && (
            <span style={{ display: "block", color: "var(--altrex-muted, #64748b)", fontSize: "11px" }}>
              {e.voucher_type}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "transaction_type" as const,
      label: "Movement Type",
      render: (e: StockLedgerEntry) => {
        const type = (e.transaction_type || "IN").toUpperCase();
        const isIn = type === "IN";
        const isOut = type === "OUT";

        const bgColor = isIn
          ? "rgba(16, 185, 129, 0.1)"
          : isOut
          ? "rgba(239, 68, 68, 0.1)"
          : "rgba(37, 99, 235, 0.1)";
        const textColor = isIn ? "#10b981" : isOut ? "#ef4444" : "#2563eb";
        const borderColor = isIn
          ? "rgba(16, 185, 129, 0.2)"
          : isOut
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(37, 99, 235, 0.2)";

        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: bgColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            {isIn ? <ArrowDownLeft size={13} /> : isOut ? <ArrowUpRight size={13} /> : <BookOpen size={13} />}
            {type}
          </span>
        );
      },
    },
    {
      key: "quantity" as const,
      label: "Quantity",
      render: (e: StockLedgerEntry) => {
        const qty = Number(e.quantity || 0);
        const type = (e.transaction_type || "IN").toUpperCase();
        const isOut = type === "OUT";

        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: isOut ? "#ef4444" : "#10b981",
            }}
          >
            {isOut ? "-" : "+"}{qty.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "balance" as const,
      label: "Balance Stock",
      render: (e: StockLedgerEntry) => (
        <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
          {e.balance != null ? Number(e.balance).toLocaleString("en-IN") : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="altrex-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <span className="altrex-eyebrow">Inventory Overview</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "var(--altrex-text, #0f172a)" }}>
            Stock Movement Ledger
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted, #64748b)", fontSize: "14px" }}>
            Audit trail of all inbound, outbound, and adjustment stock transactions.
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
        </div>
      </div>

      {/* Filter bar adapting seamlessly to dark mode */}
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
            placeholder="Search item, voucher no, or remarks..."
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
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          style={{
            minWidth: "160px",
            backgroundColor: "var(--altrex-bg, #f8fafc)",
            color: "var(--altrex-text, #0f172a)",
            borderColor: "var(--altrex-border, #cbd5e1)",
          }}
        >
          <option value="">All Items</option>
          {itemsList.map((item: any) => {
            const id = item.item_id ?? item.id;
            const name = item.item_name ?? item.name ?? `Item #${id}`;
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </select>

        <select
          className="altrex-input"
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
          style={{
            minWidth: "160px",
            backgroundColor: "var(--altrex-bg, #f8fafc)",
            color: "var(--altrex-text, #0f172a)",
            borderColor: "var(--altrex-border, #cbd5e1)",
          }}
        >
          <option value="">All Warehouses</option>
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
      </div>

      {isLoading ? (
        <div className="altrex-table-state" style={{ color: "var(--altrex-muted, #64748b)" }}>
          <span className="altrex-spinner" />
          <span>Loading ledger history...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load stock ledger data from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filteredEntries}
          rowKey={(e, idx) => e.id ?? idx}
        />
      )}
    </>
  );
}
