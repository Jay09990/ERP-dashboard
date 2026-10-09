"use client";

import { Button, DataTable, TableSkeleton } from "@altrex/ui";
import { Plus, Tag, Trash2, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useCreateItemType, useDeleteItemType, useItemTypes } from "../api";
import type { ItemType } from "../schema";

function extractRecords<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);
  for (const nested of Object.values(value)) {
    const records = extractRecords<T>(nested, visited);
    if (records.length > 0) return records;
  }
  return [];
}

// Static module-level helper functions for item type property extraction.
// Extracting them outside the component prevents recreating functions on every render
// and preserves reference identity.
function getTypeId(t: ItemType): number | string | undefined {
  const rec = t as Record<string, unknown>;
  return (
    t.item_type_id ??
    (rec.itemTypesId as number | string) ??
    (rec.item_type_id as number | string) ??
    (rec.id as number | string)
  );
}

function getTypeName(t: ItemType): string {
  const rec = t as Record<string, unknown>;
  return (
    t.item_type_name ??
    (rec.itemTypeName as string) ??
    (rec.name as string) ??
    "Unnamed item type"
  );
}

export function ItemTypeList() {
  const { data: responseData, isLoading, error } = useItemTypes();

  // Memoize extracted item types array to prevent deep recursive object traversals
  // on every component render (e.g., when typing in modal inputs or state changes).
  const types = useMemo(
    () => extractRecords<ItemType>(responseData),
    [responseData],
  );

  const { mutate: createItemType, isPending: isCreating } = useCreateItemType();
  const { mutate: deleteItemType, isPending: isDeleting } = useDeleteItemType();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [typeName, setTypeName] = useState("");

  useEffect(() => {
    if (!isOpenModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpenModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenModal]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    createItemType(
      { item_type_name: typeName },
      {
        onSuccess: () => {
          setIsOpenModal(false);
          setTypeName("");
        },
      },
    );
  };

  const columns = [
    {
      key: "item_type_name" as const,
      label: "Item Type Name",
      render: (t: ItemType) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Tag size={16} style={{ color: "var(--altrex-primary)" }} />
          <span
            style={{
              fontWeight: 600,
              color: "var(--altrex-text)",
              fontSize: "14px",
            }}
          >
            {getTypeName(t)}
          </span>
        </div>
      ),
    },
    {
      key: "item_type_id" as const,
      label: "Actions",
      render: (t: ItemType) => {
        const id = getTypeId(t)?.toString() ?? "";
        return (
          <Button
            variant="outline"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete item type "${getTypeName(t)}"?`,
                )
              ) {
                deleteItemType(id);
              }
            }}
            disabled={isDeleting}
            aria-label={`Delete ${getTypeName(t)}`}
            title={`Delete ${getTypeName(t)}`}
            style={{
              color: "var(--altrex-danger-text)",
              borderColor: "rgba(220,38,38,0.2)",
              fontSize: "12px",
              padding: "4px 10px",
            }}
          >
            <Trash2 size={13} />
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Inventory Master</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Item Types
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--altrex-muted)",
              fontSize: "14px",
            }}
          >
            Manage item classification types (e.g. Raw Material, Finished Good,
            Service, Asset).
          </p>
        </div>
        <Button
          onClick={() => setIsOpenModal(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Add Item Type
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton
          columns={columns.length}
          message="Loading item types..."
        />
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load item types from server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={types}
          rowKey={(t, idx) => getTypeId(t) ?? idx}
        />
      )}

      {isOpenModal && (
        <div
          className="altrex-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-item-type-title"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 border-none bg-transparent"
            onClick={() => setIsOpenModal(false)}
          />
          <div
            className="altrex-dialog altrex-dialog-md relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="altrex-dialog-header">
              <div>
                <h3 id="add-item-type-title" className="altrex-dialog-title">
                  Add Item Type
                </h3>
                <p className="altrex-dialog-subtitle">
                  Define a new item classification type for inventory
                  management.
                </p>
              </div>
              <button
                type="button"
                className="altrex-icon-button"
                onClick={() => setIsOpenModal(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="altrex-dialog-body">
                <label className="altrex-field">
                  <span>Item Type Name *</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. Raw Material, Finished Product, Capital Goods"
                    value={typeName}
                    onChange={(e) => setTypeName(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="altrex-dialog-footer">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Saving..." : "Save Item Type"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
