"use client";

import { procurementApi } from "@/features/projects/api";
import type {
  GoodsReceipt,
  PurchaseRequisition,
  SiteIssue,
} from "@/features/projects/schema";
import { Button } from "@altrex/ui";
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
        label: "Project ID",
        type: "number",
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
        label: "Items (JSON array)",
        type: "json",
        required: true,
        placeholder:
          '[{"item_id":2,"description":"Cement OPC 53 Grade","quantity":100,"unit_id":1,"notes":"For foundation"}]',
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
        label: "Purchase order ID",
        type: "number",
        required: true,
      },
      {
        name: "warehouse_id",
        label: "Warehouse ID",
        type: "number",
        required: true,
      },
      { name: "grn_date", label: "Receipt date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "itemsDetails",
        label: "Received items (JSON array)",
        type: "json",
        required: true,
        placeholder:
          '[{"purchase_order_item_id":1,"item_id":2,"batch_id":null,"quantity":50,"unit_id":1,"rate":350}]',
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
        label: "Project ID",
        type: "number",
        required: true,
      },
      {
        name: "site_id",
        label: "Project site ID",
        type: "number",
        required: true,
      },
      {
        name: "warehouse_id",
        label: "Warehouse ID",
        type: "number",
        required: true,
      },
      { name: "issue_date", label: "Issue date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "itemsDetails",
        label: "Issued items (JSON array)",
        type: "json",
        required: true,
        placeholder:
          '[{"item_id":2,"batch_id":null,"quantity":20,"unit_id":1,"boq_item_id":4}]',
      },
    ],
  },
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ProcurementList({ kind }: { kind: ProcurementKind }) {
  const config = configurations[kind];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | number | null>(null);
  const requisitionsQuery = procurementApi.useRequisitions();
  const grnsQuery = procurementApi.useGrns();
  const siteIssuesQuery = procurementApi.useSiteIssues();
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
          <Button onClick={() => setDialogOpen(true)}>
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
        <div className="altrex-table-state">Loading records...</div>
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
                  row.requisition_date ?? row.grn_date ?? row.issue_date ?? "—";
                const items = Array.isArray(row.itemsDetails)
                  ? row.itemsDetails.length
                  : 0;
                const projectOrWarehouse =
                  row.project_name ??
                  row.project_id ??
                  row.warehouse_name ??
                  row.warehouse_id ??
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
                    <td>{String(date)}</td>
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
                <div className="altrex-table-state">Loading details...</div>
              ) : detailQuery.error ? (
                <MutationError error={detailQuery.error} />
              ) : (
                <pre
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {JSON.stringify(detail ?? {}, null, 2)}
                </pre>
              )}
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
