"use client";

import { purchaseOrderApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function PurchaseOrdersPage() {
  return (
    <DocumentList
      docType="purchase_order"
      title="Purchase Orders"
      subtitle="Issue vendor purchase orders, track procurement lines and delivery due dates."
      eyebrow="Procurement Module"
      useList={purchaseOrderApi.useList}
      useCreate={purchaseOrderApi.useCreate}
      useUpdate={purchaseOrderApi.useUpdate}
      useDelete={purchaseOrderApi.useDelete}
    />
  );
}
