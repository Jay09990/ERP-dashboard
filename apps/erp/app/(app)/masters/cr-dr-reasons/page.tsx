"use client";

import { crDrReasonApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function CrDrReasonsPage() {
  return (
    <MasterListModal
      title="Cr / Dr Reasons"
      subtitle="Define credit and debit note reasons shown in adjustment document dropdowns."
      eyebrow="Tax & Measurement"
      idField="reason_id"
      columns={[
        { key: "reason_name", label: "Reason" },
        {
          key: "form_type",
          label: "Type",
          render: (r: any) => {
            const val = String(r.form_type ?? r.type ?? r.reason_type ?? "both").toUpperCase();
            return (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: val === "CREDIT" ? "rgba(16, 185, 129, 0.12)" : val === "DEBIT" ? "rgba(239, 68, 68, 0.12)" : "rgba(99, 102, 241, 0.12)",
                  color: val === "CREDIT" ? "#10b981" : val === "DEBIT" ? "#ef4444" : "#6366f1",
                }}
              >
                {val}
              </span>
            );
          },
        },
        {
          key: "status",
          label: "Status",
          render: (r: any) => {
            const val = String(r.status ?? "active").toUpperCase();
            return (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: val === "ACTIVE" ? "rgba(16, 185, 129, 0.12)" : "rgba(107, 114, 128, 0.12)",
                  color: val === "ACTIVE" ? "#10b981" : "#6b7280",
                }}
              >
                {val}
              </span>
            );
          },
        },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "reason_name", label: "Reason Name", required: true, placeholder: "e.g. Goods returned, Rate difference" },
        {
          name: "form_type",
          label: "Reason Type",
          type: "select",
          required: true,
          options: [
            { label: "Credit", value: "credit" },
            { label: "Debit", value: "debit" },
            { label: "Both", value: "both" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
        { name: "description", label: "Description", placeholder: "Optional short description" },
      ]}
      useList={crDrReasonApi.useList}
      useCreate={crDrReasonApi.useCreate}
      useUpdate={crDrReasonApi.useUpdate}
      useDelete={crDrReasonApi.useDelete}
    />
  );
}

