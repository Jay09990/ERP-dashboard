"use client";

import { procurementApi, projectApi } from "@/features/projects/api";
import {
  type ReferenceOption,
  useProcurementLookups,
} from "@/features/projects/lookups";
import type {
  GoodsReceipt,
  PurchaseRequisition,
  SiteIssue,
} from "@/features/projects/schema";
import { Button, LoadingState } from "@altrex/ui";
import { Eye, Plus, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  EntityFormDialog,
  type FieldDefinition,
  MutationError,
  extractRecord,
  extractRecords,
  recordId,
} from "./ProjectUi";

type ProcurementKind = "requisition" | "grn" | "site-issue";

const configurations: Record<
  ProcurementKind,
  {
    title: string;
    description: string;
    collectionLabel: string;
    createFields: FieldDefinition[];
    idKeys: string[];
    numberKeys: string[];
  }
> = {
  requisition: {
    title: "Purchase Requisitions",
    description: "Request and approve materials needed for project work.",
    collectionLabel: "Requisition",
    idKeys: ["requisition_id", "purchase_requisition_id", "id"],
    numberKeys: ["requisition_no", "requisition_number"],
    createFields: [
      {
        name: "project_id",
        label: "Project",
        type: "reference",
        required: true,
      },
      {
        name: "requisition_date",
        label: "Requisition date",
        type: "date",
        required: true,
      },
      { name: "required_by", label: "Required by", type: "date" },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "itemsDetails",
        label: "Requested items",
        type: "collection",
        required: true,
        itemFields: [
          {
            name: "item_id",
            label: "Item",
            type: "reference",
            required: true,
          },
          { name: "description", label: "Item description" },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
          },
          { name: "unit_id", label: "Unit", type: "reference" },
          { name: "notes", label: "Notes" },
        ],
      },
    ],
  },
  grn: {
    title: "Goods Receipts (GRN)",
    description: "Record goods received against a purchase order.",
    collectionLabel: "GRN",
    idKeys: ["grn_id", "goods_receipt_id", "id"],
    numberKeys: ["grn_no", "grn_number"],
    createFields: [
      {
        name: "purchase_order_id",
        label: "Purchase order",
        type: "reference",
        required: true,
      },
      {
        name: "warehouse_id",
        label: "Warehouse",
        type: "reference",
        required: true,
      },
      { name: "grn_date", label: "Receipt date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "itemsDetails",
        label: "Received items",
        type: "collection",
        required: true,
        itemFields: [
          {
            name: "purchase_order_item_id",
            label: "Purchase order line ID",
            type: "number",
          },
          {
            name: "item_id",
            label: "Item",
            type: "reference",
            required: true,
          },
          { name: "batch_id", label: "Batch", type: "reference" },
          {
            name: "quantity",
            label: "Received quantity",
            type: "number",
            required: true,
          },
          { name: "unit_id", label: "Unit", type: "reference" },
          { name: "rate", label: "Rate per unit", type: "number" },
        ],
      },
    ],
  },
  "site-issue": {
    title: "Project Site Issues",
    description: "Issue available warehouse stock to approved project sites.",
    collectionLabel: "Site issue",
    idKeys: ["issue_id", "site_issue_id", "id"],
    numberKeys: ["issue_no", "issue_number"],
    createFields: [
      {
        name: "project_id",
        label: "Project",
        type: "reference",
        required: true,
      },
      {
        name: "site_id",
        label: "Project site",
        type: "reference",
        referenceSource: "project-sites",
        required: true,
      },
      {
        name: "warehouse_id",
        label: "Warehouse",
        type: "reference",
        required: true,
      },
      { name: "issue_date", label: "Issue date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "itemsDetails",
        label: "Items to issue",
        type: "collection",
        required: true,
        itemFields: [
          {
            name: "item_id",
            label: "Item",
            type: "reference",
            required: true,
          },
          { name: "batch_id", label: "Batch", type: "reference" },
          {
            name: "quantity",
            label: "Quantity",
            type: "number",
            required: true,
          },
          { name: "unit_id", label: "Unit", type: "reference" },
          {
            name: "boq_item_id",
            label: "Project BOQ item",
            type: "reference",
            referenceSource: "project-boq",
          },
        ],
      },
    ],
  },
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const detailLabels: Record<string, string> = {
  project_id: "Project reference",
  site_id: "Project site reference",
  warehouse_id: "Warehouse reference",
  purchase_order_id: "Purchase order reference",
  requisition_date: "Request date",
  required_by: "Needed by",
  grn_date: "Receipt date",
  issue_date: "Issue date",
  itemsDetails: "Items",
};

// Module-scoped Intl formatter to avoid ICU locale initialization and GC churn on every render
const mediumDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});

function displayValue(key: string, value: unknown): string {
  if (value == null || value === "") return "Not provided";
  if (key.endsWith("_date") && typeof value === "string") {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : mediumDateFormatter.format(date);
  }
  if (key === "status" && typeof value === "string") return formatLabel(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function dateLabel(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : mediumDateFormatter.format(date);
}

function itemLabel(key: string) {
  const labels: Record<string, string> = {
    item_id: "Item reference",
    quantity: "Quantity",
    rate: "Rate per unit",
  };
  return labels[key] ?? formatLabel(key);
}

function projectReferenceOptions(
  project: Record<string, unknown> | null,
  collectionKeys: string[],
  idKeys: string[],
  labelKeys: string[],
): ReferenceOption[] {
  const collection = collectionKeys
    .map((key) => project?.[key])
    .find(Array.isArray);
  return extractRecords<Record<string, unknown>>(collection).flatMap((row) => {
    const id = recordId(row, idKeys);
    if (id == null) return [];
    const label =
      labelKeys
        .map((key) => row[key])
        .find(
          (value) => typeof value === "string" || typeof value === "number",
        ) ?? "Record";
    return [{ value: String(id), label: `${String(label)} (#${id})` }];
  });
}

function DetailItems({ items }: { items: unknown[] }) {
  const rows = items.filter((item): item is Record<string, unknown> =>
    Boolean(item && typeof item === "object" && !Array.isArray(item)),
  );
  if (!rows.length) return <p>No item details are available.</p>;
  const columns = Object.keys(rows[0]).filter(
    (key) =>
      ![
        "purchase_order_item_id",
        "batch_id",
        "unit_id",
        "boq_item_id",
      ].includes(key),
  );
  return (
    <div className="altrex-table-wrap">
      <table className="altrex-table">
        <thead>
          <tr>
            {columns.map((key) => (
              <th key={key}>{itemLabel(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.item_id ?? index)}>
              {columns.map((key) => (
                <td key={key}>{displayValue(key, row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProcurementList({ kind }: { kind: ProcurementKind }) {
  const config = configurations[kind];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const selectedProjectQuery = projectApi.useDetail(selectedProjectId || null);
  const requisitionsQuery = procurementApi.useRequisitions(
    kind === "requisition",
  );
  const grnsQuery = procurementApi.useGrns(kind === "grn");
  const siteIssuesQuery = procurementApi.useSiteIssues(kind === "site-issue");
  const lookups = useProcurementLookups(dialogOpen, kind);
  const selectedProject = extractRecord<Record<string, unknown>>(
    selectedProjectQuery.data,
  );
  const fieldOptions = {
    ...lookups.options,
    site_id: projectReferenceOptions(
      selectedProject,
      ["sites", "project_sites", "tbl_project_sites"],
      ["site_id", "project_site_id", "id"],
      ["site_name", "address_line1"],
    ),
    boq_item_id: projectReferenceOptions(
      selectedProject,
      ["boqItems", "boq_items", "project_boq_items"],
      ["boq_item_id", "project_boq_item_id", "boq_id", "id"],
      ["description", "item_name"],
    ),
  };
  const requisitionDetail = procurementApi.useRequisition(
    kind === "requisition" ? detailId : null,
  );
  const grnDetail = procurementApi.useGrn(kind === "grn" ? detailId : null);
  const siteIssueDetail = procurementApi.useSiteIssue(
    kind === "site-issue" ? detailId : null,
  );
  const createRequisition = procurementApi.useCreateRequisition();
  const updateRequisitionStatus = procurementApi.useUpdateRequisitionStatus();
  const createGrn = procurementApi.useCreateGrn();
  const updateGrnStatus = procurementApi.useUpdateGrnStatus();
  const createSiteIssue = procurementApi.useCreateSiteIssue();
  const updateSiteIssueStatus = procurementApi.useUpdateSiteIssueStatus();

  const activeQuery =
    kind === "requisition"
      ? requisitionsQuery
      : kind === "grn"
        ? grnsQuery
        : siteIssuesQuery;
  const records = useMemo(() => {
    if (kind === "requisition") {
      return extractRecords<PurchaseRequisition>(activeQuery.data);
    }
    if (kind === "grn") return extractRecords<GoodsReceipt>(activeQuery.data);
    return extractRecords<SiteIssue>(activeQuery.data);
  }, [activeQuery.data, kind]);

  const detailQuery =
    kind === "requisition"
      ? requisitionDetail
      : kind === "grn"
        ? grnDetail
        : siteIssueDetail;
  const detail = extractRecord(detailQuery.data);
  const createPending =
    createRequisition.isPending ||
    createGrn.isPending ||
    createSiteIssue.isPending;
  const createError =
    createRequisition.error || createGrn.error || createSiteIssue.error;
  const workflowError =
    updateRequisitionStatus.error ||
    updateGrnStatus.error ||
    updateSiteIssueStatus.error;

  const submit = (body: Record<string, unknown>) => {
    const onSuccess = () => setDialogOpen(false);
    if (kind === "requisition") {
      createRequisition.mutate({ body }, { onSuccess });
    } else if (kind === "grn") {
      createGrn.mutate({ body }, { onSuccess });
    } else {
      createSiteIssue.mutate({ body }, { onSuccess });
    }
  };

  const updateStatus = (
    id: string | number,
    status: "approved" | "cancelled",
  ) => {
    if (
      status === "approved" &&
      (kind === "grn" || kind === "site-issue") &&
      !window.confirm(
        kind === "grn"
          ? "Approve this GRN and post received quantities into stock?"
          : "Approve this site issue and deduct the issued quantities from stock?",
      )
    ) {
      return;
    }
    if (kind === "requisition") {
      updateRequisitionStatus.mutate({ id, status });
    } else if (kind === "grn") {
      updateGrnStatus.mutate({ id, status });
    } else {
      updateSiteIssueStatus.mutate({ id, status });
    }
  };

  return (
    <div>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Project procurement</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={() => activeQuery.refetch()}>
            <RefreshCw size={15} /> Refresh
          </Button>
          <Button
            onClick={() => {
              setSelectedProjectId("");
              setDialogOpen(true);
            }}
          >
            <Plus size={15} /> New {config.collectionLabel}
          </Button>
        </div>
      </div>
      {kind === "site-issue" && (
        <div className="altrex-card" style={{ marginBottom: 16 }}>
          Site issues require an approved or in-progress project, a site
          assigned to that project, an active warehouse and item, and enough
          available stock. These validations are enforced by the API when the
          issue is created.
        </div>
      )}

      <MutationError error={activeQuery.error} />
      <MutationError error={createError} />
      <MutationError error={workflowError} />

      {activeQuery.isLoading ? (
        <LoadingState
          message={`Loading ${config.collectionLabel.toLowerCase()} records...`}
        />
      ) : (
        <section className="altrex-card altrex-table-wrap">
          <table className="altrex-table">
            <thead>
              <tr>
                <th>{config.collectionLabel}</th>
                <th>Project / Warehouse</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const row = record as unknown as Record<string, unknown>;
                const id = recordId(row, config.idKeys);
                const status = String(row.status ?? "draft").toLowerCase();
                const canApprove = status === "draft";
                const canCancel = status === "draft" || status === "approved";
                const number = config.numberKeys
                  .map((key) => row[key])
                  .find((value) => value != null);
                const date =
                  row.requisition_date ?? row.grn_date ?? row.issue_date;
                const items = Array.isArray(row.itemsDetails)
                  ? row.itemsDetails.length
                  : 0;
                const projectOrWarehouse =
                  row.project_name ??
                  (row.project_id == null
                    ? undefined
                    : `Project #${row.project_id}`) ??
                  row.warehouse_name ??
                  (row.warehouse_id == null
                    ? undefined
                    : `Warehouse #${row.warehouse_id}`) ??
                  "—";
                return (
                  <tr key={id ?? String(number ?? date)}>
                    <td>
                      <strong>
                        {String(
                          number ?? `${config.collectionLabel} #${id ?? "—"}`,
                        )}
                      </strong>
                    </td>
                    <td>{String(projectOrWarehouse)}</td>
                    <td>{dateLabel(date)}</td>
                    <td>{items}</td>
                    <td>{formatLabel(status)}</td>
                    <td>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {id != null && (
                          <Button
                            variant="outline"
                            aria-label={`View ${config.collectionLabel}`}
                            onClick={() => setDetailId(id)}
                          >
                            <Eye size={14} /> View
                          </Button>
                        )}
                        {id != null && canApprove && (
                          <Button
                            disabled={
                              updateRequisitionStatus.isPending ||
                              updateGrnStatus.isPending ||
                              updateSiteIssueStatus.isPending
                            }
                            onClick={() => updateStatus(id, "approved")}
                          >
                            Approve
                          </Button>
                        )}
                        {id != null && canCancel && (
                          <Button
                            variant="outline"
                            disabled={
                              updateRequisitionStatus.isPending ||
                              updateGrnStatus.isPending ||
                              updateSiteIssueStatus.isPending
                            }
                            onClick={() => updateStatus(id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 28 }}>
                    No {config.title.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {dialogOpen && (
        <EntityFormDialog
          title={`Create ${config.collectionLabel}`}
          fields={config.createFields}
          fieldOptions={fieldOptions}
          lookupLoading={lookups.isLoading || selectedProjectQuery.isLoading}
          lookupError={lookups.error ?? selectedProjectQuery.error}
          onFieldChange={(name, value) => {
            if (kind === "site-issue" && name === "project_id") {
              setSelectedProjectId(value);
            }
          }}
          isPending={createPending}
          onClose={() => setDialogOpen(false)}
          onSubmit={submit}
        />
      )}

      {detailId != null && (
        <div
          className="altrex-dialog-backdrop"
          onMouseDown={() => setDetailId(null)}
        >
          <dialog
            open
            className="altrex-dialog altrex-dialog-lg"
            aria-modal="true"
            aria-labelledby="procurement-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
            style={{ position: "relative", margin: 0 }}
          >
            <header className="altrex-dialog-header">
              <h2 className="altrex-dialog-title" id="procurement-detail-title">
                {config.collectionLabel} details
              </h2>
              <button
                type="button"
                className="altrex-icon-button"
                onClick={() => setDetailId(null)}
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </header>
            <div className="altrex-dialog-body">
              {detailQuery.isLoading ? (
                <LoadingState
                  message={`Loading ${config.collectionLabel.toLowerCase()} details...`}
                />
              ) : detailQuery.error ? (
                <MutationError error={detailQuery.error} />
              ) : (
                <div>
                  {detail && typeof detail === "object" ? (
                    <>
                      <dl
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 14,
                          margin: 0,
                        }}
                      >
                        {Object.entries(detail as Record<string, unknown>)
                          .filter(
                            ([key, value]) =>
                              key !== "itemsDetails" &&
                              !["success", "message"].includes(key) &&
                              (value == null || typeof value !== "object"),
                          )
                          .map(([key, value]) => (
                            <div key={key} className="altrex-stat-card">
                              <dt
                                style={{
                                  color: "var(--altrex-muted)",
                                  fontSize: 12,
                                }}
                              >
                                {detailLabels[key] ?? formatLabel(key)}
                              </dt>
                              <dd
                                style={{ margin: "6px 0 0", fontWeight: 600 }}
                              >
                                {displayValue(key, value)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                      {Array.isArray(
                        (detail as Record<string, unknown>).itemsDetails,
                      ) && (
                        <section style={{ marginTop: 20 }}>
                          <h3>Items</h3>
                          <DetailItems
                            items={
                              (detail as Record<string, unknown>)
                                .itemsDetails as unknown[]
                            }
                          />
                        </section>
                      )}
                    </>
                  ) : (
                    <p>Details are not available.</p>
                  )}
                </div>
              )}
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
