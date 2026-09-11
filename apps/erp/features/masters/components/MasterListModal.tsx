"use client";

import { Button, DataTable, FilterBar } from "@altrex/ui";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date";
  placeholder?: string;
  getLabel?: (formData: Record<string, any>) => string;
  getPlaceholder?: (formData: Record<string, any>) => string | undefined;
  required?: boolean;
  options?: { label: string; value: string }[];
};

interface MasterListModalProps<T extends Record<string, any>> {
  title: string;
  subtitle: string;
  eyebrow?: string;
  idField: string;
  columns: {
    key: keyof T;
    label: string;
    render?: (row: T) => React.ReactNode;
  }[];
  fields: FieldConfig[];
  useList: () => { data?: T[] | any; isLoading: boolean; error: any };
  useCreate: () => { mutate: (body: any, opts?: any) => void; isPending: boolean };
  useUpdate: () => { mutate: (args: { id: string; body: any }, opts?: any) => void; isPending: boolean };
  useDelete: () => { mutate: (id: string, opts?: any) => void; isPending: boolean };
}

/** Finds the first record array in a backend response, regardless of its list key. */
function extractList<T>(value: unknown, visited = new Set<unknown>()): T[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);
  for (const nestedValue of Object.values(value)) {
    const nested = extractList<T>(nestedValue, visited);
    if (nested.length > 0) return nested;
  }

  return [];
}

export function MasterListModal<T extends Record<string, any>>({
  title,
  subtitle,
  eyebrow = "Settings Master",
  idField,
  columns,
  fields,
  useList,
  useCreate,
  useUpdate,
  useDelete,
}: MasterListModalProps<T>) {
  const [search, setSearch] = useState("");
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: responseData, isLoading, error } = useList();
  const items: T[] = extractList<T>(responseData);

  const { mutate: createItem, isPending: isCreating } = useCreate();
  const { mutate: updateItem, isPending: isUpdating } = useUpdate();
  const { mutate: deleteItem, isPending: isDeleting } = useDelete();

  const getItemId = (item: T) => item[idField] ?? item.id;

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter((item) =>
      Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [items, search]);

  const handleOpenAdd = () => {
    setActiveItem(null);
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.name] = f.type === "number" ? 0 : "";
    });
    setFormData(initial);
    setIsOpenModal(true);
  };

  const handleOpenEdit = (item: T) => {
    setActiveItem(item);
    const current: Record<string, any> = {};
    fields.forEach((f) => {
      current[f.name] = item[f.name] ?? "";
    });
    setFormData(current);
    setIsOpenModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItem) {
      const id = getItemId(activeItem).toString();
      updateItem(
        { id, body: formData },
        {
          onSuccess: () => {
            setIsOpenModal(false);
            setActiveItem(null);
          },
        },
      );
    } else {
      createItem(formData, {
        onSuccess: () => {
          setIsOpenModal(false);
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  const tableColumns = [
    ...columns,
    {
      key: idField as keyof T,
      label: "Actions",
      render: (row: T) => {
        const id = getItemId(row)?.toString() ?? "";
        return (
          <div className="altrex-row-actions">
            <Button
              variant="outline"
              onClick={() => handleOpenEdit(row)}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              <Edit size={13} />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm(`Are you sure you want to delete this master item?`)) {
                  deleteItem(id);
                }
              }}
              disabled={isDeleting}
              aria-label={`Delete ${title}`}
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
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">{eyebrow}</span>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>{title}</h1>
          <p style={{ margin: "4px 0 0", color: "var(--altrex-muted)", fontSize: "14px" }}>
            {subtitle}
          </p>
        </div>
        <Button onClick={handleOpenAdd} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} />
          Add Record
        </Button>
      </div>

      <FilterBar>
        <Search size={17} aria-hidden="true" style={{ color: "var(--altrex-muted)", flexShrink: 0 }} />
        <input
          className="altrex-input"
          placeholder="Search master records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "320px", minWidth: 0 }}
        />
      </FilterBar>

      {isLoading ? (
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading master records...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load records from server.
        </div>
      ) : (
        <DataTable
          columns={tableColumns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filtered}
          rowKey={(row, idx) => getItemId(row) ?? idx}
        />
      )}

      {isOpenModal && (
        <div className="altrex-dialog-backdrop" role="presentation" onClick={() => setIsOpenModal(false)}>
          <div className="altrex-dialog altrex-dialog-md" role="dialog" aria-modal="true" aria-labelledby="master-dialog-title" onClick={(e) => e.stopPropagation()}>
            <div className="altrex-dialog-header">
              <div>
                <h3 className="altrex-dialog-title" id="master-dialog-title">
                  {activeItem ? `Edit ${title}` : `Add New ${title}`}
                </h3>
                <p className="altrex-dialog-subtitle">Fill in the master entry details below.</p>
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
            <form onSubmit={handleSubmit}>
              <div className="altrex-dialog-body" style={{ display: "grid", gap: "18px" }}>
                {fields.map((f) => (
                  <label key={f.name} className="altrex-field">
                    <span>
                      {f.getLabel?.(formData) ?? f.label} {f.required && "*"}
                    </span>
                    {f.type === "select" ? (
                      <select
                        className="altrex-input altrex-select"
                        value={formData[f.name] ?? ""}
                        onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                        required={f.required}
                      >
                        <option value="">Select {f.label}...</option>
                        {f.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                        className="altrex-input"
                        placeholder={f.getPlaceholder?.(formData) ?? f.placeholder}
                        value={formData[f.name] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value,
                          })
                        }
                        required={f.required}
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="altrex-dialog-footer">
                <Button variant="outline" type="button" onClick={() => setIsOpenModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : activeItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
