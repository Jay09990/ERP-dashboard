import { DataTable, FilterBar, StatCard, StatusPill } from "@altrex/ui";
import { AppShell } from "@/components/app-shell";

const companies = [{ id: "1", name: "Northwind Trading", status: "Active", plan: "Growth" }];

export default function AdminHomePage() {
  return <AppShell><div className="altrex-page-header"><div><span className="altrex-eyebrow">Platform</span><h1>Overview</h1></div><button className="altrex-button altrex-button-primary">Add company</button></div><div className="altrex-stat-grid"><StatCard label="Active companies" value="24" detail="Across all plans" /><StatCard label="Pending setup" value="3" detail="Require attention" /><StatCard label="Platform status" value="Healthy" detail="All systems operational" /></div><FilterBar><input className="altrex-input" aria-label="Search companies" placeholder="Search companies" /><StatusPill status="Active" /></FilterBar><DataTable columns={[{ key: "name", label: "Company" }, { key: "status", label: "Status" }, { key: "plan", label: "Plan" }]} data={companies} /></AppShell>;
}