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
        { key: "reason_type", label: "Type" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "reason_name", label: "Reason Name", required: true, placeholder: "e.g. Goods returned, Rate difference" },
        {
          name: "reason_type",
          label: "Reason Type",
          type: "select",
          required: true,
          options: [
            { label: "Credit", value: "credit" },
            { label: "Debit", value: "debit" },
            { label: "Both", value: "both" },
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
