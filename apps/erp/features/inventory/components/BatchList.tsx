"use client";

import { exportToCSV } from "@/lib/export-csv";
import { Button, DataTable } from "@altrex/ui";
import { Download, Edit, Layers, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { batchApi } from "../api";
import type { Batch } from "../schema";
import { BatchFormDrawer } from "./BatchFormDrawer";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);

  const keysToTry = ["batches", "data", "rows", "records", "result", "payload"];
  for (const k of keysToTry) {
    if (Array.isArray((value as any)[k])) return (value as any)[k];
  }

  for (const nested of Object.values(value)) {
    const records = extractRecords<T>(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

export function BatchList() {
  const { data: responseData, isLoading, error } = batchApi.useList();
  const batches = useMemo(() => extractRecords<Batch>(responseData), [responseData]);

  const { mutate: createBatch, isPending: isCreating } = batchApi.useCreate();
  const { mutate: updateBatch, isPending: isUpdating } = batchApi.useUpdate();
  const { mutate: deleteBatch, isPending: isDeleting } = batchApi.useDelete();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const getId = (b: Batch) => b.batch_id ?? b.id;

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const batchNo = b.batch_no || "";
      const itemName = b.item_name || "";
      const itemCode = b.item_code || "";
      const status = b.status || "active";

      const matchesSearch =
        batchNo.toLowerCase().includes(search.toLowerCase()) ||
        itemName.toLowerCase().includes(search.toLowerCase()) ||
        itemCode.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [batches, search, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV<Batch>(
      "Item_Batches",
      [
        { key: "batch_no", label: "Batch No" },
        { key: "item_name", label: "Item Name", transform: (val, row) => val || `Item #${row.item_id}` },
        { key: "mfg_date", label: "Mfg Date", transform: (val) => val || "—" },
        { key: "expiry_date", label: "Expiry Date", transform: (val) => val || "—" },
        { key: "status", label: "Status" },
      ],
      filteredBatches
    );
  };

  const handleSave = (values: any) => {
    if (editingBatch) {
      const id = String(getId(editingBatch));
      updateBatch(
        { id, body: values },
        {
          onSuccess: () => {
            setIsOpenDrawer(false);
            setEditingBatch(null);
          },
        }
      );
    } else {
      createBatch(values, {
        onSuccess: () => {
          setIsOpenDrawer(false);
        },
      });
    }
  };

  const columns = [
    {
      key: "batch_no" as const,
      label: "Batch Number",
      render: (b: Batch) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={16} style={{ color: "var(--altrex-primary, #2563eb)" }} />
          <span style={{ fontWeight: 600, color: "var(--altrex-text, #0f172a)", fontSize: "14px" }}>
            {b.batch_no}
          </span>
        </div>
      ),
    },
    {
      key: "item_name" as const,
      label: "Item Details",
      render: (b: Batch) => (
        <div>
          <span style={{ fontWeight: 500, color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
            {b.item_name || `Item #${b.item_id}`}
          </span>
          {b.item_code && (
            <span style={{ display: "block", color: "var(--altrex-muted, #64748b)", fontSize: "11px" }}>
              Code: {b.item_code}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "mfg_date" as const,
      label: "Mfg. Date",
      render: (b: Batch) => (
        <span style={{ color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
          {b.mfg_date || "—"}
        </span>
      ),
    },
    {
      key: "expiry_date" as const,
      label: "Expiry Date",
      render: (b: Batch) => (
        <span style={{ color: "var(--altrex-text, #0f172a)", fontSize: "13px" }}>
          {b.expiry_date || "—"}
        </span>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      render: (b: Batch) => {
        const isActive = (b.status || "active").toLowerCase() === "active";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 500,
              backgroundColor: isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
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
      render: (b: Batch) => {
        const id = String(getId(b));
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="outline"
              aria-label={`Edit batch ${b.batch_no}`}
              onClick={() => {
                setEditingBatch(b);
                setIsOpenDrawer(true);
              }}
              style={{ padding: "4px 8px", fontSize: "12px" }}
            >
              <Edit size={13} />
            </Button>
            <Button
              variant="outline"
              aria-label={`Delete batch ${b.batch_no}`}
              onClick={() => {
                if (confirm(`Are you sure you want to delete batch "${b.batch_no}"?`)) {
                  deleteBatch(id);
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
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "var(--altrex-text, #0f172a)" }}>
            Item Batches
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted, #64748b)", fontSize: "14px" }}>
            Track batch numbers, manufacturing dates, and expiration lifecycle.
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
              setEditingBatch(null);
              setIsOpenDrawer(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            Add Batch
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
            placeholder="Search batch number or item name..."
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
        <div className="altrex-table-state" style={{ color: "var(--altrex-muted, #64748b)" }}>
          <span className="altrex-spinner" />
          <span>Loading batch records...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load batch data from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filteredBatches}
          rowKey={(b, idx) => getId(b) ?? idx}
        />
      )}

      <BatchFormDrawer
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        onSubmit={handleSave}
        isPending={isCreating || isUpdating}
        initialData={editingBatch}
      />
    </>
  );
}
