"use client";

import { useMemo } from "react";

import { crmApi } from "@/features/crm/api";
import {
  deliveryChallanApi,
  invoiceApi,
  purchaseInvoiceApi,
  purchaseOrderApi,
  quotationApi,
  salesOrderApi,
} from "@/features/documents/api";
import { batchApi, stockApi } from "@/features/inventory/api";
import { useCustomers } from "@/features/parties/customers/api";
import { useVendors } from "@/features/parties/vendors/api";
import { procurementApi, projectApi } from "@/features/projects/api";
import {
  extractRecords,
  formatDisplayDate,
  formatINR,
  getDocumentAmount,
  getDocumentDate,
  getDocumentId,
  isActiveQuotation,
  isPendingDelivery,
  toNumber,
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
  cashflow: { month: string; sales: number; purchases: number }[];
  invoiceStatus: { name: string; value: number; color: string }[];
  projectStatus: { name: string; count: number }[];
  lowStock: { name: string; stock: number; reorder: number }[];
  activeProjects: number;
  averageProgress: number;
  leads: number;
  pipelineValue: number;
  dueFollowUps: number;
  receivables: number;
  overdueInvoices: number;
  payables: number;
  lowStockCount: number;
  expiringBatches: number;
  pendingApprovals: number;
  attentionItems: { label: string; count: number; href: string; tone: string }[];
};

const CLOSED = new Set(["cancelled", "canceled", "void", "rejected", "closed"]);
const PAID = new Set(["paid", "fully paid", "settled", "completed"]);
const MONTHS = 12;
const BATCH_EXPIRY_WINDOW_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function recordDate(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (record[key]) return String(record[key]);
  return getDocumentDate(record);
}

function toActivity(docs: Record<string, unknown>[], label: string, href: string): DashboardActivityItem[] {
  return docs.map((doc) => {
    const date = getDocumentDate(doc);
    const timestamp = date ? new Date(date).getTime() : 0;
    const id = getDocumentId(doc);
    return {
      id,
      key: `${label}-${id || timestamp}`,
      label,
      href,
      status: String(doc.status ?? "draft"),
      dateLabel: formatDisplayDate(date),
      sortTime: Number.isFinite(timestamp) ? timestamp : 0,
      amountLabel: getDocumentAmount(doc) > 0 ? formatINR(getDocumentAmount(doc)) : undefined,
    };
  });
}

/** Combines live module lists into dashboard metrics and chart-ready series. */
export function useDashboardOverview(): DashboardOverview {
  const invoicesQuery = invoiceApi.useList();
  const purchasesQuery = purchaseInvoiceApi.useList();
  const quotationsQuery = quotationApi.useList();
  const challansQuery = deliveryChallanApi.useList();
  const salesOrdersQuery = salesOrderApi.useList();
  const purchaseOrdersQuery = purchaseOrderApi.useList();
  const customersQuery = useCustomers();
  const vendorsQuery = useVendors();
  const projectsQuery = projectApi.useList();
  const stockQuery = stockApi.useSummary();
  const batchesQuery = batchApi.useList();
  const leadsQuery = crmApi.useLeads();
  const followUpsQuery = crmApi.useFollowUps("due");
  const requisitionsQuery = procurementApi.useRequisitions();
  const grnsQuery = procurementApi.useGrns();
  const siteIssuesQuery = procurementApi.useSiteIssues();

  const queries = [invoicesQuery, purchasesQuery, quotationsQuery, challansQuery, salesOrdersQuery,
    purchaseOrdersQuery, customersQuery, vendorsQuery,
    projectsQuery, stockQuery, batchesQuery, leadsQuery, followUpsQuery, requisitionsQuery, grnsQuery, siteIssuesQuery];
  const isLoading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => Boolean(query.error));

  return useMemo(() => {
    const invoices = extractRecords(invoicesQuery.data);
    const purchases = extractRecords(purchasesQuery.data);
    const quotations = extractRecords(quotationsQuery.data);
    const challans = extractRecords(challansQuery.data);
    const salesOrders = extractRecords(salesOrdersQuery.data);
    const purchaseOrders = extractRecords(purchaseOrdersQuery.data);
    const customers = extractRecords(customersQuery.data);
    const vendors = extractRecords(vendorsQuery.data);
    const projects = extractRecords(projectsQuery.data);
    const stock = extractRecords(stockQuery.data);
    const leads = extractRecords(leadsQuery.data);
    const followUps = extractRecords(followUpsQuery.data);
    const requisitions = extractRecords(requisitionsQuery.data);
    const grns = extractRecords(grnsQuery.data);
    const siteIssues = extractRecords(siteIssuesQuery.data);
    const now = new Date();
    const monthly = (list: Record<string, unknown>[], key?: string) => list.filter((doc) => {
      const date = new Date((key ? recordDate(doc, key) : getDocumentDate(doc)) ?? "");
      return Number.isFinite(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
    const monthlyInvoices = monthly(invoices, "invoice_date");
    const monthlyPurchases = monthly(purchases, "pi_date");
    const monthSeries = Array.from({ length: MONTHS }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - index), 1);
      const sumForMonth = (list: Record<string, unknown>[], dateKey: string) => list.reduce((sum, doc) => {
        const value = new Date(recordDate(doc, dateKey) ?? "");
        return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth()
          ? sum + getDocumentAmount(doc) : sum;
      }, 0);
      return { month: date.toLocaleDateString("en-IN", { month: "short" }), sales: sumForMonth(invoices, "invoice_date"), purchases: sumForMonth(purchases, "pi_date") };
    });
    const outstanding = (doc: Record<string, unknown>) => Math.max(0,
      getDocumentAmount(doc) - toNumber(doc.paid_amount ?? doc.amount_paid ?? doc.received_amount));
    const openInvoices = invoices.filter((doc) => !CLOSED.has(String(doc.status ?? "").toLowerCase()) && !PAID.has(String(doc.status ?? "").toLowerCase()));
    const openPurchases = purchases.filter((doc) => !CLOSED.has(String(doc.status ?? "").toLowerCase()) && !PAID.has(String(doc.status ?? "").toLowerCase()));
    const overdue = openInvoices.filter((doc) => {
      const due = new Date(String(doc.due_date ?? doc.payment_due_date ?? ""));
      return Number.isFinite(due.getTime()) && due < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    });
    const normalizeStatus = (status: unknown) => String(status ?? "unknown").toLowerCase().replace(/[_-]+/g, " ").trim();
    const statusCount = (status: string) => projects.filter((project) => normalizeStatus(project.status) === status).length;
    const activeProjects = projects.filter((project) => !CLOSED.has(String(project.status ?? "").toLowerCase()) && String(project.status ?? "").toLowerCase() !== "completed");
    const lowStockRows = stock.filter((row) => toNumber(row.reorder_level) > 0 && toNumber(row.current_stock ?? row.quantity) <= toNumber(row.reorder_level));
    const expiryLimit = new Date(now.getTime() + BATCH_EXPIRY_WINDOW_DAYS * MILLISECONDS_PER_DAY);
    const expiredBatches = extractRecords(batchesQuery.data).filter((batch) => {
      const expiry = new Date(String(batch.expiry_date ?? ""));
      return String(batch.status ?? "active").toLowerCase() === "active" && Number.isFinite(expiry.getTime()) && expiry >= now && expiry <= expiryLimit;
    });
    const pipelineLeads = leads.filter((lead) => !["lost", "converted"].includes(String(lead.status ?? "").toLowerCase()));
    const isPending = (row: Record<string, unknown>) => ["draft", "pending", "submitted", "in review"].includes(String(row.status ?? "").toLowerCase());
    const pendingApprovals = [...requisitions, ...grns, ...siteIssues, ...salesOrders, ...purchaseOrders].filter(isPending).length;
    const invoicePaid = invoices.filter((doc) => PAID.has(String(doc.status ?? "").toLowerCase())).length;
    const invoicePartial = invoices.filter((doc) => ["partial", "partially paid"].includes(String(doc.status ?? "").toLowerCase())).length;
    const recentActivity = [
      ...toActivity(invoices, "Sales invoice", "/sales/invoices"),
      ...toActivity(purchases, "Purchase invoice", "/purchase/invoices"),
      ...toActivity(quotations, "Quotation", "/sales/quotations"),
      ...toActivity(salesOrders, "Sales order", "/sales/orders"),
      ...toActivity(purchaseOrders, "Purchase order", "/purchase/orders"),
      ...toActivity(challans, "Delivery challan", "/sales/challans"),
    ].sort((a, b) => b.sortTime - a.sortTime).slice(0, 7);
    const projectStatus = ["planning", "approved", "in progress", "on hold", "delayed", "completed"].map((status) => ({
      name: status.replace(/\b\w/g, (letter) => letter.toUpperCase()), count: statusCount(status),
    }));
    const averageProgress = activeProjects.length
      ? Math.round(activeProjects.reduce((sum, project) => sum + toNumber(project.progress_percent ?? project.progress), 0) / activeProjects.length)
      : 0;
    const attentionItems = [
      { label: "Overdue invoices", count: overdue.length, href: "/sales/invoices", tone: "red" },
      { label: "Follow-ups due", count: followUps.length, href: "/crm/leads", tone: "amber" },
      { label: "Low stock items", count: lowStockRows.length, href: "/inventory/stock", tone: "blue" },
      { label: "Approvals waiting", count: pendingApprovals, href: "/procurement/requisitions", tone: "violet" },
    ];
    return {
      isLoading, hasError,
      monthlySales: monthlyInvoices.reduce((sum, doc) => sum + getDocumentAmount(doc), 0),
      monthlySalesLabel: formatINR(monthlyInvoices.reduce((sum, doc) => sum + getDocumentAmount(doc), 0)),
      monthlySalesCount: monthlyInvoices.length,
      monthlyPurchases: monthlyPurchases.reduce((sum, doc) => sum + getDocumentAmount(doc), 0),
      monthlyPurchasesLabel: formatINR(monthlyPurchases.reduce((sum, doc) => sum + getDocumentAmount(doc), 0)),
      monthlyPurchasesCount: monthlyPurchases.length,
      activeQuotations: quotations.filter(isActiveQuotation).length,
      pendingDeliveries: challans.filter(isPendingDelivery).length,
      customerCount: customers.length, vendorCount: vendors.length, recentActivity,
      cashflow: monthSeries,
      invoiceStatus: [
        { name: "Paid", value: invoicePaid, color: "#22c55e" },
        { name: "Part paid", value: invoicePartial, color: "#f59e0b" },
        { name: "Awaiting", value: Math.max(0, invoices.length - invoicePaid - invoicePartial), color: "#6366f1" },
      ],
      projectStatus, activeProjects: activeProjects.length, averageProgress,
      leads: pipelineLeads.length,
      pipelineValue: pipelineLeads.reduce((sum, lead) => sum + toNumber(lead.estimated_value), 0),
      dueFollowUps: followUps.length,
      receivables: openInvoices.reduce((sum, doc) => sum + outstanding(doc), 0),
      overdueInvoices: overdue.length,
      payables: openPurchases.reduce((sum, doc) => sum + outstanding(doc), 0),
      lowStockCount: lowStockRows.length,
      lowStock: lowStockRows.slice(0, 6).map((row) => ({ name: String(row.item_name ?? "Item"), stock: toNumber(row.current_stock ?? row.quantity), reorder: toNumber(row.reorder_level) })),
      expiringBatches: expiredBatches.length, pendingApprovals, attentionItems,
    };
  }, [invoicesQuery.data, purchasesQuery.data, quotationsQuery.data, challansQuery.data, salesOrdersQuery.data,
    purchaseOrdersQuery.data, customersQuery.data, vendorsQuery.data,
    projectsQuery.data, stockQuery.data, leadsQuery.data, followUpsQuery.data, requisitionsQuery.data,
    grnsQuery.data, siteIssuesQuery.data, isLoading, hasError]);
}
