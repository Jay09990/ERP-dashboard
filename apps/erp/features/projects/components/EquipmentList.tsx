"use client";

import { equipmentApi } from "@/features/projects/api";
import { useProjectChildLookups } from "@/features/projects/lookups";
import type { Equipment } from "@/features/projects/schema";
import { Button, TableSkeleton } from "@altrex/ui";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EntityFormDialog,
  type FieldDefinition,
  MutationError,
  extractRecords,
  recordId,
} from "./ProjectUi";

const equipmentFields: FieldDefinition[] = [
  { name: "equipment_name", label: "Equipment name", required: true },
  {
    name: "equipment_type",
    label: "Equipment type",
    placeholder: "crane, forklift, excavator, generator, etc.",
    required: true,
  },
  {
    name: "ownership",
    label: "Ownership (owned / rented)",
    placeholder: "owned or rented",
    required: true,
  },
  {
    name: "vendor_id",
    label: "Vendor / Supplier",
    type: "reference",
  },
  {
    name: "rate_per_hour",
    label: "Rate per hour (₹)",
    type: "number",
  },
  {
    name: "rate_per_day",
    label: "Rate per day (₹)",
    type: "number",
  },
  {
    name: "status",
    label: "Status (active / inactive / maintenance)",
    placeholder: "active",
  },
  { name: "notes", label: "Notes / Specifications", type: "textarea" },
];

function currency(value: unknown) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

export function EquipmentList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);

  const queryFilters: Record<string, string> = {};
  if (statusFilter) queryFilters.status = statusFilter;
  if (typeFilter) queryFilters.type = typeFilter;
  if (search) queryFilters.search = search;

  const equipmentQuery = equipmentApi.useList(
    Object.keys(queryFilters).length > 0 ? queryFilters : undefined,
  );
  const lookups = useProjectChildLookups(dialogOpen);

  const createMutation = equipmentApi.useCreate();
  const updateMutation = equipmentApi.useUpdate();
  const deleteMutation = equipmentApi.useDelete();

  const records = useMemo(
    () => extractRecords<Equipment>(equipmentQuery.data),
    [equipmentQuery.data],
  );

  const saveRecord = (values: Record<string, unknown>) => {
    const id = editing
      ? recordId(editing as unknown as Record<string, unknown>, [
          "equipment_id",
          "id",
        ])
      : undefined;
    const callbacks = { onSuccess: () => setDialogOpen(false) };
    if (id != null) {
      updateMutation.mutate({ id, body: values }, callbacks);
    } else {
      createMutation.mutate({ body: values }, callbacks);
    }
  };

  const removeRecord = (record: Equipment) => {
    const id = recordId(record as unknown as Record<string, unknown>, [
      "equipment_id",
      "id",
    ]);
    if (id == null || !window.confirm("Delete this equipment registry entry?"))
      return;
    deleteMutation.mutate({ id });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const errors = [
    createMutation.error,
    updateMutation.error,
    deleteMutation.error,
  ].filter(Boolean);

  return (
    <div>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Project Management</span>
          <h1>Equipment Registry</h1>
          <p>
            Track machinery, cranes, generators, and heavy equipment rates and
            ownership.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/projects"
            className="altrex-button altrex-button-secondary"
          >
            View projects
          </Link>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={15} /> Add equipment
          </Button>
        </div>
      </div>

      {errors.map((error, idx) => (
        <MutationError error={error} key={String(idx)} />
      ))}

      <div
        className="altrex-filter-bar"
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <input
          type="search"
          placeholder="Search by equipment name..."
          className="altrex-input"
          style={{ maxWidth: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="altrex-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          className="altrex-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          <option value="crane">Crane</option>
          <option value="forklift">Forklift</option>
          <option value="generator">Generator</option>
          <option value="excavator">Excavator</option>
        </select>
      </div>

      {equipmentQuery.isLoading ? (
        <TableSkeleton columns={6} message="Loading equipment registry..." />
      ) : records.length === 0 ? (
        <div className="altrex-table-state">
          <Wrench size={32} style={{ opacity: 0.4, margin: "0 auto 12px" }} />
          <p>No equipment records found matching the criteria.</p>
        </div>
      ) : (
        <div className="altrex-table-wrap">
          <table className="altrex-table">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Type / Ownership</th>
                <th>Hourly Rate</th>
                <th>Daily Rate</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {records.map((item, idx) => {
                const id = recordId(item as unknown as Record<string, unknown>, [
                  "equipment_id",
                  "id",
                ]);
                return (
                  <tr key={id ?? idx}>
                    <td>
                      <strong>{item.equipment_name}</strong>
                      {item.notes && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {item.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          textTransform: "capitalize",
                          fontWeight: 500,
                        }}
                      >
                        {item.equipment_type}
                      </span>{" "}
                      ·{" "}
                      <span style={{ textTransform: "capitalize" }}>
                        {item.ownership}
                      </span>
                    </td>
                    <td>{currency(item.rate_per_hour)}</td>
                    <td>{currency(item.rate_per_day)}</td>
                    <td>
                      <span
                        className="altrex-pill"
                        style={{ textTransform: "capitalize" }}
                      >
                        {item.status || "active"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button
                          variant="outline"
                          aria-label={`Edit ${item.equipment_name}`}
                          onClick={() => {
                            setEditing(item);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          aria-label={`Delete ${item.equipment_name}`}
                          onClick={() => removeRecord(item)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        <EntityFormDialog
          title={editing ? "Edit equipment" : "Add equipment"}
          fields={equipmentFields}
          initialValues={
            (editing as unknown as Record<string, unknown>) ?? {
              status: "active",
              ownership: "owned",
            }
          }
          fieldOptions={lookups.options}
          isPending={isSaving}
          onClose={() => setDialogOpen(false)}
          onSubmit={saveRecord}
        />
      )}
    </div>
  );
}
