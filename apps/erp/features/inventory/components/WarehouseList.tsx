"use client";

import { exportToCSV } from "@/lib/export-csv";
import { Button, DataTable } from "@altrex/ui";
import { Building, Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { warehouseApi } from "../api";
import type { Warehouse } from "../schema";
import { WarehouseFormDrawer } from "./WarehouseFormDrawer";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);

  const keysToTry = [
    "warehouses",
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

export function WarehouseList() {
  const { data: responseData, isLoading, error } = warehouseApi.useList();
  const warehouses = useMemo(
    () => extractRecords<Warehouse>(responseData),
    [responseData],
  );

  const { mutate: createWarehouse, isPending: isCreating } =
    warehouseApi.useCreate();
  const { mutate: updateWarehouse, isPending: isUpdating } =
    warehouseApi.useUpdate();
  const { mutate: deleteWarehouse, isPending: isDeleting } =
    warehouseApi.useDelete();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );

  const getId = (w: Warehouse) => w.warehouse_id ?? w.id;

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const name = w.warehouse_name || "";
      const addr = w.address || "";
      const status = w.status || "active";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        addr.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        !statusFilter || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [warehouses, search, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV<Warehouse>(
      "Warehouses",
      [
        { key: "warehouse_name", label: "Warehouse Name" },
        { key: "address", label: "Address" },
        { key: "status", label: "Status" },
        {
          key: "created_at",
          label: "Created At",
          transform: (val) =>
            val ? new Date(val).toLocaleDateString("en-IN") : "—",
        },
      ],
      filteredWarehouses,
    );
  };

  const handleSave = (values: any) => {
    if (editingWarehouse) {
      const id = String(getId(editingWarehouse));
      updateWarehouse(
        { id, body: values },
        {
          onSuccess: () => {
            setIsOpenDrawer(false);
            setEditingWarehouse(null);
          },
        },
      );
    } else {
      createWarehouse(values, {
        onSuccess: () => {
          setIsOpenDrawer(false);
        },
      });
    }
  };

  const columns = [
    {
      key: "warehouse_name" as const,
      label: "Warehouse Name",
      render: (w: Warehouse) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Building
            size={16}
            style={{ color: "var(--altrex-primary, #2563eb)" }}
          />
          <span
            style={{
              fontWeight: 600,
              color: "var(--altrex-text, #0f172a)",
              fontSize: "14px",
            }}
          >
            {w.warehouse_name}
          </span>
        </div>
      ),
    },
    {
      key: "address" as const,
      label: "Address / Location",
      render: (w: Warehouse) => (
        <span
          style={{ color: "var(--altrex-muted, #64748b)", fontSize: "13px" }}
        >
          {w.address || "—"}
        </span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      render: (w: Warehouse) => {
        const isActive = (w.status || "active").toLowerCase() === "active";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor: isActive
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
              color: isActive ? "#10b981" : "#ef4444",
              border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "id" as const,
      label: "Actions",
      render: (w: Warehouse) => {
        const id = String(getId(w));
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="outline"
              aria-label={`Edit warehouse ${w.warehouse_name}`}
              onClick={() => {
                setEditingWarehouse(w);
                setIsOpenDrawer(true);
              }}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              <Edit size={13} />
            </Button>
            <Button
              variant="outline"
              aria-label={`Delete warehouse ${w.warehouse_name}`}
              onClick={() => {
                if (
                  confirm(
                    `Are you sure you want to delete warehouse "${w.warehouse_name}"?`,
                  )
                ) {
                  deleteWarehouse(id);
                }
              }}
              disabled={isDeleting}
              style={{
                color: "var(--altrex-danger-text, #ef4444)",
                borderColor: "rgba(239, 68, 68, 0.2)",
                padding: "4px 8px",
                fontSize: "12px",
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
      <div className="altrex-page-header" style={{ marginBottom: "20px" }}>
        <div>
          <span className="altrex-eyebrow">Inventory Master</span>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              color: "var(--altrex-text, #0f172a)",
            }}
          >
            Warehouses & Storage Facilities
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--altrex-muted, #64748b)",
              fontSize: "14px",
            }}
          >
            Manage warehouse locations, stores, and depot master records.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Download size={15} />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setEditingWarehouse(null);
              setIsOpenDrawer(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            Add Warehouse
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
            placeholder="Search warehouse name or address..."
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
            width: "140px",
            backgroundColor: "var(--altrex-bg, #f8fafc)",
            color: "var(--altrex-text, #0f172a)",
            borderColor: "var(--altrex-border, #cbd5e1)",
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div
          className="altrex-table-state"
          style={{ color: "var(--altrex-muted, #64748b)" }}
        >
          <span className="altrex-spinner" />
          <span>Loading warehouses...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load warehouse data from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filteredWarehouses}
          rowKey={(w, idx) => getId(w) ?? idx}
        />
      )}

      <WarehouseFormDrawer
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        onSubmit={handleSave}
        isPending={isCreating || isUpdating}
        initialData={editingWarehouse}
      />
    </>
  );
}
