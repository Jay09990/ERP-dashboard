"use client";

import { projectApi } from "@/features/projects/api";
import type { Project, ProjectStatus } from "@/features/projects/schema";
import { Button, TableSkeleton } from "@altrex/ui";
import { ArrowRight, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EntityFormDialog,
  type FieldDefinition,
  MutationError,
  extractRecords,
  recordId,
} from "./ProjectUi";

const statuses: ProjectStatus[] = [
  "planning",
  "approved",
  "in_progress",
  "on_hold",
  "delayed",
  "completed",
  "closed",
  "cancelled",
];

const transitions: Record<string, ProjectStatus[]> = {
  planning: ["approved", "cancelled"],
  approved: ["in_progress", "cancelled"],
  in_progress: ["on_hold", "delayed", "completed", "cancelled"],
  on_hold: ["in_progress", "cancelled"],
  delayed: ["in_progress", "completed", "cancelled"],
  completed: ["closed"],
  closed: [],
  cancelled: [],
};

const projectFields: FieldDefinition[] = [
  { name: "project_name", label: "Project name", required: true },
  { name: "party_id", label: "Customer / party ID", type: "number" },
  { name: "quotation_id", label: "Quotation ID", type: "number" },
  { name: "sales_order_id", label: "Sales order ID", type: "number" },
  { name: "contract_no", label: "Contract number" },
  { name: "customer_po_no", label: "Customer PO number" },
  { name: "customer_po_date", label: "Customer PO date", type: "date" },
  {
    name: "project_type",
    label: "Project type",
    placeholder: "mechanical, hvac, turnkey, etc.",
  },
  { name: "project_location", label: "Project location" },
  { name: "site_address", label: "Site address" },
  { name: "project_manager_id", label: "Project manager ID", type: "number" },
  { name: "project_engineer_id", label: "Project engineer ID", type: "number" },
  { name: "start_date", label: "Start date", type: "date" },
  { name: "planned_end_date", label: "Planned end date", type: "date" },
  { name: "actual_end_date", label: "Actual end date", type: "date" },
  { name: "currency_id", label: "Currency ID", type: "number" },
  { name: "contract_value", label: "Contract value", type: "number" },
  { name: "estimated_cost", label: "Estimated cost", type: "number" },
  { name: "actual_cost", label: "Actual cost", type: "number" },
  { name: "progress_percent", label: "Progress (%)", type: "number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statuses.map((value) => ({
      value,
      label: value.replaceAll("_", " "),
    })),
  },
  { name: "description", label: "Description", type: "textarea" },
  { name: "terms_conditions", label: "Terms and conditions", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
  {
    name: "boqItems",
    label: "Initial bill of quantities",
    type: "collection",
    itemFields: [
      {
        name: "boq_type",
        label: "Type",
        type: "select",
        required: true,
        options: ["material", "service", "labour"].map((value) => ({
          value,
          label: value[0].toUpperCase() + value.slice(1),
        })),
      },
      { name: "item_id", label: "Item ID", type: "number" },
      { name: "description", label: "Description", required: true },
      { name: "quantity", label: "Quantity", type: "number", required: true },
      { name: "unit_id", label: "Unit ID", type: "number" },
      {
        name: "unit_rate",
        label: "Rate per unit",
        type: "number",
        required: true,
      },
    ],
  },
  {
    name: "costBudget",
    label: "Initial cost budgets",
    type: "collection",
    itemFields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          "material",
          "labour",
          "equipment",
          "subcontract",
          "other",
        ].map((value) => ({
          value,
          label: value[0].toUpperCase() + value.slice(1),
        })),
      },
      {
        name: "budget_amount",
        label: "Budget amount",
        type: "number",
        required: true,
      },
      { name: "actual_amount", label: "Actual amount", type: "number" },
      { name: "remarks", label: "Notes" },
    ],
  },
  {
    name: "milestones",
    label: "Initial milestones",
    type: "collection",
    itemFields: [
      { name: "milestone_name", label: "Milestone name", required: true },
      { name: "due_date", label: "Due date", type: "date" },
      { name: "payment_percent", label: "Payment share (%)", type: "number" },
      { name: "payment_amount", label: "Payment amount", type: "number" },
      { name: "sort_order", label: "Order", type: "number" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["pending", "in_progress", "completed", "invoiced"].map(
          (value) => ({ value, label: value.replaceAll("_", " ") }),
        ),
      },
      { name: "remarks", label: "Notes" },
    ],
  },
];

const fromOrderFields: FieldDefinition[] = [
  {
    name: "sales_order_id",
    label: "Sales order ID",
    type: "number",
    required: true,
  },
  ...projectFields.filter(
    (field) =>
      ![
        "sales_order_id",
        "quotation_id",
        "party_id",
        "boqItems",
        "costBudget",
        "milestones",
      ].includes(field.name),
  ),
];

function money(value: number | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function dateLabel(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

function statusLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ProjectList() {
  const [status, setStatus] = useState("");
  const [partyId, setPartyId] = useState("");
  const [dialog, setDialog] = useState<"create" | "from-order" | "edit" | null>(
    null,
  );
  const [selected, setSelected] = useState<Project | null>(null);
  const filters = {
    ...(status ? { status } : {}),
    ...(partyId.trim() ? { partyId: partyId.trim() } : {}),
  };
  const projectsQuery = projectApi.useList(filters);
  const projects = useMemo(
    () => extractRecords<Project>(projectsQuery.data),
    [projectsQuery.data],
  );
  const createProject = projectApi.useCreate();
  const createFromSalesOrder = projectApi.useCreateFromSalesOrder();
  const updateProject = projectApi.useUpdate();
  const deleteProject = projectApi.useDelete();
  const changeStatus = projectApi.useChangeStatus();

  const closeDialog = () => {
    setDialog(null);
    setSelected(null);
  };

  const submit = (values: Record<string, unknown>) => {
    if (dialog === "from-order") {
      const { sales_order_id, ...body } = values;
      if (sales_order_id == null) return;
      createFromSalesOrder.mutate(
        { id: sales_order_id as number, body },
        { onSuccess: closeDialog },
      );
      return;
    }
    if (dialog === "edit" && selected) {
      const id = recordId(selected as unknown as Record<string, unknown>, [
        "project_id",
        "id",
      ]);
      if (id == null) return;
      updateProject.mutate({ id, body: values }, { onSuccess: closeDialog });
      return;
    }
    createProject.mutate(
      { body: { status: "planning", ...values } },
      { onSuccess: closeDialog },
    );
  };

  const busy =
    createProject.isPending ||
    createFromSalesOrder.isPending ||
    updateProject.isPending;
  const mutationError =
    createProject.error ||
    createFromSalesOrder.error ||
    updateProject.error ||
    deleteProject.error ||
    changeStatus.error;

  return (
    <div>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Project Management</span>
          <h1>Projects</h1>
          <p>Plan delivery, manage project execution, and track financials.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="outline" onClick={() => projectsQuery.refetch()}>
            <RefreshCw size={15} /> Refresh
          </Button>
          <Button variant="outline" onClick={() => setDialog("from-order")}>
            Create from sales order
          </Button>
          <Button onClick={() => setDialog("create")}>
            <Plus size={15} /> New project
          </Button>
        </div>
      </div>

      <MutationError error={mutationError} />
      <section className="altrex-card" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <label className="altrex-field" style={{ maxWidth: 280 }}>
            <span>Filter by status</span>
            <select
              className="altrex-input"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((value) => (
                <option value={value} key={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="altrex-field" style={{ maxWidth: 280 }}>
            <span>Filter by customer reference</span>
            <input
              className="altrex-input"
              type="number"
              min="1"
              value={partyId}
              onChange={(event) => setPartyId(event.target.value)}
            />
          </label>
        </div>
      </section>

      {projectsQuery.isLoading ? (
        <TableSkeleton columns={7} message="Loading projects..." />
      ) : projectsQuery.error ? (
        <MutationError error={projectsQuery.error} />
      ) : (
        <div className="altrex-card altrex-table-wrap">
          <table className="altrex-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Customer</th>
                <th>Schedule</th>
                <th>Contract value</th>
                <th>Progress</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const row = project as unknown as Record<string, unknown>;
                const id = recordId(row, ["project_id", "id"]);
                const allowed = transitions[project.status] ?? [];
                return (
                  <tr key={id ?? project.project_code ?? project.project_name}>
                    <td>
                      <strong>{project.project_name}</strong>
                      <small
                        style={{
                          display: "block",
                          color: "var(--altrex-muted)",
                        }}
                      >
                        {project.project_code ?? `Project #${id ?? "—"}`}
                      </small>
                    </td>
                    <td>
                      {project.party_name ??
                        (project.party_id == null
                          ? "—"
                          : `Customer #${project.party_id}`)}
                    </td>
                    <td>
                      {dateLabel(project.start_date)} –{" "}
                      {dateLabel(project.planned_end_date)}
                    </td>
                    <td>{money(project.contract_value)}</td>
                    <td>{Number(project.progress_percent ?? 0)}%</td>
                    <td>
                      <select
                        className="altrex-input"
                        aria-label={`Change ${project.project_name} status`}
                        value=""
                        disabled={
                          !id || allowed.length === 0 || changeStatus.isPending
                        }
                        onChange={(event) => {
                          if (event.target.value && id) {
                            changeStatus.mutate({
                              id,
                              status: event.target.value,
                            });
                          }
                        }}
                      >
                        <option value="">{statusLabel(project.status)}</option>
                        {allowed.map((value) => (
                          <option key={value} value={value}>
                            {statusLabel(value)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        {id != null && (
                          <Link
                            className="altrex-button altrex-button-secondary"
                            href={`/projects/${id}`}
                          >
                            <ArrowRight size={14} /> Open
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          aria-label={`Edit ${project.project_name}`}
                          onClick={() => {
                            setSelected(project);
                            setDialog("edit");
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          aria-label={`Delete ${project.project_name}`}
                          disabled={id == null || deleteProject.isPending}
                          onClick={() => {
                            if (
                              id != null &&
                              window.confirm(
                                `Delete project "${project.project_name}"?`,
                              )
                            ) {
                              deleteProject.mutate({ id });
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 28 }}>
                    No projects match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {dialog && (
        <EntityFormDialog
          title={
            dialog === "create"
              ? "Create project"
              : dialog === "from-order"
                ? "Create project from sales order"
                : "Update project"
          }
          fields={dialog === "from-order" ? fromOrderFields : projectFields}
          initialValues={
            dialog === "edit" && selected
              ? (selected as unknown as Record<string, unknown>)
              : undefined
          }
          isPending={busy}
          submitEmptyValues={dialog === "edit"}
          onClose={closeDialog}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
