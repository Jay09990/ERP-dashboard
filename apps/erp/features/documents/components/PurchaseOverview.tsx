"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  Building,
  ClipboardList,
  FileCheck,
  FilePlus,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  debitNoteApi,
  purchaseInvoiceApi,
  purchaseOrderApi,
} from "@/features/documents/api";
import { useVendors } from "@/features/parties/vendors/api";
import {
  extractRecords,
  formatDisplayDate,
  formatINR,
  getDocumentAmount,
  getDocumentDate,
  toNumber,
} from "@/features/dashboard/utils";

const currencyTick = (value: number) =>
  value >= 10000000
    ? `₹${(value / 10000000).toFixed(1)}Cr`
    : value >= 100000
      ? `₹${(value / 100000).toFixed(0)}L`
      : `₹${Math.round(value / 1000)}k`;

function Panel({
  title,
  detail,
  children,
  className = "",
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="dashboard-panel-heading">
        <div>
          <h2>{title}</h2>
          {detail && <span>{detail}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  foot,
  tone,
  href,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  foot: string;
  tone: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="dashboard-metric-top">
        <span>{label}</span>
        <i className={`dashboard-icon ${tone}`}>
          <Icon size={17} />
        </i>
      </div>
      <strong>{value}</strong>
      <small>{foot}</small>
    </>
  );
  return href ? (
    <Link className="dashboard-metric dashboard-panel" href={href}>
      {content}
    </Link>
  ) : (
    <div className="dashboard-metric dashboard-panel">{content}</div>
  );
}

export function PurchaseOverview() {
  const poQuery = purchaseOrderApi.useList();
  const piQuery = purchaseInvoiceApi.useList();
  const dnQuery = debitNoteApi.useList();
  const vendorsQuery = useVendors();

  const isLoading =
    poQuery.isLoading ||
    piQuery.isLoading ||
    dnQuery.isLoading ||
    vendorsQuery.isLoading;
  const hasError = Boolean(
    poQuery.error || piQuery.error || dnQuery.error || vendorsQuery.error,
  );

  const stats = useMemo(() => {
    const purchaseOrders = extractRecords(poQuery.data);
    const purchaseInvoices = extractRecords(piQuery.data);
    const debitNotes = extractRecords(dnQuery.data);
    const vendors = extractRecords(vendorsQuery.data);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 6-month spend series
    const MONTHS = 6;
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
        spend: 0,
      };
    });

    const CLOSED = new Set([
      "cancelled",
      "canceled",
      "void",
      "rejected",
      "closed",
    ]);
    const PAID = new Set(["paid", "fully paid", "settled", "completed"]);

    let monthlySpend = 0;
    let monthlyPurchasesCount = 0;
    let sixMonthSpendTotal = 0;
    let payables = 0;

    for (const doc of purchaseInvoices) {
      const status = String(doc.status ?? "").toLowerCase();
      const amount = getDocumentAmount(doc);
      const dateStr =
        doc.pi_date ??
        doc.purchase_invoice_date ??
        doc.created_at ??
        getDocumentDate(doc);

      if (dateStr) {
        const d = new Date(String(dateStr));
        if (Number.isFinite(d.getTime())) {
          if (
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth
          ) {
            monthlySpend += amount;
            monthlyPurchasesCount++;
          }

          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const seriesIdx = monthSeriesKeys.get(key);
          if (seriesIdx !== undefined) {
            monthSeries[seriesIdx].spend += amount;
            sixMonthSpendTotal += amount;
          }
        }
      }

      if (!CLOSED.has(status) && !PAID.has(status)) {
        const paid = toNumber(
          doc.paid_amount ?? doc.amount_paid ?? doc.received_amount,
        );
        payables += Math.max(0, amount - paid);
      }
    }

    // PO Status Breakdown
    const statusCountMap: Record<string, number> = {};
    let openPOCount = 0;

    for (const po of purchaseOrders) {
      const rawStatus =
        String(po.status ?? "draft")
          .toLowerCase()
          .trim() || "draft";
      statusCountMap[rawStatus] = (statusCountMap[rawStatus] || 0) + 1;
      if (!CLOSED.has(rawStatus) && !PAID.has(rawStatus)) {
        openPOCount++;
      }
    }

    const STATUS_COLORS: Record<string, string> = {
      draft: "#94a3b8",
      pending: "#f59e0b",
      approved: "#3b82f6",
      confirmed: "#6366f1",
      ordered: "#8b5cf6",
      received: "#10b981",
      completed: "#22c55e",
      cancelled: "#ef4444",
      canceled: "#ef4444",
      closed: "#64748b",
    };

    const statusList = Object.entries(statusCountMap)
      .map(([status, count]) => ({
        status,
        label:
          status.charAt(0).toUpperCase() +
          status.slice(1).replace(/_/g, " "),
        count,
        color: STATUS_COLORS[status] ?? "#8b5cf6",
      }))
      .sort((a, b) => b.count - a.count);

    // Recent POs (last 5)
    const recentPOs = [...purchaseOrders]
      .map((po) => {
        const rawDate =
          po.purchase_order_date ??
          po.po_date ??
          po.created_at ??
          getDocumentDate(po);
        const timestamp = rawDate ? new Date(String(rawDate)).getTime() : 0;
        const poNumber = String(
          po.po_number ??
            po.document_number ??
            po.order_number ??
            po.purchase_order_id ??
            po.id ??
            "PO",
        );
        const vendorName = String(
          po.vendor_name ??
            po.party_name ??
            po.supplier_name ??
            po.vendor ??
            "",
        );
        const label = vendorName ? `${poNumber} · ${vendorName}` : poNumber;
        const status = String(po.status ?? "draft");
        const amount = getDocumentAmount(po);

        return {
          id: String(po.id ?? po.purchase_order_id ?? Math.random()),
          label,
          status,
          dateLabel: formatDisplayDate(rawDate ? String(rawDate) : null),
          amountLabel: amount > 0 ? formatINR(amount) : undefined,
          timestamp: Number.isFinite(timestamp) ? timestamp : 0,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      monthlySpend,
      monthlyPurchasesCount,
      sixMonthSpendTotal,
      payables,
      totalPOs: purchaseOrders.length,
      openPOCount,
      totalInvoices: purchaseInvoices.length,
      totalDebitNotes: debitNotes.length,
      totalVendors: vendors.length,
      monthSeries,
      statusList,
      recentPOs,
    };
  }, [poQuery.data, piQuery.data, dnQuery.data, vendorsQuery.data]);

  const nameDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            PROCUREMENT &amp; PURCHASING · {nameDate.toUpperCase()}
          </span>
          <h1>Purchase Overview</h1>
          <p>Live summary of purchase orders, invoices, debit notes, and payables.</p>
        </div>
        <nav aria-label="Quick actions" className="dashboard-actions">
          <Link
            href="/purchase/orders"
            className="altrex-button altrex-button-primary"
          >
            <Plus size={16} />
            New Order
          </Link>
          <Link
            href="/purchase/invoices"
            className="altrex-button altrex-button-secondary"
          >
            <FileCheck size={16} />
            Invoices
          </Link>
        </nav>
      </header>

      {hasError && (
        <div className="dashboard-notice">
          <AlertTriangle size={16} />
          Some purchase data could not be loaded; available figures are still shown.
        </div>
      )}
      {isLoading && (
        <output
          className="dashboard-notice dashboard-loading-notice"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="altrex-spinner" aria-hidden="true" />
          Loading purchase overview data...
        </output>
      )}

      {/* 6 Metrics cards */}
      <section className="dashboard-metrics" aria-label="Key purchase figures">
        <Metric
          icon={ShoppingBag}
          label="Monthly spend"
          value={isLoading ? "—" : formatINR(stats.monthlySpend)}
          foot={`${stats.monthlyPurchasesCount} bills this month`}
          tone="violet"
          href="/purchase/invoices"
        />
        <Metric
          icon={ArrowDownRight}
          label="Payables"
          value={isLoading ? "—" : formatINR(stats.payables)}
          foot="Outstanding bills"
          tone="amber"
          href="/purchase/invoices"
        />
        <Metric
          icon={ClipboardList}
          label="Purchase orders"
          value={isLoading ? "—" : String(stats.totalPOs)}
          foot={`${stats.openPOCount} open`}
          tone="blue"
          href="/purchase/orders"
        />
        <Metric
          icon={FileCheck}
          label="Purchase invoices"
          value={isLoading ? "—" : String(stats.totalInvoices)}
          foot="Total invoices"
          tone="green"
          href="/purchase/invoices"
        />
        <Metric
          icon={FilePlus}
          label="Debit notes"
          value={isLoading ? "—" : String(stats.totalDebitNotes)}
          foot="Total debit notes"
          tone="rose"
          href="/purchase/debit-notes"
        />
        <Metric
          icon={Building}
          label="Vendors"
          value={isLoading ? "—" : String(stats.totalVendors)}
          foot="Registered suppliers"
          tone="cyan"
          href="/parties/vendors"
        />
      </section>

      {/* Panels */}
      <section
        className="dashboard-main-grid"
        style={{
          gridTemplateAreas:
            '"money money invoice" "activity activity network"',
        }}
      >
        {/* Panel 1: Monthly spend area chart */}
        <Panel
          title="Monthly Spend"
          detail="Purchase invoice spend · last 6 months"
          className="dashboard-wide dashboard-money"
        >
          <div className="dashboard-chart dashboard-chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.monthSeries}
                margin={{ top: 10, right: 8, left: -14, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--dashboard-grid)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 10 }}
                  tickFormatter={currencyTick}
                />
                <Tooltip
                  formatter={(value) => formatINR(Number(value))}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--altrex-border)",
                    background: "var(--altrex-surface)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  name="Spend"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#spendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-chart-legend">
            <span>
              <i className="legend-dot violet" />
              Spend this month <b>{formatINR(stats.monthlySpend)}</b>
            </span>
            <span>
              <i className="legend-dot green" />
              6-month total <b>{formatINR(stats.sixMonthSpendTotal)}</b>
            </span>
          </div>
        </Panel>

        {/* Panel 2: PO status breakdown */}
        <Panel
          title="PO Status Breakdown"
          detail="Orders by workflow stage"
          className="dashboard-invoice"
        >
          {stats.statusList.length > 0 ? (
            <div className="dashboard-status-list" style={{ marginTop: 8 }}>
              {stats.statusList.map((item) => (
                <div key={item.status}>
                  <span>
                    <i
                      className="legend-dot"
                      style={{ background: item.color }}
                    />
                    {item.label}
                  </span>
                  <b>{item.count}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <ClipboardList size={25} />
              <span>No purchase orders found</span>
            </div>
          )}
        </Panel>

        {/* Panel 3: Recent purchase orders */}
        <Panel
          title="Recent Purchase Orders"
          detail="Last 5 created orders"
          className="dashboard-wide dashboard-activity-panel"
        >
          {stats.recentPOs.length > 0 ? (
            <div className="dashboard-activity">
              {stats.recentPOs.map((order) => (
                <Link
                  key={order.id}
                  href="/purchase/orders"
                  className="dashboard-activity-row"
                >
                  <span className="dashboard-activity-icon">
                    <ClipboardList size={16} />
                  </span>
                  <span className="dashboard-activity-name">
                    <b>{order.label}</b>
                    <small>
                      {order.dateLabel} · {order.status}
                    </small>
                  </span>
                  <strong>{order.amountLabel ?? "—"}</strong>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <ClipboardList size={25} />
              <span>No recent purchase orders</span>
            </div>
          )}
        </Panel>

        {/* Panel 4: Quick links */}
        <Panel
          title="Quick Links"
          detail="Purchase records &amp; suppliers"
          className="dashboard-network-panel"
        >
          <div className="dashboard-network">
            <Link href="/purchase/orders">
              <ClipboardList size={17} />
              <span>Purchase Orders</span>
              <b>{stats.totalPOs}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/purchase/invoices">
              <FileCheck size={17} />
              <span>Purchase Invoices</span>
              <b>{stats.totalInvoices}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/purchase/debit-notes">
              <FilePlus size={17} />
              <span>Debit Notes</span>
              <b>{stats.totalDebitNotes}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/parties/vendors">
              <Building size={17} />
              <span>Vendors</span>
              <b>{stats.totalVendors}</b>
              <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>
      </section>
    </main>
  );
}
