"use client";

import { quotationApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function QuotationsPage() {
  return (
    <DocumentList
      docType="quotation"
      title="Sales Quotations"
      subtitle="Create, send, and track commercial price quotations for customers."
      eyebrow="Sales Module"
      useList={quotationApi.useList}
      useCreate={quotationApi.useCreate}
      useUpdate={quotationApi.useUpdate}
      useDelete={quotationApi.useDelete}
    />
  );
}
