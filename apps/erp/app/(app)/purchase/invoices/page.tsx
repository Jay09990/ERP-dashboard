"use client";

import { purchaseInvoiceApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function PurchaseInvoicesPage() {
  return (
    <DocumentList
      docType="purchase_invoice"
      title="Purchase Invoices"
      subtitle="Record vendor invoices, track accounts payable line items, and tax entries."
      eyebrow="Procurement Module"
      useList={purchaseInvoiceApi.useList}
      useCreate={purchaseInvoiceApi.useCreate}
      useUpdate={purchaseInvoiceApi.useUpdate}
      useDelete={purchaseInvoiceApi.useDelete}
    />
  );
}
