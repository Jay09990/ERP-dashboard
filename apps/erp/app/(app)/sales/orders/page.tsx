"use client";

import { salesOrderApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function SalesOrdersPage() {
  return (
    <DocumentList
      docType="sales_order"
      title="Sales Orders"
      subtitle="Manage confirmed customer sales orders, delivery dates, and PO numbers."
      eyebrow="Sales Module"
      useList={salesOrderApi.useList}
      useCreate={salesOrderApi.useCreate}
      useUpdate={salesOrderApi.useUpdate}
      useDelete={salesOrderApi.useDelete}
    />
  );
}
