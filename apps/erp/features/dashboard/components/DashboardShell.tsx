/** Visual business overview, arranged as a responsive dashboard grid. */
"use client";

import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  BriefcaseBusiness, Boxes, Building2, CircleDollarSign, ClipboardCheck,
  FileClock, PackageSearch, Plus, Users,
} from "lucide-react";
import Link from "next/link";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatINR } from "../utils";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";

const currencyTick = (value: number) => value >= 10000000 ? `₹${(value / 10000000).toFixed(1)}Cr`
  : value >= 100000 ? `₹${(value / 100000).toFixed(0)}L` : `₹${Math.round(value / 1000)}k`;

function Panel({ title, detail, children, className = "" }: {
  title: string; detail?: string; children: React.ReactNode; className?: string;
}) {
  return <section className={`dashboard-panel ${className}`}>
    <div className="dashboard-panel-heading"><div><h2>{title}</h2>{detail && <span>{detail}</span>}</div></div>
    {children}
  </section>;
}

function Metric({ icon: Icon, label, value, foot, tone, href }: {
  icon: typeof Activity; label: string; value: string; foot: string; tone: string; href?: string;
}) {
  const content = <>
    <div className="dashboard-metric-top"><span>{label}</span><i className={`dashboard-icon ${tone}`}><Icon size={17} /></i></div>
    <strong>{value}</strong><small>{foot}</small>
  </>;
  return href ? <Link className="dashboard-metric dashboard-panel" href={href}>{content}</Link>
    : <div className="dashboard-metric dashboard-panel">{content}</div>;
}

export function DashboardShell() {
  const data = useDashboardOverview();
  const money = (value: number) => formatINR(value);
  const nameDate = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const dueCount = data.attentionItems.reduce((sum, item) => sum + item.count, 0);

  return <main className="dashboard-page">
    <header className="dashboard-header">
      <div><span className="dashboard-eyebrow">BUSINESS PULSE · {nameDate.toUpperCase()}</span><h1>Your business at a glance</h1>
        <p>Live activity across sales, projects, inventory and your team.</p></div>
      <nav aria-label="Quick actions" className="dashboard-actions">
        <Link href="/sales/invoices" className="altrex-button altrex-button-primary"><Plus size={16} />New invoice</Link>
        <Link href="/crm/leads" className="altrex-button altrex-button-secondary"><Users size={16} />Leads</Link>
      </nav>
    </header>

    {data.hasError && <div className="dashboard-notice"><AlertTriangle size={16} />Some module data could not be loaded; available figures are still shown.</div>}
    {data.isLoading && (
      <output
        className="dashboard-notice dashboard-loading-notice"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="altrex-spinner" aria-hidden="true" />
        Loading business overview and financial data...
      </output>
    )}

    <section className="dashboard-metrics" aria-label="Key business figures">
      <Metric icon={CircleDollarSign} label="Sales this month" value={data.isLoading ? "—" : money(data.monthlySales)} foot={`${data.monthlySalesCount} invoices`} tone="green" href="/sales/invoices" />
      <Metric icon={ArrowDownRight} label="To collect" value={data.isLoading ? "—" : money(data.receivables)} foot={`${data.overdueInvoices} overdue invoices`} tone="amber" href="/sales/invoices" />
      <Metric icon={ArrowUpRight} label="To pay" value={data.isLoading ? "—" : money(data.payables)} foot={`${data.monthlyPurchasesCount} bills this month`} tone="blue" href="/purchase/invoices" />
      <Metric icon={BriefcaseBusiness} label="Active projects" value={String(data.activeProjects)} foot={`${data.averageProgress}% average progress`} tone="violet" href="/projects" />
      <Metric icon={Activity} label="Sales pipeline" value={String(data.leads)} foot={money(data.pipelineValue)} tone="cyan" href="/crm/leads" />
      <Metric icon={Boxes} label="Stock to review" value={String(data.lowStockCount)} foot={`${data.expiringBatches} batches expiring soon`} tone="rose" href="/inventory/stock" />
    </section>

    <section className="dashboard-main-grid">
      <Panel title="Money in & out" detail="Monthly invoices · last 12 months" className="dashboard-wide dashboard-money">
        <div className="dashboard-chart dashboard-chart-large">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.cashflow} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
            <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="var(--dashboard-grid)" strokeDasharray="3 5" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--altrex-muted)", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--altrex-muted)", fontSize: 10 }} tickFormatter={currencyTick} />
            <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 10, border: "1px solid var(--altrex-border)", background: "var(--altrex-surface)" }} />
            <Area type="monotone" dataKey="sales" name="Sales" stroke="#22c55e" strokeWidth={2.5} fill="url(#salesFill)" />
            <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#818cf8" strokeWidth={2} fill="none" />
          </AreaChart></ResponsiveContainer>
        </div>
        <div className="dashboard-chart-legend"><span><i className="legend-dot green" />Sales <b>{money(data.monthlySales)}</b></span><span><i className="legend-dot violet" />Purchases <b>{money(data.monthlyPurchases)}</b></span></div>
      </Panel>

      <Panel title="Invoice collection" detail="Current status across invoices" className="dashboard-invoice">
        <div className="dashboard-donut-wrap">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.invoiceStatus} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="90%" paddingAngle={4} stroke="none">
            {data.invoiceStatus.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie><Tooltip /></PieChart></ResponsiveContainer>
          <div className="dashboard-donut-center"><strong>{data.invoiceStatus.reduce((sum, item) => sum + item.value, 0)}</strong><span>invoices</span></div>
        </div>
        <div className="dashboard-status-list">{data.invoiceStatus.map((item) => <div key={item.name}><span><i className="legend-dot" style={{ background: item.color }} />{item.name}</span><b>{item.value}</b></div>)}</div>
      </Panel>

      <Panel title="Your network" detail="Customers and suppliers" className="dashboard-network-panel">
        <div className="dashboard-network"><Link href="/parties/customers"><Building2 size={17} /><span>Customers</span><b>{data.customerCount}</b><ArrowRight size={14} /></Link><Link href="/parties/vendors"><Users size={17} /><span>Suppliers</span><b>{data.vendorCount}</b><ArrowRight size={14} /></Link></div>
      </Panel>

      <Panel title="Project delivery" detail={`${data.activeProjects} active · ${data.averageProgress}% average completion`} className="dashboard-projects">
        <div className="dashboard-project-summary"><div className="dashboard-progress-ring" style={{ "--progress": `${data.averageProgress}%` } as React.CSSProperties}><b>{data.averageProgress}%</b></div><span>portfolio progress</span></div>
        <div className="dashboard-chart dashboard-chart-short"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.projectStatus} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--dashboard-grid)" strokeDasharray="3 5" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--altrex-muted)", fontSize: 10 }} /><YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "var(--altrex-muted)", fontSize: 10 }} /><Tooltip /><Bar dataKey="count" name="Projects" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
        </BarChart></ResponsiveContainer></div>
      </Panel>

      <Panel title="Stock watch" detail="Items at or below reorder level" className="dashboard-stock">
        {data.lowStock.length ? <div className="dashboard-stock-list">{data.lowStock.map((item) => <div className="dashboard-stock-item" key={item.name}>
          <div><span>{item.name}</span><small>{item.stock} on hand · reorder at {item.reorder}</small></div><div className="dashboard-stock-track"><i style={{ width: `${Math.min(100, item.stock / Math.max(1, item.reorder) * 100)}%` }} /></div>
        </div>)}</div> : <div className="dashboard-empty"><PackageSearch size={25} /><span>Stock levels look healthy</span></div>}
      </Panel>

      <Panel title="Latest activity" detail="Recent sales and purchasing" className="dashboard-wide dashboard-activity-panel">
        {data.recentActivity.length ? <div className="dashboard-activity">{data.recentActivity.map((item) => <Link key={item.key} href={item.href} className="dashboard-activity-row">
          <span className="dashboard-activity-icon"><FileClock size={16} /></span><span className="dashboard-activity-name"><b>{item.label}</b><small>{item.dateLabel} · {item.status}</small></span><strong>{item.amountLabel ?? "—"}</strong><ArrowRight size={14} />
        </Link>)}</div> : <div className="dashboard-empty"><ClipboardCheck size={25} /><span>New activity will appear here</span></div>}
      </Panel>

      <Panel title="Needs attention" detail={`${dueCount} open items`} className="dashboard-attention-panel">
        <div className="dashboard-attention-grid">{data.attentionItems.map((item) => <Link key={item.label} href={item.href} className={`dashboard-attention ${item.tone}`}>
          <span className="dashboard-attention-number">{item.count}</span><span>{item.label}</span><ArrowRight size={15} />
        </Link>)}</div>
      </Panel>

    </section>
  </main>;
}
