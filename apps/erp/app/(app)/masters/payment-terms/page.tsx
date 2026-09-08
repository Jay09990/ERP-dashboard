"use client";

import { paymentTermsApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function PaymentTermsPage() {
  return (
    <MasterListModal
      title="Payment Terms"
      subtitle="Define payment terms and due day periods for sales and purchase orders."
      eyebrow="Financial Master"
      idField="payment_term_id"
      columns={[
        { key: "term_name", label: "Term Name" },
        { key: "due_days", label: "Due Days", render: (r: any) => `${r.due_days} Days` },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "term_name", label: "Term Name", required: true, placeholder: "e.g. Net 30 Days, Immediate Payment" },
        { name: "due_days", label: "Due Days", type: "number", required: true, placeholder: "30" },
        { name: "description", label: "Description", placeholder: "e.g. Payment due 30 days post invoice" },
      ]}
      useList={paymentTermsApi.useList}
      useCreate={paymentTermsApi.useCreate}
      useUpdate={paymentTermsApi.useUpdate}
      useDelete={paymentTermsApi.useDelete}
    />
  );
}
