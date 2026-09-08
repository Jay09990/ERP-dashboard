import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";

export function useDocumentResource<T, TCreate, TUpdate>(
  key: string,
  endpoint: string,
) {
  const qc = useQueryClient();
  const hooks = createResourceHooks<T, TCreate, TUpdate>(key, endpoint, apiClient, qc);

  return {
    useList: (params?: Record<string, string>) => hooks.useList(params),
    useDetail: (id: string) => hooks.useDetail(id),
    useCreate: () => hooks.useCreate(),
    useUpdate: () => hooks.useUpdate(),
    useDelete: () => hooks.useDelete(),
  };
}

export const quotationApi = {
  useList: (p?: any) => useDocumentResource("quotations", endpoints.documents.quotation).useList(p),
  useDetail: (id: string) => useDocumentResource("quotations", endpoints.documents.quotation).useDetail(id),
  useCreate: () => useDocumentResource("quotations", endpoints.documents.quotation).useCreate(),
  useUpdate: () => useDocumentResource("quotations", endpoints.documents.quotation).useUpdate(),
  useDelete: () => useDocumentResource("quotations", endpoints.documents.quotation).useDelete(),
};

export const salesOrderApi = {
  useList: (p?: any) => useDocumentResource("sales-orders", endpoints.documents.salesOrder).useList(p),
  useDetail: (id: string) => useDocumentResource("sales-orders", endpoints.documents.salesOrder).useDetail(id),
  useCreate: () => useDocumentResource("sales-orders", endpoints.documents.salesOrder).useCreate(),
  useUpdate: () => useDocumentResource("sales-orders", endpoints.documents.salesOrder).useUpdate(),
  useDelete: () => useDocumentResource("sales-orders", endpoints.documents.salesOrder).useDelete(),
};

export const proformaApi = {
  useList: (p?: any) => useDocumentResource("proformas", endpoints.documents.proforma).useList(p),
  useDetail: (id: string) => useDocumentResource("proformas", endpoints.documents.proforma).useDetail(id),
  useCreate: () => useDocumentResource("proformas", endpoints.documents.proforma).useCreate(),
  useUpdate: () => useDocumentResource("proformas", endpoints.documents.proforma).useUpdate(),
  useDelete: () => useDocumentResource("proformas", endpoints.documents.proforma).useDelete(),
};

export const deliveryChallanApi = {
  useList: (p?: any) => useDocumentResource("delivery-challans", endpoints.documents.deliveryChallan).useList(p),
  useDetail: (id: string) => useDocumentResource("delivery-challans", endpoints.documents.deliveryChallan).useDetail(id),
  useCreate: () => useDocumentResource("delivery-challans", endpoints.documents.deliveryChallan).useCreate(),
  useUpdate: () => useDocumentResource("delivery-challans", endpoints.documents.deliveryChallan).useUpdate(),
  useDelete: () => useDocumentResource("delivery-challans", endpoints.documents.deliveryChallan).useDelete(),
};

export const invoiceApi = {
  useList: (p?: any) => useDocumentResource("invoices", endpoints.documents.invoice).useList(p),
  useDetail: (id: string) => useDocumentResource("invoices", endpoints.documents.invoice).useDetail(id),
  useCreate: () => useDocumentResource("invoices", endpoints.documents.invoice).useCreate(),
  useUpdate: () => useDocumentResource("invoices", endpoints.documents.invoice).useUpdate(),
  useDelete: () => useDocumentResource("invoices", endpoints.documents.invoice).useDelete(),
};

export const purchaseOrderApi = {
  useList: (p?: any) => useDocumentResource("purchase-orders", endpoints.documents.purchaseOrder).useList(p),
  useDetail: (id: string) => useDocumentResource("purchase-orders", endpoints.documents.purchaseOrder).useDetail(id),
  useCreate: () => useDocumentResource("purchase-orders", endpoints.documents.purchaseOrder).useCreate(),
  useUpdate: () => useDocumentResource("purchase-orders", endpoints.documents.purchaseOrder).useUpdate(),
  useDelete: () => useDocumentResource("purchase-orders", endpoints.documents.purchaseOrder).useDelete(),
};

export const purchaseInvoiceApi = {
  useList: (p?: any) => useDocumentResource("purchase-invoices", endpoints.documents.purchaseInvoice).useList(p),
  useDetail: (id: string) => useDocumentResource("purchase-invoices", endpoints.documents.purchaseInvoice).useDetail(id),
  useCreate: () => useDocumentResource("purchase-invoices", endpoints.documents.purchaseInvoice).useCreate(),
  useUpdate: () => useDocumentResource("purchase-invoices", endpoints.documents.purchaseInvoice).useUpdate(),
  useDelete: () => useDocumentResource("purchase-invoices", endpoints.documents.purchaseInvoice).useDelete(),
};
