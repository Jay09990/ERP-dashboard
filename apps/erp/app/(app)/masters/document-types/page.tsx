"use client";

import { documentTypeApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function DocumentTypesPage() {
  return (
    <MasterListModal
      title="Document Types"
      subtitle="Register document categories used by document series and numbering."
      eyebrow="Document Numbering"
      idField="doc_type_id"
      columns={[{ key: "document_type_name", label: "Type Name" }]}
      fields={[
        {
          name: "document_type_name",
          label: "Type Name",
          required: true,
          placeholder: "e.g. Invoice, Quotation, Sales Order",
        },
      ]}
      useList={documentTypeApi.useList}
      useCreate={documentTypeApi.useCreate}
      useUpdate={documentTypeApi.useUpdate}
      useDelete={documentTypeApi.useDelete}
    />
  );
}
