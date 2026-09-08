"use client";

import { invoiceApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function SalesInvoicesPage() {
  return (
    <DocumentList
      docType="sales_invoice"
      title="Sales Invoices"
      subtitle="Generate, send, and audit final tax invoices and billing statements."
      eyebrow="Sales Module"
      useList={invoiceApi.useList}
      useCreate={invoiceApi.useCreate}
      useUpdate={invoiceApi.useUpdate}
      useDelete={invoiceApi.useDelete}
    />
  );
}
