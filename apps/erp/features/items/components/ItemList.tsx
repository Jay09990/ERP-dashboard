"use client";

import { currencyApi, taxTypesApi, uomApi } from "@/features/masters/api";
import { sanitizeCSVValue } from "@/lib/export-csv";
import { Button, DataTable, FilterBar } from "@altrex/ui";
import {
  ArrowUpRight,
  DollarSign,
  Download,
  Edit,
  Layers,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDeleteItem, useItemTypes, useItems } from "../api";
import type { Item } from "../schema";
import { ItemFormDrawer } from "./ItemFormDrawer";

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

export function ItemList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const { data: responseData, isLoading, error } = useItems();
  const items: Item[] = Array.isArray(responseData)
    ? responseData
    : ((responseData as any)?.items ??
      (responseData as any)?.Items ??
      (responseData as any)?.data ??
      []);

  const { data: itemTypesData = [] } = useItemTypes();
  const itemTypes = extractList<any>(itemTypesData);
  const { data: uomsData = [] } = uomApi.useList();
  const uoms = extractList<any>(uomsData);
  const { data: taxesData = [] } = taxTypesApi.useList();
  const taxes = extractList<any>(taxesData);
  const { data: currenciesData = [] } = currencyApi.useList();
  const currencies = extractList<any>(currenciesData);

  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();

  const getItemId = (i: Item) => i.item_id ?? (i as any).id;

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch =
        !search.trim() ||
        i.item_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.item_code?.toLowerCase().includes(search.toLowerCase()) ||
        i.hsn_code?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const exportCsv = () => {
    const headers = [
      "Product Name",
      "Unit Price",
      "Unit Price Currency",
      "UoM",
      "Quantity",
      "Description",
      "Type",
      "Purchase Price",
      "Purchase Price Currency",
      "HSN/SAC",
      "SKU",
      "Tax (%)",
      "CESS (%)",
    ];

    const uomMap = new Map<string | number, string>();
    uoms.forEach((u: any) => {
      const id = u.uom_id ?? u.id;
      const name = u.name ?? u.uom_name ?? u.code;
      if (id && name) uomMap.set(id, name);
    });

    const typeMap = new Map<string | number, string>();
    itemTypes.forEach((t: any) => {
      const id = t.item_type_id ?? t.id;
      const name = t.item_type_name ?? t.name;
      if (id && name) typeMap.set(id, name);
    });

    const taxMap = new Map<string | number, string>();
    taxes.forEach((tx: any) => {
      const id = tx.tax_type_id ?? tx.id;
      const rate = tx.rate ?? tx.tax_rate ?? tx.percentage;
      if (id && rate != null) taxMap.set(id, String(rate));
    });

    const currencyMap = new Map<string | number, string>();
    currencies.forEach((c: any) => {
      const id = c.currency_id ?? c.id;
      const code = c.code ?? c.currency_code ?? c.symbol ?? "INR";
      if (id && code) currencyMap.set(id, code);
    });

    const rows = filtered.map((i) => {
      const salesRate =
        i.sales_rate != null && !isNaN(Number(i.sales_rate))
          ? Number(i.sales_rate).toFixed(1)
          : "0.0";
      const purchaseRate =
        i.purchase_rate != null && !isNaN(Number(i.purchase_rate))
          ? Number(i.purchase_rate).toFixed(1)
          : "0.0";
      const salesCurr =
        (i.sales_currency_id && currencyMap.get(i.sales_currency_id)) || "INR";
      const purchaseCurr =
        (i.purchase_currency_id && currencyMap.get(i.purchase_currency_id)) ||
        "INR";
      const uom =
        (i.unit_id && uomMap.get(i.unit_id)) ||
        (i as any).uom_name ||
        (i as any).unit_name ||
        "Pieces";
      const qty = i.sales_qty != null ? String(i.sales_qty) : "";
      const desc = i.item_description || i.item_specification || "";
      const type =
        (i.item_type && typeMap.get(i.item_type)) ||
        (i.item_type === 2 ? "Service" : "Product");
      const hsn = i.hsn_code || "";
      const sku = i.item_code || "";
      const tax = (i.tax_id && taxMap.get(i.tax_id)) || "18.0";
      const cess = "0.0";

      return [
        i.item_name || "",
        salesRate,
        salesCurr,
        uom,
        qty,
        desc,
        type,
        purchaseRate,
        purchaseCurr,
        hsn,
        sku,
        tax,
        cess,
      ];
    });

    const csvLines = [
      headers
        .map((h) => `"${sanitizeCSVValue(h).replace(/"/g, '""')}"`)
        .join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = sanitizeCSVValue(cell).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `items_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeCount = items.filter((i) => i.status === "active").length;
  const salesItemsCount = items.filter(
    (i) => Number(i.sales_rate || 0) > 0,
  ).length;
  const purchaseItemsCount = items.filter(
    (i) => Number(i.purchase_rate || 0) > 0,
  ).length;

  const columns = [
    {
      key: "item_name" as const,
      label: "Item Details",
      render: (i: Item) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(37,99,235,0.1)",
              color: "var(--altrex-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Package size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontWeight: 600,
                color: "var(--altrex-text)",
                fontSize: "14px",
              }}
            >
              {i.item_name}
            </span>
            <span style={{ fontSize: "12px", color: "var(--altrex-muted)" }}>
              Code: {i.item_code || "N/A"}{" "}
              {i.hsn_code ? `• HSN: ${i.hsn_code}` : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "sales_rate" as const,
      label: "Selling Rate",
      render: (i: Item) => (
        <span style={{ fontWeight: 600, color: "#10b981", fontSize: "13px" }}>
          ₹
          {Number(i.sales_rate || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "purchase_rate" as const,
      label: "Purchase Rate",
      render: (i: Item) => (
        <span style={{ fontWeight: 600, color: "#3b82f6", fontSize: "13px" }}>
          ₹
          {Number(i.purchase_rate || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      render: (i: Item) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "3px 10px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 600,
            background:
              i.status === "active"
                ? "rgba(16, 185, 129, 0.12)"
                : "rgba(100, 116, 139, 0.12)",
            color: i.status === "active" ? "#10b981" : "var(--altrex-muted)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: i.status === "active" ? "#10b981" : "#94a3b8",
            }}
          />
          {i.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "item_id" as const,
      label: "Actions",
      render: (i: Item) => {
        const id = getItemId(i)?.toString() ?? "";
        return (
          <div
            className="altrex-row-actions"
            style={{ display: "flex", gap: "8px" }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setActiveItem(i);
                setIsOpenDrawer(true);
              }}
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Edit size={13} />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete item "${i.item_name}"?`,
                  )
                ) {
                  deleteItem(id);
                }
              }}
              disabled={isDeleting}
              style={{
                color: "var(--altrex-danger-text)",
                borderColor: "rgba(220, 38, 38, 0.2)",
                fontSize: "12px",
                padding: "4px 10px",
              }}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Inventory & Catalog</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Item Management
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--altrex-muted)",
              fontSize: "14px",
            }}
          >
            Manage product catalog, HSN codes, UOM conversions, and dual
            sales/purchase pricing rates.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Button
            variant="outline"
            onClick={exportCsv}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={15} />
            Export CSV
          </Button>
          <Link href="/items/categories">
            <Button
              variant="outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Layers size={15} />
              Categories
            </Button>
          </Link>
          <Button
            onClick={() => {
              setActiveItem(null);
              setIsOpenDrawer(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            Add New Item
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(37, 99, 235, 0.1)",
              color: "var(--altrex-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--altrex-muted)",
                fontWeight: 600,
              }}
            >
              TOTAL CATALOG ITEMS
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--altrex-text)",
              }}
            >
              {items.length}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCart size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--altrex-muted)",
                fontWeight: 600,
              }}
            >
              ACTIVE ITEMS
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--altrex-text)",
              }}
            >
              {activeCount}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.1)",
              color: "#8b5cf6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowUpRight size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--altrex-muted)",
                fontWeight: 600,
              }}
            >
              SALES PRICED ITEMS
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--altrex-text)",
              }}
            >
              {salesItemsCount}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarSign size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--altrex-muted)",
                fontWeight: 600,
              }}
            >
              PURCHASE PRICED ITEMS
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--altrex-text)",
              }}
            >
              {purchaseItemsCount}
            </div>
          </div>
        </div>
      </div>

      {/* FilterBar */}
      <FilterBar>
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <input
            className="altrex-input"
            placeholder="Search by name, SKU code, HSN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "320px" }}
          />
          <select
            className="altrex-input altrex-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </FilterBar>

      {/* Table */}
      {isLoading ? (
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading inventory catalog items...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load items from the backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filtered}
          rowKey={(i, idx) => getItemId(i) ?? idx}
        />
      )}

      {/* Item Form Drawer */}
      {isOpenDrawer && (
        <ItemFormDrawer
          item={activeItem}
          onClose={() => {
            setIsOpenDrawer(false);
            setActiveItem(null);
          }}
        />
      )}
    </>
  );
}
