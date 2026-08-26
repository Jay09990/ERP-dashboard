import { DataTable, FilterBar, StatCard, StatusPill } from "@altrex/ui";
import { AppShell } from "@/components/app-shell";

const recentItems = [{ id: "1", item: "Industrial fasteners", category: "Hardware", status: "Active" }];

export default function ErpHomePage() {
  return <AppShell><div className="altrex-page-header"><div><span className="altrex-eyebrow">Operations</span><h1>Dashboard</h1></div><button className="altrex-button altrex-button-primary">Create quotation</button></div><div className="altrex-stat-grid"><StatCard label="Open quotations" value="18" detail="4 due this week" /><StatCard label="Receivables" value="$42,680" detail="Current financial year" /><StatCard label="Low stock items" value="7" detail="Review inventory" /></div><FilterBar><input className="altrex-input" aria-label="Search recent items" placeholder="Search recent items" /><StatusPill status="Active" /></FilterBar><DataTable columns={[{ key: "item", label: "Item" }, { key: "category", label: "Category" }, { key: "status", label: "Status" }]} data={recentItems} /></AppShell>;
}