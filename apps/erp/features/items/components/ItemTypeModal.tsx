"use client";

import { Button, DataTable } from "@altrex/ui";
import { Plus, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useCreateItemType, useDeleteItemType, useItemTypes } from "../api";
import type { ItemType } from "../schema";

export function ItemTypeList() {
  const { data: responseData, isLoading, error } = useItemTypes();
  const types: ItemType[] = Array.isArray(responseData)
    ? responseData
    : (responseData as any)?.types ??
      (responseData as any)?.Types ??
      (responseData as any)?.item_types ??
      (responseData as any)?.data ??
      [];

  const { mutate: createItemType, isPending: isCreating } = useCreateItemType();
  const { mutate: deleteItemType, isPending: isDeleting } = useDeleteItemType();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [typeName, setTypeName] = useState("");

  const getTypeId = (t: ItemType) => t.item_type_id ?? (t as any).id;

  const handleCreate = (e: React.FormEvent) => {
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
          <span style={{ fontWeight: 600, color: "var(--altrex-text)", fontSize: "14px" }}>
            {t.item_type_name}
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
              if (confirm(`Are you sure you want to delete item type "${t.item_type_name}"?`)) {
                deleteItemType(id);
              }
            }}
            disabled={isDeleting}
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
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            Manage item classification types (e.g. Raw Material, Finished Good, Service, Asset).
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
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading item types...</span>
        </div>
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
        <div className="altrex-dialog-backdrop" onClick={() => setIsOpenModal(false)}>
          <div className="altrex-dialog altrex-dialog-md" onClick={(e) => e.stopPropagation()}>
            <div className="altrex-dialog-header">
              <div>
                <h3 className="altrex-dialog-title">Add Item Type</h3>
                <p className="altrex-dialog-subtitle">
                  Define a new item classification type for inventory management.
                </p>
              </div>
              <button
                type="button"
                className="altrex-icon-button"
                onClick={() => setIsOpenModal(false)}
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
                <Button variant="outline" type="button" onClick={() => setIsOpenModal(false)}>
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
