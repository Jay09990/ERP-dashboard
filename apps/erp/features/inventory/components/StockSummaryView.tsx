"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { exportToCSV } from "@/lib/export-csv";
import { Button, DataTable } from "@altrex/ui";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  Building,
  Download,
  PackageCheck,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { stockApi } from "../api";
import type { StockSummary } from "../schema";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);

  const keysToTry = [
    "stock",
    "summary",
    "data",
    "rows",
    "records",
    "result",
    "payload",
  ];
  for (const k of keysToTry) {
    if (Array.isArray((value as any)[k])) return (value as any)[k];
  }

  for (const nested of Object.values(value)) {
    const records = extractRecords<T>(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

export function StockSummaryView() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [search, setSearch] = useState("");

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    if (selectedWarehouseId) obj.warehouseId = selectedWarehouseId;
    return obj;
  }, [selectedWarehouseId]);

  const { data: responseData, isLoading, error } = stockApi.useSummary(params);
  const stockItems = useMemo(
    () => extractRecords<StockSummary>(responseData),
    [responseData],
  );

  // Fetch warehouses for dropdown filter
  const { data: warehousesResponse } = useQuery({
    queryKey: ["warehouses-select-list"],
    queryFn: async () => {
      const res = await apiClient.get<any>(endpoints.inventory.warehouse);
      return extractRecords<any>(res);
    },
  });

  const warehousesList: any[] = warehousesResponse || [];

  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      const name = item.item_name || "";
      const code = item.item_code || "";
      const whName = item.warehouse_name || "";

      const q = search.toLowerCase();
      return (
        name.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        whName.toLowerCase().includes(q)
      );
    });
  }, [stockItems, search]);

  // KPI Metrics
  const totalItemsCount = filteredStock.length;
  const totalQuantitySum = useMemo(() => {
    return filteredStock.reduce((acc, curr) => {
      const qty = curr.current_stock ?? curr.quantity ?? 0;
      return acc + Number(qty);
    }, 0);
  }, [filteredStock]);

  const lowStockCount = useMemo(() => {
    return filteredStock.filter((curr) => {
      const qty = Number(curr.current_stock ?? curr.quantity ?? 0);
      const minLevel = Number(curr.reorder_level ?? 5);
      return qty <= minLevel;
    }).length;
  }, [filteredStock]);

  const handleExportCSV = () => {
    exportToCSV<StockSummary>(
      "Stock_Summary",
      [
        {
          key: "item_name",
          label: "Item Name",
          transform: (v, r) => v || `Item #${r.item_id}`,
        },
        { key: "item_code", label: "Item Code", transform: (v) => v || "—" },
        {
          key: "warehouse_name",
          label: "Warehouse",
          transform: (v, r) => v || `Warehouse #${r.warehouse_id || "N/A"}`,
        },
        {
          key: "current_stock",
          label: "Current Stock",
          transform: (v, r) => String(v ?? r.quantity ?? 0),
        },
        {
          key: "uom",
          label: "Unit",
          transform: (v, r) => v || r.unit_name || "NOS",
        },
      ],
      filteredStock,
    );
  };

  const columns = [
    {
      key: "item_name" as const,
      label: "Item Name & Code",
      render: (s: StockSummary) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Boxes
            size={16}
            style={{ color: "var(--altrex-primary, #2563eb)" }}
          />
          <div>
            <span
              style={{
                fontWeight: 600,
                color: "var(--altrex-text, #0f172a)",
                fontSize: "14px",
                display: "block",
              }}
            >
              {s.item_name || `Item #${s.item_id}`}
            </span>
            {s.item_code && (
              <span
                style={{
                  color: "var(--altrex-muted, #64748b)",
                  fontSize: "12px",
                }}
              >
                Code: {s.item_code}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "warehouse_name" as const,
      label: "Warehouse Location",
      render: (s: StockSummary) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Building
            size={14}
            style={{ color: "var(--altrex-muted, #94a3b8)" }}
          />
          <span
            style={{ color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}
          >
            {s.warehouse_name ||
              (s.warehouse_id
                ? `Warehouse #${s.warehouse_id}`
                : "All Warehouses")}
          </span>
        </div>
      ),
    },
    {
      key: "current_stock" as const,
      label: "Current Stock Quantity",
      render: (s: StockSummary) => {
        const qty = Number(s.current_stock ?? s.quantity ?? 0);
        const minLevel = Number(s.reorder_level ?? 5);
        const isLow = qty <= minLevel;
        const uomStr = s.uom || s.unit_name || "NOS";

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: "14px",
                color: isLow ? "#ef4444" : "var(--altrex-text, #0f172a)",
              }}
            >
              {qty.toLocaleString("en-IN")} {uomStr}
            </span>
            {isLow && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <AlertTriangle size={11} />
                Low Stock
              </span>
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
          <span className="altrex-eyebrow">Inventory Overview</span>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: "var(--altrex-text, #0f172a)",
            }}
          >
            Stock Summary
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--altrex-muted, #64748b)",
              fontSize: "14px",
            }}
          >
            Real-time item-wise stock balances across all warehouse locations.
          </p>
        </div>
        <div>
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

      {/* KPI Cards section — beautifully styled for both light and dark themes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "10px",
            backgroundColor: "var(--altrex-bg-card, #ffffff)",
            border: "1px solid var(--altrex-border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              color: "#2563eb",
            }}
          >
            <Boxes size={24} />
          </div>
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--altrex-muted, #64748b)",
              }}
            >
              Tracked Items
            </span>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--altrex-text, #0f172a)",
              }}
            >
              {totalItemsCount}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderRadius: "10px",
            backgroundColor: "var(--altrex-bg-card, #ffffff)",
            border: "1px solid var(--altrex-border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
            }}
          >
            <PackageCheck size={24} />
          </div>
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--altrex-muted, #64748b)",
              }}
            >
              Total Stock Quantity
            </span>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--altrex-text, #0f172a)",
              }}
            >
              {totalQuantitySum.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px",
            borderRadius: "10px",
            backgroundColor: "var(--altrex-bg-card, #ffffff)",
            border: "1px solid var(--altrex-border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--altrex-muted, #64748b)",
              }}
            >
              Low Stock Alerts
            </span>
            <div
              style={{ fontSize: "20px", fontWeight: 700, color: "#ef4444" }}
            >
              {lowStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar adapting to dark mode */}
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
            placeholder="Search item name, code, or warehouse..."
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
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
          style={{
            minWidth: "180px",
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
        <div
          className="altrex-table-state"
          style={{ color: "var(--altrex-muted, #64748b)" }}
        >
          <span className="altrex-spinner" />
          <span>Loading stock summary...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load stock summary data from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filteredStock}
          rowKey={(s, idx) => s.id ?? idx}
        />
      )}
    </>
  );
}
