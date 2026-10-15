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
  attentionItems: {
    label: string;
    count: number;
    href: string;
    tone: string;
  }[];
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

function toActivity(
  docs: Record<string, unknown>[],
  label: string,
  href: string,
): DashboardActivityItem[] {
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
      amountLabel:
        getDocumentAmount(doc) > 0
          ? formatINR(getDocumentAmount(doc))
          : undefined,
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

  const queries = [
    invoicesQuery,
    purchasesQuery,
    quotationsQuery,
    challansQuery,
    salesOrdersQuery,
    purchaseOrdersQuery,
    customersQuery,
    vendorsQuery,
    projectsQuery,
    stockQuery,
    batchesQuery,
    leadsQuery,
    followUpsQuery,
    requisitionsQuery,
    grnsQuery,
    siteIssuesQuery,
  ];
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
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfToday = new Date(currentYear, currentMonth, now.getDate());

    // Single-pass cashflow month series setup
    const monthSeriesKeys = new Map<string, number>();
    const monthSeries = Array.from({ length: MONTHS }, (_, index) => {
      const date = new Date(
        currentYear,
        currentMonth - (MONTHS - 1 - index),
        1,
      );
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthSeriesKeys.set(key, index);
      return {
        month: date.toLocaleDateString("en-IN", { month: "short" }),
        sales: 0,
        purchases: 0,
      };
    });

    const outstanding = (doc: Record<string, unknown>) =>
      Math.max(
        0,
        getDocumentAmount(doc) -
          toNumber(doc.paid_amount ?? doc.amount_paid ?? doc.received_amount),
      );

    // Optimized Single-Pass Invoices Processing
    let monthlySales = 0;
    let monthlySalesCount = 0;
    let invoicePaid = 0;
    let invoicePartial = 0;
    let receivables = 0;
    let overdueInvoices = 0;

    for (const doc of invoices) {
      const status = String(doc.status ?? "").toLowerCase();
      const amount = getDocumentAmount(doc);

      // Check current month invoice totals
      const invDateStr = recordDate(doc, "invoice_date");
      if (invDateStr) {
        const invDate = new Date(invDateStr);
        if (
          Number.isFinite(invDate.getTime()) &&
          invDate.getFullYear() === currentYear &&
          invDate.getMonth() === currentMonth
        ) {
          monthlySales += amount;
          monthlySalesCount++;
        }

        // Cashflow monthly aggregation
        if (Number.isFinite(invDate.getTime())) {
          const key = `${invDate.getFullYear()}-${invDate.getMonth()}`;
          const seriesIdx = monthSeriesKeys.get(key);
          if (seriesIdx !== undefined) {
            monthSeries[seriesIdx].sales += amount;
          }
        }
      }

      // Status metrics
      if (PAID.has(status)) {
        invoicePaid++;
      } else {
        if (["partial", "partially paid"].includes(status)) {
          invoicePartial++;
        }

        if (!CLOSED.has(status)) {
          receivables += outstanding(doc);
          const due = new Date(
            String(doc.due_date ?? doc.payment_due_date ?? ""),
          );
          if (Number.isFinite(due.getTime()) && due < startOfToday) {
            overdueInvoices++;
          }
        }
      }
    }

    // Optimized Single-Pass Purchases Processing
    let monthlyPurchases = 0;
    let monthlyPurchasesCount = 0;
    let payables = 0;

    for (const doc of purchases) {
      const status = String(doc.status ?? "").toLowerCase();
      const amount = getDocumentAmount(doc);

      const piDateStr = recordDate(doc, "pi_date");
      if (piDateStr) {
        const piDate = new Date(piDateStr);
        if (
          Number.isFinite(piDate.getTime()) &&
          piDate.getFullYear() === currentYear &&
          piDate.getMonth() === currentMonth
        ) {
          monthlyPurchases += amount;
          monthlyPurchasesCount++;
        }

        // Cashflow monthly aggregation
        if (Number.isFinite(piDate.getTime())) {
          const key = `${piDate.getFullYear()}-${piDate.getMonth()}`;
          const seriesIdx = monthSeriesKeys.get(key);
          if (seriesIdx !== undefined) {
            monthSeries[seriesIdx].purchases += amount;
          }
        }
      }

      if (!CLOSED.has(status) && !PAID.has(status)) {
        payables += outstanding(doc);
      }
    }

    // Optimized Single-Pass Projects Processing
    const normalizeStatus = (status: unknown) =>
      String(status ?? "unknown")
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .trim();

    const projectStatusCounts: Record<string, number> = {
      planning: 0,
      approved: 0,
      "in progress": 0,
      "on hold": 0,
      delayed: 0,
      completed: 0,
    };

    let activeProjectsCount = 0;
    let activeProjectsProgressSum = 0;

    for (const project of projects) {
      const normStatus = normalizeStatus(project.status);
      if (projectStatusCounts[normStatus] !== undefined) {
        projectStatusCounts[normStatus]++;
      }

      const rawStatus = String(project.status ?? "").toLowerCase();
      if (!CLOSED.has(rawStatus) && rawStatus !== "completed") {
        activeProjectsCount++;
        activeProjectsProgressSum += toNumber(
          project.progress_percent ?? project.progress,
        );
      }
    }

    const projectStatus = [
      "planning",
      "approved",
      "in progress",
      "on hold",
      "delayed",
      "completed",
    ].map((status) => ({
      name: status.replace(/\b\w/g, (letter) => letter.toUpperCase()),
      count: projectStatusCounts[status] || 0,
    }));

    const averageProgress = activeProjectsCount
      ? Math.round(activeProjectsProgressSum / activeProjectsCount)
      : 0;

    // Optimized Single-Pass Stock Processing
    const lowStock: { name: string; stock: number; reorder: number }[] = [];
    let lowStockCount = 0;

    for (const row of stock) {
      const reorder = toNumber(row.reorder_level);
      const currentStock = toNumber(row.current_stock ?? row.quantity);
      if (reorder > 0 && currentStock <= reorder) {
        lowStockCount++;
        if (lowStock.length < 6) {
          lowStock.push({
            name: String(row.item_name ?? "Item"),
            stock: currentStock,
            reorder,
          });
        }
      }
    }

    // Optimized Single-Pass CRM Leads Processing
    let pipelineLeadsCount = 0;
    let pipelineValue = 0;

    for (const lead of leads) {
      const status = String(lead.status ?? "").toLowerCase();
      if (!["lost", "converted"].includes(status)) {
        pipelineLeadsCount++;
        pipelineValue += toNumber(lead.estimated_value);
      }
    }

    // Optimized Single-Pass Expiring Batches Processing
    const expiryLimit = new Date(
      now.getTime() + BATCH_EXPIRY_WINDOW_DAYS * MILLISECONDS_PER_DAY,
    );
    let expiringBatches = 0;

    for (const batch of extractRecords(batchesQuery.data)) {
      const status = String(batch.status ?? "active").toLowerCase();
      if (status === "active") {
        const expiry = new Date(String(batch.expiry_date ?? ""));
        if (
          Number.isFinite(expiry.getTime()) &&
          expiry >= now &&
          expiry <= expiryLimit
        ) {
          expiringBatches++;
        }
      }
    }

    // Optimized Single-Pass Pending Approvals Processing across document arrays
    const isPending = (row: Record<string, unknown>) =>
      ["draft", "pending", "submitted", "in review"].includes(
        String(row.status ?? "").toLowerCase(),
      );

    let pendingApprovals = 0;
    const documentArrays = [
      requisitions,
      grns,
      siteIssues,
      salesOrders,
      purchaseOrders,
    ];
    for (const arr of documentArrays) {
      for (const item of arr) {
        if (isPending(item)) pendingApprovals++;
      }
    }

    // Quotations & Challans Quick Counts
    let activeQuotations = 0;
    for (const q of quotations) {
      if (isActiveQuotation(q)) activeQuotations++;
    }

    let pendingDeliveries = 0;
    for (const c of challans) {
      if (isPendingDelivery(c)) pendingDeliveries++;
    }

    // Recent Activity Feed
    const recentActivity = [
      ...toActivity(invoices, "Sales invoice", "/sales/invoices"),
      ...toActivity(purchases, "Purchase invoice", "/purchase/invoices"),
      ...toActivity(quotations, "Quotation", "/sales/quotations"),
      ...toActivity(salesOrders, "Sales order", "/sales/orders"),
      ...toActivity(purchaseOrders, "Purchase order", "/purchase/orders"),
      ...toActivity(challans, "Delivery challan", "/sales/challans"),
    ]
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 7);

    const attentionItems = [
      {
        label: "Overdue invoices",
        count: overdueInvoices,
        href: "/sales/invoices",
        tone: "red",
      },
      {
        label: "Follow-ups due",
        count: followUps.length,
        href: "/crm/leads",
        tone: "amber",
      },
      {
        label: "Low stock items",
        count: lowStockCount,
        href: "/inventory/stock",
        tone: "blue",
      },
      {
        label: "Approvals waiting",
        count: pendingApprovals,
        href: "/procurement/requisitions",
        tone: "violet",
      },
    ];

    return {
      isLoading,
      hasError,
      monthlySales,
      monthlySalesLabel: formatINR(monthlySales),
      monthlySalesCount,
      monthlyPurchases,
      monthlyPurchasesLabel: formatINR(monthlyPurchases),
      monthlyPurchasesCount,
      activeQuotations,
      pendingDeliveries,
      customerCount: customers.length,
      vendorCount: vendors.length,
      recentActivity,
      cashflow: monthSeries,
      invoiceStatus: [
        { name: "Paid", value: invoicePaid, color: "#22c55e" },
        { name: "Part paid", value: invoicePartial, color: "#f59e0b" },
        {
          name: "Awaiting",
          value: Math.max(0, invoices.length - invoicePaid - invoicePartial),
          color: "#6366f1",
        },
      ],
      projectStatus,
      activeProjects: activeProjectsCount,
      averageProgress,
      leads: pipelineLeadsCount,
      pipelineValue,
      dueFollowUps: followUps.length,
      receivables,
      overdueInvoices,
      payables,
      lowStockCount,
      lowStock,
      expiringBatches,
      pendingApprovals,
      attentionItems,
    };
  }, [
    invoicesQuery.data,
    purchasesQuery.data,
    quotationsQuery.data,
    challansQuery.data,
    salesOrdersQuery.data,
    purchaseOrdersQuery.data,
    customersQuery.data,
    vendorsQuery.data,
    projectsQuery.data,
    stockQuery.data,
    batchesQuery.data,
    leadsQuery.data,
    followUpsQuery.data,
    requisitionsQuery.data,
    grnsQuery.data,
    siteIssuesQuery.data,
    isLoading,
    hasError,
  ]);
}
