"use client";

import { useMemo } from "react";

import {
  deliveryChallanApi,
  invoiceApi,
  purchaseInvoiceApi,
  purchaseOrderApi,
  quotationApi,
  salesOrderApi,
} from "@/features/documents/api";
import { useCustomers } from "@/features/parties/customers/api";
import { useVendors } from "@/features/parties/vendors/api";

import {
  extractRecords,
  formatDisplayDate,
  formatINR,
  getDocumentAmount,
  getDocumentDate,
  getDocumentId,
  isActiveQuotation,
  isInCurrentMonth,
  isPendingDelivery,
} from "../utils";

export type DashboardActivityItem = {
  id: string;
  key: string;
  label: string;
  href: string;
  status: string;
  dateLabel: string;
  sortTime: number;
  amountLabel?: string;
};

export type DashboardOverview = {
  isLoading: boolean;
  hasError: boolean;
  monthlySales: number;
  monthlySalesLabel: string;
  monthlySalesCount: number;
  monthlyPurchases: number;
  monthlyPurchasesLabel: string;
  monthlyPurchasesCount: number;
  activeQuotations: number;
  pendingDeliveries: number;
  customerCount: number;
  vendorCount: number;
  recentActivity: DashboardActivityItem[];
};

function toActivity(
  docs: Record<string, unknown>[],
  label: string,
  href: string,
): DashboardActivityItem[] {
  return docs.map((doc) => {
    const id = getDocumentId(doc);
    const dateValue = getDocumentDate(doc);
    const amount = getDocumentAmount(doc);
    const sortTime = dateValue ? new Date(dateValue).getTime() : 0;

    return {
      id,
      key: `${label}-${id || Math.random().toString(36).slice(2)}`,
      label,
      href,
      status: String(doc.status ?? "draft"),
      dateLabel: formatDisplayDate(dateValue),
      sortTime: Number.isFinite(sortTime) ? sortTime : 0,
      amountLabel: amount > 0 ? formatINR(amount) : undefined,
    };
  });
}

/** Aggregates live dashboard KPIs from documented list APIs (no dedicated dashboard endpoint). */
export function useDashboardOverview(): DashboardOverview {
  const invoicesQuery = invoiceApi.useList();
  const purchaseInvoicesQuery = purchaseInvoiceApi.useList();
  const quotationsQuery = quotationApi.useList();
  const challansQuery = deliveryChallanApi.useList();
  const salesOrdersQuery = salesOrderApi.useList();
  const purchaseOrdersQuery = purchaseOrderApi.useList();
  const customersQuery = useCustomers();
  const vendorsQuery = useVendors();

  const queries = [
    invoicesQuery,
    purchaseInvoicesQuery,
    quotationsQuery,
    challansQuery,
    salesOrdersQuery,
    purchaseOrdersQuery,
    customersQuery,
    vendorsQuery,
  ];

  const isLoading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => Boolean(query.error));

  return useMemo(() => {
    const invoices = extractRecords(invoicesQuery.data);
    const purchaseInvoices = extractRecords(purchaseInvoicesQuery.data);
    const quotations = extractRecords(quotationsQuery.data);
    const challans = extractRecords(challansQuery.data);
    const salesOrders = extractRecords(salesOrdersQuery.data);
    const purchaseOrders = extractRecords(purchaseOrdersQuery.data);
    const customers = extractRecords(customersQuery.data);
    const vendors = extractRecords(vendorsQuery.data);

    const monthlyInvoices = invoices.filter((doc) => isInCurrentMonth(getDocumentDate(doc)));
    const monthlyPurchaseInvoices = purchaseInvoices.filter((doc) =>
      isInCurrentMonth(getDocumentDate(doc)),
    );

    const monthlySales = monthlyInvoices.reduce((sum, doc) => sum + getDocumentAmount(doc), 0);
    const monthlyPurchases = monthlyPurchaseInvoices.reduce(
      (sum, doc) => sum + getDocumentAmount(doc),
      0,
    );

    const recentActivity = [
      ...toActivity(invoices, "Sales Invoice", "/sales/invoices"),
      ...toActivity(purchaseInvoices, "Purchase Invoice", "/purchase/invoices"),
      ...toActivity(quotations, "Quotation", "/sales/quotations"),
      ...toActivity(salesOrders, "Sales Order", "/sales/orders"),
      ...toActivity(purchaseOrders, "Purchase Order", "/purchase/orders"),
      ...toActivity(challans, "Delivery Challan", "/sales/challans"),
    ]
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 8);

    return {
      isLoading,
      hasError,
      monthlySales,
      monthlySalesLabel: formatINR(monthlySales),
      monthlySalesCount: monthlyInvoices.length,
      monthlyPurchases,
      monthlyPurchasesLabel: formatINR(monthlyPurchases),
      monthlyPurchasesCount: monthlyPurchaseInvoices.length,
      activeQuotations: quotations.filter(isActiveQuotation).length,
      pendingDeliveries: challans.filter(isPendingDelivery).length,
      customerCount: customers.length,
      vendorCount: vendors.length,
      recentActivity,
    };
  }, [
    challansQuery.data,
    customersQuery.data,
    hasError,
    invoicesQuery.data,
    isLoading,
    purchaseInvoicesQuery.data,
    purchaseOrdersQuery.data,
    quotationsQuery.data,
    salesOrdersQuery.data,
    vendorsQuery.data,
  ]);
}
