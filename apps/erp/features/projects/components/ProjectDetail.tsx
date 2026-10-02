"use client";

import { projectApi } from "@/features/projects/api";
import type {
  DailyProgressReport,
  Project,
  ProjectBoqItem,
  ProjectCost,
  ProjectDocument,
  ProjectFinancials,
  ProjectMilestone,
  ProjectSite,
  ProjectTask,
} from "@/features/projects/schema";
import { Button } from "@altrex/ui";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EntityFormDialog,
  type FieldDefinition,
  MutationError,
  errorMessage,
  extractRecord,
  extractRecords,
  recordId,
} from "./ProjectUi";

type Section =
  | "overview"
  | "sites"
  | "boq"
  | "milestones"
  | "tasks"
  | "reports"
  | "documents";

const sectionFields: Partial<Record<Section, FieldDefinition[]>> = {
  sites: [
    { name: "site_name", label: "Site name", required: true },
    { name: "address_line1", label: "Address" },
    { name: "city_id", label: "City ID", type: "number" },
    { name: "state_id", label: "State ID", type: "number" },
    { name: "country_id", label: "Country ID", type: "number" },
    { name: "pincode", label: "Postal code" },
    { name: "contact_person", label: "Contact person" },
    { name: "contact_phone", label: "Contact phone" },
  ],
  boq: [
    {
      name: "boq_type",
      label: "Type (material, service, labour)",
      required: true,
    },
    { name: "item_id", label: "Item ID", type: "number" },
    { name: "description", label: "Description", required: true },
    { name: "quantity", label: "Quantity", type: "number", required: true },
    { name: "unit_id", label: "Unit ID", type: "number" },
    { name: "unit_rate", label: "Unit rate", type: "number", required: true },
    { name: "consumed_quantity", label: "Consumed quantity", type: "number" },
  ],
  milestones: [
    { name: "milestone_name", label: "Milestone", required: true },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "completion_date", label: "Completion date", type: "date" },
    { name: "payment_percent", label: "Payment percent", type: "number" },
    { name: "payment_amount", label: "Payment amount", type: "number" },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "status", label: "Status", placeholder: "pending" },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ],
  tasks: [
    { name: "site_id", label: "Site ID", type: "number" },
    { name: "task_name", label: "Task", required: true },
    { name: "assigned_to", label: "Assigned user ID", type: "number" },
    { name: "start_date", label: "Start date", type: "date" },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "priority", label: "Priority", placeholder: "low, medium, high" },
    { name: "progress_percent", label: "Progress (%)", type: "number" },
    { name: "status", label: "Status", placeholder: "pending" },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ],
  reports: [
    { name: "site_id", label: "Site ID", type: "number" },
    { name: "report_date", label: "Report date", type: "date", required: true },
    { name: "weather", label: "Weather" },
    { name: "manpower_count", label: "Manpower count", type: "number" },
    { name: "equipment_used", label: "Equipment used", type: "textarea" },
    { name: "work_completed", label: "Work completed", type: "textarea" },
    { name: "material_used", label: "Material used", type: "textarea" },
    { name: "material_shortage", label: "Material shortage", type: "textarea" },
    { name: "work_planned_next", label: "Next planned work", type: "textarea" },
    { name: "progress_percent", label: "Progress (%)", type: "number" },
    { name: "issues", label: "Issues", type: "textarea" },
    { name: "safety_issues", label: "Safety issues", type: "textarea" },
    {
      name: "client_instructions",
      label: "Client instructions",
      type: "textarea",
    },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ],
  documents: [
    { name: "site_id", label: "Site ID", type: "number" },
    { name: "document_name", label: "Document name", required: true },
    { name: "document_type", label: "Document type" },
    { name: "file_url", label: "File URL", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ],
};

const sectionLabels: Record<Section, string> = {
  overview: "Overview",
  sites: "Sites",
  boq: "BOQ & budget",
  milestones: "Milestones",
  tasks: "Tasks",
  reports: "Daily progress",
  documents: "Documents",
};

const sectionKeys: Partial<Record<Section, string[]>> = {
  sites: ["sites", "project_sites", "tbl_project_sites"],
  boq: ["boqItems", "boq_items", "project_boq_items"],
  milestones: ["milestones", "project_milestones"],
  tasks: ["tasks", "project_tasks"],
};
const costKeys = ["costBudget", "costs", "project_costs", "projectCosts"];

const idKeys: Partial<Record<Section, string[]>> = {
  sites: ["site_id", "project_site_id", "id"],
  boq: ["boq_item_id", "project_boq_item_id", "boq_id", "id"],
  milestones: ["milestone_id", "id"],
  tasks: ["task_id", "project_task_id", "id"],
  documents: ["document_id", "project_document_id", "id"],
};

function childRows(value: unknown, keys: string[]): Record<string, unknown>[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key].filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      );
    }
  }
  return [];
}

function titleOf(record: Record<string, unknown>, section: Section) {
  const candidates: Partial<Record<Section, string[]>> = {
    sites: ["site_name", "name"],
    boq: ["description", "item_name"],
    milestones: ["milestone_name"],
    tasks: ["task_name"],
    reports: ["report_date"],
    documents: ["document_name", "file_name"],
  };
  for (const key of candidates[section] ?? []) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number")
      return String(value);
  }
  return "Record";
}

function currency(value: unknown) {
  const number = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

export function ProjectDetail({ id }: { id: string }) {
  const detailQuery = projectApi.useDetail(id);
  const financialsQuery = projectApi.useFinancials(id);
  const dprQuery = projectApi.useDprList(id);
  const documentsQuery = projectApi.useDocuments(id);
  const [section, setSection] = useState<Section>("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const project = useMemo(
    () => extractRecord<Project & Record<string, unknown>>(detailQuery.data),
    [detailQuery.data],
  );
  const financials = useMemo(
    () => extractRecord<ProjectFinancials>(financialsQuery.data),
    [financialsQuery.data],
  );
  const reports = useMemo(
    () => extractRecords<DailyProgressReport>(dprQuery.data),
    [dprQuery.data],
  );
  const documents = useMemo(
    () => extractRecords<ProjectDocument>(documentsQuery.data),
    [documentsQuery.data],
  );

  const createSite = projectApi.useCreateSite();
  const deleteSite = projectApi.useDeleteSite();
  const createBoq = projectApi.useCreateBoq();
  const updateBoq = projectApi.useUpdateBoq();
  const deleteBoq = projectApi.useDeleteBoq();
  const createMilestone = projectApi.useCreateMilestone();
  const updateMilestone = projectApi.useUpdateMilestone();
  const deleteMilestone = projectApi.useDeleteMilestone();
  const createTask = projectApi.useCreateTask();
  const updateTask = projectApi.useUpdateTask();
  const deleteTask = projectApi.useDeleteTask();
  const createDpr = projectApi.useCreateDpr();
  const createDocument = projectApi.useCreateDocument();
  const deleteDocument = projectApi.useDeleteDocument();

  if (detailQuery.isLoading) {
    return <div className="altrex-table-state">Loading project...</div>;
  }
  if (detailQuery.error) return <MutationError error={detailQuery.error} />;
  if (!project) {
    return (
      <div className="altrex-table-state">
        <p>Project data was not returned by the API.</p>
        <Link
          href="/projects"
          className="altrex-button altrex-button-secondary"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const projectRecord = project as Record<string, unknown>;
  const rowsFor = (target: Section) => {
    if (target === "reports") {
      return reports as unknown as Record<string, unknown>[];
    }
    if (target === "documents") {
      return documents as unknown as Record<string, unknown>[];
    }
    return childRows(projectRecord, sectionKeys[target] ?? []);
  };
  const rows = rowsFor(section);

  const saveRecord = (values: Record<string, unknown>) => {
    const idValue = (record: Record<string, unknown>) =>
      recordId(record, idKeys[section] ?? []);
    const childId = editing ? idValue(editing) : undefined;
    const callbacks = { onSuccess: () => setDialogOpen(false) };

    switch (section) {
      case "sites":
        if (childId != null) return;
        createSite.mutate({ id, body: values }, callbacks);
        break;
      case "boq":
        if (childId != null) {
          updateBoq.mutate({ id, childId, body: values }, callbacks);
        } else {
          createBoq.mutate({ id, body: values }, callbacks);
        }
        break;
      case "milestones":
        if (childId != null) {
          updateMilestone.mutate({ id, childId, body: values }, callbacks);
        } else {
          createMilestone.mutate({ id, body: values }, callbacks);
        }
        break;
      case "tasks":
        if (childId != null) {
          updateTask.mutate({ id, childId, body: values }, callbacks);
        } else {
          createTask.mutate({ id, body: values }, callbacks);
        }
        break;
      case "reports":
        createDpr.mutate({ id, body: values }, callbacks);
        break;
      case "documents":
        createDocument.mutate({ id, body: values }, callbacks);
        break;
      default:
        break;
    }
  };

  const isSaving = [
    createSite,
    createBoq,
    updateBoq,
    createMilestone,
    updateMilestone,
    createTask,
    updateTask,
    createDpr,
    createDocument,
  ].some((mutation) => mutation.isPending);
  const errors = [
    createSite.error,
    deleteSite.error,
    createBoq.error,
    updateBoq.error,
    deleteBoq.error,
    createMilestone.error,
    updateMilestone.error,
    deleteMilestone.error,
    createTask.error,
    updateTask.error,
    deleteTask.error,
    createDpr.error,
    createDocument.error,
    deleteDocument.error,
  ].filter(Boolean);
  const costs = childRows(projectRecord, costKeys);

  const remove = (record: Record<string, unknown>) => {
    const childId = recordId(record, idKeys[section] ?? []);
    if (childId == null || !window.confirm("Delete this record?")) return;
    if (section === "sites") deleteSite.mutate({ id, childId });
    if (section === "boq") deleteBoq.mutate({ id, childId });
    if (section === "milestones") deleteMilestone.mutate({ id, childId });
    if (section === "tasks") deleteTask.mutate({ id, childId });
    if (section === "documents") deleteDocument.mutate({ id, childId });
  };

  const editable = ["boq", "milestones", "tasks"].includes(section);
  const deletable = [
    "sites",
    "boq",
    "milestones",
    "tasks",
    "documents",
  ].includes(section);
  const allowCreate = sectionFields[section] != null;
  const activeFields = sectionFields[section] ?? [];

  return (
    <div>
      <div className="altrex-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/projects"
            className="altrex-icon-button"
            aria-label="Back to projects"
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <span className="altrex-eyebrow">
              {project.project_code ?? `Project #${project.project_id ?? id}`}
            </span>
            <h1>{project.project_name}</h1>
            <p>
              {project.party_name ?? "Customer not provided"} ·{" "}
              {String(project.status).replaceAll("_", " ")}
            </p>
          </div>
        </div>
        <Link
          href="/procurement/site-issues"
          className="altrex-button altrex-button-secondary"
        >
          View site issues
        </Link>
      </div>

      {errors.map((error) => (
        <MutationError error={error} key={errorMessage(error)} />
      ))}

      <nav
        aria-label="Project sections"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {(Object.keys(sectionLabels) as Section[]).map((key) => (
          <Button
            key={key}
            variant={section === key ? "default" : "outline"}
            onClick={() => setSection(key)}
          >
            {sectionLabels[key]}
          </Button>
        ))}
      </nav>

      {section === "overview" ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {[
              [
                "Contract value",
                financials?.contract_value ?? project.contract_value,
              ],
              [
                "Estimated cost",
                financials?.estimated_cost ?? project.estimated_cost,
              ],
              ["Actual cost", financials?.actual_cost ?? project.actual_cost],
              ["Cost variance", financials?.cost_variance],
              ["Billed amount", financials?.billed_amount],
              ["Received amount", financials?.received_amount],
              ["Outstanding", financials?.outstanding_amount],
              ["Expected profit", financials?.expected_profit],
              ["Current profit", financials?.current_profit],
            ].map(([label, amount]) => (
              <div className="altrex-card" key={String(label)}>
                <span className="altrex-eyebrow">{label}</span>
                <strong style={{ display: "block", fontSize: 20 }}>
                  {amount == null ? "—" : currency(amount)}
                </strong>
              </div>
            ))}
          </div>
          {financialsQuery.error && (
            <MutationError error={financialsQuery.error} />
          )}
          <section className="altrex-card">
            <h2>Project summary</h2>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "10px 24px",
              }}
            >
              <div>
                <dt>Location</dt>
                <dd>{project.project_location || "—"}</dd>
              </div>
              <div>
                <dt>Site address</dt>
                <dd>{project.site_address || "—"}</dd>
              </div>
              <div>
                <dt>Contract</dt>
                <dd>{project.contract_no || "—"}</dd>
              </div>
              <div>
                <dt>Customer PO</dt>
                <dd>{project.customer_po_no || "—"}</dd>
              </div>
              <div>
                <dt>Start date</dt>
                <dd>{project.start_date || "—"}</dd>
              </div>
              <div>
                <dt>Planned finish</dt>
                <dd>{project.planned_end_date || "—"}</dd>
              </div>
              <div>
                <dt>Progress</dt>
                <dd>
                  {Number(
                    project.progress_percent ??
                      financials?.progress_percent ??
                      0,
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt>Sales order</dt>
                <dd>{project.sales_order_id ?? "—"}</dd>
              </div>
            </dl>
            {project.description && <p>{project.description}</p>}
            {project.notes && <p>{project.notes}</p>}
          </section>
        </>
      ) : (
        <section className="altrex-card">
          <div className="altrex-page-header" style={{ marginBottom: 12 }}>
            <div>
              <h2>{sectionLabels[section]}</h2>
              {section === "boq" && <p>Budget categories</p>}
            </div>
            {allowCreate && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus size={15} /> Add
              </Button>
            )}
          </div>
          {section === "boq" && costs.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {costs.map((cost, index) => (
                <div
                  className="altrex-stat-card"
                  key={String(cost.id ?? index)}
                >
                  <strong>{String(cost.category ?? "Cost")}</strong>
                  <div>Budget: {currency(cost.budget_amount)}</div>
                  <div>Actual: {currency(cost.actual_amount)}</div>
                </div>
              ))}
            </div>
          )}
          {["reports", "documents"].some((key) => key === section) &&
            (section === "reports"
              ? dprQuery.isLoading
              : documentsQuery.isLoading) && (
              <div className="altrex-table-state">
                Loading {sectionLabels[section].toLowerCase()}...
              </div>
            )}
          {section === "reports" && dprQuery.error && (
            <MutationError error={dprQuery.error} />
          )}
          {section === "documents" && documentsQuery.error && (
            <MutationError error={documentsQuery.error} />
          )}
          <div className="altrex-table-wrap">
            <table className="altrex-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Details</th>
                  <th>Status / Amount</th>
                  {(editable || deletable) && <th aria-label="Actions" />}
                </tr>
              </thead>
              <tbody>
                {rows.map((record, index) => {
                  const childId = recordId(record, idKeys[section] ?? []);
                  const displayEntries = Object.entries(record)
                    .filter(
                      ([key, value]) =>
                        !idKeys[section]?.includes(key) &&
                        value !== null &&
                        typeof value !== "object",
                    )
                    .slice(0, 4);
                  return (
                    <tr key={childId ?? `${section}-${index}`}>
                      <td>
                        <strong>{titleOf(record, section)}</strong>
                      </td>
                      <td>
                        {displayEntries.map(([key, value]) => (
                          <span key={key} style={{ display: "block" }}>
                            {key.replaceAll("_", " ")}: {String(value)}
                          </span>
                        ))}
                      </td>
                      <td>
                        {String(
                          record.status ??
                            record.payment_amount ??
                            record.quantity ??
                            "—",
                        )}
                      </td>
                      {(editable || deletable) && (
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {editable && (
                              <Button
                                variant="outline"
                                aria-label={`Edit ${titleOf(record, section)}`}
                                onClick={() => {
                                  setEditing(record);
                                  setDialogOpen(true);
                                }}
                              >
                                <Pencil size={14} />
                              </Button>
                            )}
                            {deletable && (
                              <Button
                                variant="outline"
                                aria-label={`Delete ${titleOf(record, section)}`}
                                onClick={() => remove(record)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={editable || deletable ? 4 : 3}
                      style={{ textAlign: "center", padding: 24 }}
                    >
                      No {sectionLabels[section].toLowerCase()} have been added.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {dialogOpen && (
        <EntityFormDialog
          title={`${editing ? "Update" : "Add"} ${sectionLabels[section]}`}
          fields={activeFields}
          initialValues={editing ?? undefined}
          isPending={isSaving}
          onClose={() => setDialogOpen(false)}
          onSubmit={saveRecord}
        />
      )}
    </div>
  );
}
