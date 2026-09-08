"use client";

import { Button } from "@altrex/ui";
import { FolderTree, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCreateItemCategory, useDeleteItemCategory, useItemCategories } from "../api";
import type { ItemCategory } from "../schema";

export function ItemCategoryTree() {
  const { data: responseData, isLoading, error } = useItemCategories();
  const categories: ItemCategory[] = Array.isArray(responseData)
    ? responseData
    : (responseData as any)?.categories ??
      (responseData as any)?.Categories ??
      (responseData as any)?.item_categories ??
      (responseData as any)?.data ??
      [];

  const { mutate: createCategory, isPending: isCreating } = useCreateItemCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteItemCategory();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const getCategoryId = (c: ItemCategory) => c.category_id ?? (c as any).id;

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

  // Build root categories and children map
  const { rootCategories, childrenMap } = useMemo(() => {
    const roots: ItemCategory[] = [];
    const map = new Map<number, ItemCategory[]>();

    categories.forEach((cat) => {
      const pid = cat.parent_category_id;
      if (!pid) {
        roots.push(cat);
      } else {
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid)!.push(cat);
      }
    });

    return { rootCategories: roots, childrenMap: map };
  }, [categories]);

  const renderCategoryNode = (cat: ItemCategory, depth = 0) => {
    const id = getCategoryId(cat);
    const children = childrenMap.get(id) || [];

    return (
      <div key={id} style={{ marginLeft: `${depth * 24}px`, marginTop: "8px" }}>
        <div
          className="altrex-detail-card"
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: depth === 0 ? "var(--altrex-surface)" : "var(--altrex-raised)",
            borderLeft: depth > 0 ? "3px solid var(--altrex-primary)" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderTree size={16} style={{ color: depth === 0 ? "var(--altrex-primary)" : "#8b5cf6" }} />
            <span style={{ fontWeight: depth === 0 ? 700 : 500, fontSize: "14px", color: "var(--altrex-text)" }}>
              {cat.category_name}
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
              onClick={() => {
                setParentId(id.toString());
                setIsOpenModal(true);
              }}
              style={{ fontSize: "12px", padding: "3px 8px" }}
            >
              + Sub-Category
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm(`Are you sure you want to delete category "${cat.category_name}"?`)) {
                  deleteCategory(id.toString());
                }
              }}
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
            {children.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Inventory Catalog</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Item Category Hierarchy
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            Manage parent-child hierarchical classification for items and products.
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
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading category hierarchy...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load category hierarchy from server.
        </div>
      ) : categories.length === 0 ? (
        <div className="altrex-detail-card" style={{ padding: "40px", textAlign: "center", color: "var(--altrex-muted)" }}>
          No item categories found. Click "+ Add Root Category" to create your first category.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {rootCategories.map((cat) => renderCategoryNode(cat, 0))}
        </div>
      )}

      {/* Category Creation Modal */}
      {isOpenModal && (
        <div className="altrex-dialog-backdrop" onClick={() => setIsOpenModal(false)}>
          <div className="altrex-dialog altrex-dialog-md" onClick={(e) => e.stopPropagation()}>
            <div className="altrex-dialog-header">
              <div>
                <h3 className="altrex-dialog-title">Create Item Category</h3>
                <p className="altrex-dialog-subtitle">
                  {parentId ? "Add a nested sub-category" : "Add a new top-level root category"}
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
              <div className="altrex-dialog-body" style={{ display: "grid", gap: "16px" }}>
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
                      <option key={getCategoryId(c)} value={getCategoryId(c).toString()}>
                        {c.category_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="altrex-dialog-footer">
                <Button variant="outline" type="button" onClick={() => setIsOpenModal(false)}>
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
