"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  CircleDollarSign,
  Clock,
  FileCheck,
  FileMinus,
  FileSpreadsheet,
  Plus,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  creditNoteApi,
  deliveryChallanApi,
  invoiceApi,
  proformaApi,
  quotationApi,
  salesOrderApi,
} from "@/features/documents/api";
import { useCustomers } from "@/features/parties/customers/api";
import {
  extractRecords,
  formatINR,
  getDocumentAmount,
  getDocumentDate,
} from "@/features/dashboard/utils";

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

const CLOSED_SET = new Set([
  "cancelled",
  "canceled",
  "void",
  "rejected",
  "closed",
]);
const PAID_SET = new Set(["paid", "fully paid", "settled", "completed"]);
const QUOTE_CLOSED_SET = new Set([
  "cancelled",
  "canceled",
  "won",
  "lost",
  "rejected",
  "closed",
  "void",
]);
const CHALLAN_CLOSED_SET = new Set([
  "delivered",
  "completed",
  "cancelled",
  "canceled",
  "closed",
  "void",
]);

export function SalesOverview() {
  const quotationQuery = quotationApi.useList();
  const salesOrderQuery = salesOrderApi.useList();
  const invoiceQuery = invoiceApi.useList();
  const deliveryChallanQuery = deliveryChallanApi.useList();
  const creditNoteQuery = creditNoteApi.useList();
  const proformaQuery = proformaApi.useList();
  const customersQuery = useCustomers();

  const quotations = useMemo(
    () => extractRecords(quotationQuery.data),
    [quotationQuery.data],
  );
  const salesOrders = useMemo(
    () => extractRecords(salesOrderQuery.data),
    [salesOrderQuery.data],
  );
  const invoices = useMemo(
    () => extractRecords(invoiceQuery.data),
    [invoiceQuery.data],
  );
  const deliveryChallans = useMemo(
    () => extractRecords(deliveryChallanQuery.data),
    [deliveryChallanQuery.data],
  );
  const creditNotes = useMemo(
    () => extractRecords(creditNoteQuery.data),
    [creditNoteQuery.data],
  );
  const proformas = useMemo(
    () => extractRecords(proformaQuery.data),
    [proformaQuery.data],
  );
  const customers = useMemo(
    () => extractRecords(customersQuery.data),
    [customersQuery.data],
  );

  const {
    monthlySales,
    monthlySalesCount,
    receivables,
    activeQuotations,
    pendingDeliveries,
    monthSeries,
    invoiceStatus,
    recentQuotations,
  } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 6-month series
    const monthSeriesKeys = new Map<string, number>();
    const series = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentYear, currentMonth - (5 - i), 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthSeriesKeys.set(key, i);
      return {
        month: d.toLocaleDateString("en-IN", { month: "short" }),
        sales: 0,
      };
    });

    let mSales = 0;
    let mSalesCount = 0;
    let recv = 0;
    let paidCount = 0;
    let partialCount = 0;
    let awaitingCount = 0;

    for (const inv of invoices) {
      const status = String(inv.status ?? "").toLowerCase();
      const amount = getDocumentAmount(inv);
      const paidAmount = toNumber(
        inv.paid_amount ?? inv.amount_paid ?? inv.received_amount,
      );
      const outstanding = Math.max(0, amount - paidAmount);

      const dStr = getDocumentDate(inv);
      if (dStr) {
        const d = new Date(dStr);
        if (Number.isFinite(d.getTime())) {
          if (
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth
          ) {
            mSales += amount;
            mSalesCount++;
          }
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const idx = monthSeriesKeys.get(key);
          if (idx !== undefined) {
            series[idx].sales += amount;
          }
        }
      }

      if (PAID_SET.has(status)) {
        paidCount++;
      } else if (["partial", "partially paid"].includes(status)) {
        partialCount++;
        if (!CLOSED_SET.has(status)) {
          recv += outstanding;
        }
      } else {
        awaitingCount++;
        if (!CLOSED_SET.has(status)) {
          recv += outstanding;
        }
      }
    }

    const activeQuotes = quotations.filter((q) => {
      const st = String(q.status ?? "draft").toLowerCase();
      return !QUOTE_CLOSED_SET.has(st);
    }).length;

    const pendingDeliv = deliveryChallans.filter((c) => {
      const st = String(c.status ?? "draft").toLowerCase();
      return !CHALLAN_CLOSED_SET.has(st);
    }).length;

    const recentQuotes = [...quotations]
      .sort((a, b) => {
        const da = getDocumentDate(a);
        const db = getDocumentDate(b);
        const ta = da ? new Date(da).getTime() : 0;
        const tb = db ? new Date(db).getTime() : 0;
        return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
      })
      .slice(0, 5);

    const invStatus = [
      { name: "Paid", value: paidCount, color: "#22c55e" },
      { name: "Part-paid", value: partialCount, color: "#f59e0b" },
      { name: "Awaiting", value: awaitingCount, color: "#6366f1" },
    ];

    return {
      monthlySales: mSales,
      monthlySalesCount: mSalesCount,
      receivables: recv,
      activeQuotations: activeQuotes,
      pendingDeliveries: pendingDeliv,
      monthSeries: series,
      invoiceStatus: invStatus,
      recentQuotations: recentQuotes,
    };
  }, [invoices, quotations, deliveryChallans]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">SALES MODULE</span>
          <h1>Sales Overview</h1>
          <p>Quotations, orders, deliveries and invoices at a glance.</p>
        </div>
        <nav className="dashboard-actions">
          <Link
            href="/sales/invoices"
            className="altrex-button altrex-button-primary"
          >
            <Plus size={16} />
            New Invoice
          </Link>
          <Link
            href="/sales/quotations"
            className="altrex-button altrex-button-secondary"
          >
            <FileSpreadsheet size={16} />
            Quotations
          </Link>
        </nav>
      </header>

      {/* 6 metric cards */}
      <section className="dashboard-metrics">
        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Monthly Sales</span>
            <i className="dashboard-icon green">
              <CircleDollarSign size={17} />
            </i>
          </div>
          <strong>{formatINR(monthlySales)}</strong>
          <small>{monthlySalesCount} invoices this month</small>
        </div>

        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Receivables</span>
            <i className="dashboard-icon amber">
              <ArrowDownRight size={17} />
            </i>
          </div>
          <strong>{formatINR(receivables)}</strong>
          <small>Outstanding balance</small>
        </div>

        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Active Quotations</span>
            <i className="dashboard-icon blue">
              <FileSpreadsheet size={17} />
            </i>
          </div>
          <strong>{activeQuotations}</strong>
          <small>{quotations.length} total quotes</small>
        </div>

        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Pending Deliveries</span>
            <i className="dashboard-icon rose">
              <Truck size={17} />
            </i>
          </div>
          <strong>{pendingDeliveries}</strong>
          <small>Awaiting dispatch</small>
        </div>

        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Total Orders</span>
            <i className="dashboard-icon violet">
              <ShoppingCart size={17} />
            </i>
          </div>
          <strong>{salesOrders.length}</strong>
          <small>Sales orders placed</small>
        </div>

        <div className="dashboard-metric dashboard-panel">
          <div className="dashboard-metric-top">
            <span>Customers</span>
            <i className="dashboard-icon cyan">
              <TrendingUp size={17} />
            </i>
          </div>
          <strong>{customers.length}</strong>
          <small>Active accounts</small>
        </div>
      </section>

      <section className="dashboard-main-grid">
        {/* Panel: Monthly revenue area chart */}
        <section className="dashboard-panel dashboard-wide">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Monthly Revenue</h2>
              <span>Last 6 months from invoices</span>
            </div>
          </div>
          <div className="dashboard-chart dashboard-chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthSeries}
                margin={{ top: 10, right: 8, left: -14, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#22c55e"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="#22c55e"
                      stopOpacity={0}
                    />
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
                  tickFormatter={(v) =>
                    v >= 100000
                      ? `₹${(v / 100000).toFixed(0)}L`
                      : `₹${Math.round(v / 1000)}k`
                  }
                />
                <Tooltip
                  formatter={(v) => formatINR(Number(v))}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--altrex-border)",
                    background: "var(--altrex-surface)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Panel: Invoice status pie chart */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Invoice Status</h2>
              <span>Settlement breakdown</span>
            </div>
          </div>
          <div className="dashboard-donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="90%"
                  paddingAngle={4}
                  stroke="none"
                >
                  {invoiceStatus.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="dashboard-donut-center">
              <strong>
                {invoiceStatus.reduce((s, i) => s + i.value, 0)}
              </strong>
              <span>invoices</span>
            </div>
          </div>
          <div className="dashboard-status-list">
            {invoiceStatus.map((item) => (
              <div key={item.name}>
                <span>
                  <i
                    className="legend-dot"
                    style={{ background: item.color }}
                  />
                  {item.name}
                </span>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </section>

        {/* Panel: Recent quotations */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent Quotations</h2>
              <span>Latest generated quotes</span>
            </div>
          </div>
          <div className="dashboard-activity">
            {recentQuotations.length ? (
              recentQuotations.map((doc, idx) => {
                const docId = String(
                  doc.quotation_id ?? doc.id ?? idx,
                );
                const num = String(
                  doc.quotation_number || doc.series_number || "—",
                );
                const status = String(doc.status || "draft");
                const dateStr = getDocumentDate(doc);
                const date = dateStr
                  ? new Date(dateStr).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—";
                const amount = formatINR(getDocumentAmount(doc));

                return (
                  <Link
                    key={docId}
                    href="/sales/quotations"
                    className="dashboard-activity-row"
                  >
                    <span className="dashboard-activity-icon">
                      <FileSpreadsheet size={16} />
                    </span>
                    <span className="dashboard-activity-name">
                      <b>{num}</b>
                      <small>
                        {status} · {date}
                      </small>
                    </span>
                    <strong>{amount}</strong>
                    <ArrowRight size={14} />
                  </Link>
                );
              })
            ) : (
              <div className="dashboard-empty">
                <Clock size={24} />
                <span>No recent quotations</span>
              </div>
            )}
          </div>
        </section>

        {/* Panel: Quick links grid to all sub-pages */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Quick Links</h2>
              <span>Access sales records</span>
            </div>
          </div>
          <div className="dashboard-network">
            <Link href="/sales/quotations">
              <FileSpreadsheet size={17} />
              <span>Quotations</span>
              <b>{quotations.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/sales/orders">
              <ShoppingCart size={17} />
              <span>Sales Orders</span>
              <b>{salesOrders.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/sales/challans">
              <Truck size={17} />
              <span>Delivery Challans</span>
              <b>{deliveryChallans.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/sales/invoices">
              <Receipt size={17} />
              <span>Invoices</span>
              <b>{invoices.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/sales/invoices">
              <FileCheck size={17} />
              <span>Proformas</span>
              <b>{proformas.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/sales/credit-notes">
              <FileMinus size={17} />
              <span>Credit Notes</span>
              <b>{creditNotes.length}</b>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
