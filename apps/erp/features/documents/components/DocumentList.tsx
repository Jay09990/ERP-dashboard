"use client";

import { Button, DataTable, FilterBar } from "@altrex/ui";
import { CheckCircle, Clock, FileText, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentForm, type DocumentType } from "./DocumentForm";

interface DocumentListProps {
  docType: DocumentType;
  title: string;
  subtitle: string;
  eyebrow?: string;
  useList: () => { data?: any; isLoading: boolean; error: any };
  useCreate: () => { mutate: (body: any, opts?: any) => void; isPending: boolean };
  useUpdate: () => { mutate: (args: { id: string; body: any }, opts?: any) => void; isPending: boolean };
  useDelete: () => { mutate: (id: string, opts?: any) => void; isPending: boolean };
}

export function DocumentList({
  docType,
  title,
  subtitle,
  eyebrow = "Commercial Document",
  useList,
  useCreate,
  useUpdate,
  useDelete,
}: DocumentListProps) {
  const [search, setSearch] = useState("");
  const [activeDoc, setActiveDoc] = useState<any | null>(null);
  const [isOpenForm, setIsOpenForm] = useState(false);

  const { data: responseData, isLoading, error } = useList();
  const docs: any[] = Array.isArray(responseData)
    ? responseData
    : responseData?.data ?? responseData?.items ?? [];

  const { mutate: createDoc, isPending: isCreating } = useCreate();
  const { mutate: updateDoc, isPending: isUpdating } = useUpdate();
  const { mutate: deleteDoc, isPending: isDeleting } = useDelete();

  const getId = (doc: any) =>
    doc.quotation_id ??
    doc.sales_order_id ??
    doc.proforma_id ??
    doc.delivery_challan_id ??
    doc.invoice_id ??
    doc.purchase_order_id ??
    doc.purchase_invoice_id ??
    doc.credit_note_id ??
    doc.debit_note_id ??
    doc.id;

  const filtered = useMemo(() => {
    if (!search.trim()) return docs;
    return docs.filter((d) =>
      Object.values(d).some((val) => val && String(val).toLowerCase().includes(search.toLowerCase())),
    );
  }, [docs, search]);

  const draftCount = docs.filter((d) => d.status === "draft").length;
  const approvedCount = docs.filter((d) => d.status === "approved" || d.status === "sent").length;

  const columns = [
    {
      key: "id" as any,
      label: "Document Ref",
      render: (d: any) => {
        const id = getId(d);
        const date =
          d.quotation_date ||
          d.sales_order_date ||
          d.proforma_date ||
          d.delivery_date ||
          d.invoice_date ||
          d.purchase_order_date ||
          d.credit_note_date ||
          d.debit_note_date ||
          d.created_at;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(37,99,235,0.1)",
                color: "var(--altrex-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              <FileText size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600, color: "var(--altrex-text)", fontSize: "14px" }}>
                #DOC-{id}
              </span>
              <span style={{ fontSize: "12px", color: "var(--altrex-muted)" }}>
                {date ? new Date(date).toLocaleDateString("en-IN") : "N/A"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status" as any,
      label: "Status",
      render: (d: any) => {
        const status = d.status || "draft";
        const isApproved = status === "approved" || status === "sent";
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              background: isApproved ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
              color: isApproved ? "#10b981" : "#f59e0b",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isApproved ? "#10b981" : "#f59e0b",
              }}
            />
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "action" as any,
      label: "Actions",
      render: (d: any) => {
        const id = getId(d)?.toString() ?? "";
        return (
          <div className="altrex-row-actions" style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="outline"
              onClick={() => {
                setActiveDoc(d);
                setIsOpenForm(true);
              }}
              style={{ fontSize: "12px", padding: "4px 10px" }}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm(`Are you sure you want to delete document #DOC-${id}?`)) {
                  deleteDoc(id);
                }
              }}
              disabled={isDeleting}
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

  const handleFormSubmit = (payload: any) => {
    if (activeDoc) {
      const id = getId(activeDoc).toString();
      updateDoc(
        { id, body: payload },
        {
          onSuccess: () => {
            setIsOpenForm(false);
            setActiveDoc(null);
          },
        },
      );
    } else {
      createDoc(payload, {
        onSuccess: () => {
          setIsOpenForm(false);
        },
      });
    }
  };

  const isSaving = isCreating || isUpdating;

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
        <Button
          onClick={() => {
            setActiveDoc(null);
            setIsOpenForm(true);
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} />
          Create New Document
        </Button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(37, 99, 235, 0.1)",
              color: "var(--altrex-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              TOTAL DOCUMENTS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {docs.length}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.1)",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              DRAFT DOCUMENTS
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {draftCount}
            </div>
          </div>
        </div>

        <div
          className="altrex-detail-card"
          style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--altrex-muted)", fontWeight: 600 }}>
              APPROVED / SENT
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
              {approvedCount}
            </div>
          </div>
        </div>
      </div>

      <FilterBar>
        <input
          className="altrex-input"
          placeholder="Search documents by reference, party, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "320px" }}
        />
      </FilterBar>

      {isLoading ? (
        <div className="altrex-table-state">
          <span className="altrex-spinner" />
          <span>Loading documents...</span>
        </div>
      ) : error ? (
        <div className="altrex-table-state altrex-table-state-error">
          Failed to load documents from backend server.
        </div>
      ) : (
        <DataTable
          columns={columns.map((c) => ({
            key: c.key,
            label: c.label,
            ...(c.render ? { render: c.render } : {}),
          }))}
          data={filtered}
          rowKey={(d, idx) => getId(d) ?? idx}
        />
      )}

      {isOpenForm && (
        <DocumentForm
          docType={docType}
          title={activeDoc ? `Edit ${title}` : `Create New ${title}`}
          subtitle={subtitle}
          initialData={activeDoc}
          onClose={() => {
            setIsOpenForm(false);
            setActiveDoc(null);
          }}
          onSubmit={handleFormSubmit}
          isSaving={isSaving}
        />
      )}
    </>
  );
}
