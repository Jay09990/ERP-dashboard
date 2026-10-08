"use client";

import { Button, LoadingState } from "@altrex/ui";
import { FolderTree, Plus, Trash2, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import {
  useCreateItemCategory,
  useDeleteItemCategory,
  useItemCategories,
} from "../api";
import type { ItemCategory } from "../schema";

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

// Static module-level helper functions for category data extraction.
// Defined outside component scope so they retain reference identity across renders.
// This prevents invalidating useMemo dependencies and breaking React.memo for tree nodes.
function extractCategoryId(c: ItemCategory): number | string {
  const rec = c as Record<string, unknown>;
  return (
    c.category_id ??
    (rec.itemCategoryId as number | string) ??
    (rec.item_category_id as number | string) ??
    (rec.id as number | string)
  );
}

function extractCategoryName(c: ItemCategory): string {
  const rec = c as Record<string, unknown>;
  return (
    c.category_name ??
    (rec.item_category_name as string) ??
    (rec.name as string) ??
    "Unnamed category"
  );
}

function extractParentId(c: ItemCategory): number | string | null {
  const rec = c as Record<string, unknown>;
  return (
    c.parent_category_id ??
    (rec.parentCategoryId as number | string) ??
    (rec.item_parent_category as number | string) ??
    null
  );
}

interface CategoryTreeNodeProps {
  cat: ItemCategory;
  depth: number;
  childrenMap: Map<number | string, ItemCategory[]>;
  onAddSubCategory: (id: string | number) => void;
  onDeleteCategory: (cat: ItemCategory) => void;
  isDeleting: boolean;
}

/**
 * Memoized category tree node component to prevent recursive re-rendering
 * of the entire tree when parent modal/input state updates.
 */
const CategoryTreeNode = React.memo(function CategoryTreeNode({
  cat,
  depth,
  childrenMap,
  onAddSubCategory,
  onDeleteCategory,
  isDeleting,
}: CategoryTreeNodeProps) {
  const id = extractCategoryId(cat);
  const children = childrenMap.get(id) || [];

  return (
    <div style={{ marginLeft: `${depth * 24}px`, marginTop: "8px" }}>
      <div
        className="altrex-detail-card"
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            depth === 0 ? "var(--altrex-surface)" : "var(--altrex-raised)",
          borderLeft: depth > 0 ? "3px solid var(--altrex-primary)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FolderTree
            size={16}
            style={{ color: depth === 0 ? "var(--altrex-primary)" : "#8b5cf6" }}
          />
          <span
            style={{
              fontWeight: depth === 0 ? 700 : 500,
              fontSize: "14px",
              color: "var(--altrex-text)",
            }}
          >
            {extractCategoryName(cat)}
          </span>
          {depth === 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                background: "rgba(37,99,235,0.1)",
                color: "var(--altrex-primary)",
                padding: "1px 8px",
                borderRadius: "10px",
              }}
            >
              Root Category
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outline"
            onClick={() => onAddSubCategory(id)}
            style={{ fontSize: "12px", padding: "3px 8px" }}
          >
            + Sub-Category
          </Button>
          <Button
            variant="outline"
            onClick={() => onDeleteCategory(cat)}
            disabled={isDeleting}
            style={{
              color: "var(--altrex-danger-text)",
              borderColor: "rgba(220,38,38,0.2)",
              fontSize: "12px",
              padding: "3px 8px",
            }}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {/* Children */}
      {children.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {children.map((child) => (
            <CategoryTreeNode
              key={extractCategoryId(child)}
              cat={child}
              depth={depth + 1}
              childrenMap={childrenMap}
              onAddSubCategory={onAddSubCategory}
              onDeleteCategory={onDeleteCategory}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export function ItemCategoryTree() {
  const { data: responseData, isLoading, error } = useItemCategories();
  // Memoize extracted category records to preserve array reference identity across re-renders.
  // Prevents invalidating downstream useMemo (rootCategories / childrenMap) when typing in modal inputs.
  const categories = useMemo(
    () => extractRecords<ItemCategory>(responseData),
    [responseData],
  );

  const { mutate: createCategory, isPending: isCreating } =
    useCreateItemCategory();
  const { mutate: deleteCategory, isPending: isDeleting } =
    useDeleteItemCategory();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    createCategory(
      {
        category_name: categoryName,
        parent_category_id: parentId ? Number(parentId) : null,
      },
      {
        onSuccess: () => {
          setIsOpenModal(false);
          setCategoryName("");
          setParentId("");
        },
      },
    );
  };

  // Build root categories and children map.
  // Static extractParentId module function keeps dependency array [categories], ensuring tree structure
  // is only recomputed when categories data changes, not on modal/input state updates.
  const { rootCategories, childrenMap } = useMemo(() => {
    const roots: ItemCategory[] = [];
    const map = new Map<number | string, ItemCategory[]>();

    for (const cat of categories) {
      const pid = extractParentId(cat);
      if (!pid) {
        roots.push(cat);
      } else {
        const existing = map.get(pid);
        if (existing) {
          existing.push(cat);
        } else {
          map.set(pid, [cat]);
        }
      }
    }

    return { rootCategories: roots, childrenMap: map };
  }, [categories]);

  // Memoized handlers to prevent unnecessary re-renders of memoized CategoryTreeNode children
  const handleAddSubCategory = useCallback((id: string | number) => {
    setParentId(id.toString());
    setIsOpenModal(true);
  }, []);

  const handleDeleteCategory = useCallback(
    (cat: ItemCategory) => {
      const id = extractCategoryId(cat);
      const name = extractCategoryName(cat);
      if (confirm(`Are you sure you want to delete category "${name}"?`)) {
        deleteCategory(id.toString());
      }
    },
    [deleteCategory],
  );

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Inventory Catalog</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Item Category Hierarchy
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--altrex-muted)",
              fontSize: "14px",
            }}
          >
            Manage parent-child hierarchical classification for items and
            products.
          </p>
        </div>
        <Button
          onClick={() => {
            setParentId("");
            setIsOpenModal(true);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Add Root Category
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading item category hierarchy..." />
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load category hierarchy from server.
        </div>
      ) : categories.length === 0 ? (
        <div
          className="altrex-detail-card"
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--altrex-muted)",
          }}
        >
          No item categories found. Click "+ Add Root Category" to create your
          first category.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rootCategories.map((cat) => (
            <CategoryTreeNode
              key={extractCategoryId(cat)}
              cat={cat}
              depth={0}
              childrenMap={childrenMap}
              onAddSubCategory={handleAddSubCategory}
              onDeleteCategory={handleDeleteCategory}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Category Creation Modal */}
      {isOpenModal && (
        <div
          className="altrex-dialog-backdrop"
          onClick={() => setIsOpenModal(false)}
        >
          <div
            className="altrex-dialog altrex-dialog-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="altrex-dialog-header">
              <div>
                <h3 className="altrex-dialog-title">Create Item Category</h3>
                <p className="altrex-dialog-subtitle">
                  {parentId
                    ? "Add a nested sub-category"
                    : "Add a new top-level root category"}
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
              <div
                className="altrex-dialog-body"
                style={{ display: "grid", gap: "16px" }}
              >
                <label className="altrex-field">
                  <span>Category Name *</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. Raw Materials / Electronics"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </label>
                <label className="altrex-field">
                  <span>Parent Category</span>
                  <select
                    className="altrex-input altrex-select"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                  >
                    <option value="">(None - Top Level Root)</option>
                    {categories.map((c) => (
                      <option
                        key={extractCategoryId(c)}
                        value={extractCategoryId(c).toString()}
                      >
                        {extractCategoryName(c)}
                      </option>
                    ))}
                  </select>
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
                  {isCreating ? "Saving..." : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
