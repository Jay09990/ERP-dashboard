"use client";

import { bankApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function BanksPage() {
  return (
    <MasterListModal
      title="Bank Master"
      subtitle="Manage corporate bank accounts, IFSC codes, and branch details."
      eyebrow="Banking Master"
      idField="bank_id"
      columns={[
        { key: "bank_name", label: "Bank Name" },
        { key: "ifsc_code", label: "IFSC Code" },
        { key: "branch_name", label: "Branch Name" },
      ]}
      fields={[
        { name: "bank_name", label: "Bank Name", required: true, placeholder: "e.g. HDFC Bank, ICICI Bank" },
        { name: "ifsc_code", label: "IFSC Code", placeholder: "e.g. HDFC0001234" },
        { name: "branch_name", label: "Branch Name", placeholder: "e.g. Connaught Place Branch" },
      ]}
      useList={bankApi.useList}
      useCreate={bankApi.useCreate}
      useUpdate={bankApi.useUpdate}
      useDelete={bankApi.useDelete}
    />
  );
}
