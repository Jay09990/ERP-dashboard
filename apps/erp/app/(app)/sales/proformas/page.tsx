"use client";

import { proformaApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function ProformasPage() {
  return (
    <DocumentList
      docType="proforma"
      title="Proforma Invoices"
      subtitle="Issue proforma invoices for advance payment requests and commitments."
      eyebrow="Sales Module"
      useList={proformaApi.useList}
      useCreate={proformaApi.useCreate}
      useUpdate={proformaApi.useUpdate}
      useDelete={proformaApi.useDelete}
    />
  );
}
