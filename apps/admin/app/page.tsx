"use client";

import { DataTable, FilterBar, StatCard, StatusPill } from "@altrex/ui";
import { AppShell } from "@/components/app-shell";
import { useCompanies } from "@/features/companies/api";

export default function AdminHomePage() {
  const { data: fetchedCompanies = [] } = useCompanies();
  const actualCompanies = Array.isArray(fetchedCompanies) ? fetchedCompanies : [];

  const activeCount = actualCompanies.filter((c) => c.status === "active").length;
  const totalCount = actualCompanies.length;

  return <AppShell><div className="altrex-page-header"><div><span className="altrex-eyebrow">Platform</span><h1>Overview</h1></div><button className="altrex-button altrex-button-primary">Add company</button></div><div className="altrex-stat-grid"><StatCard label="Active companies" value={activeCount} detail={`of ${totalCount} total`} /><StatCard label="Pending setup" value="0" detail="All companies configured" /><StatCard label="Platform status" value="Healthy" detail="All systems operational" /></div><FilterBar><input className="altrex-input" aria-label="Search companies" placeholder="Search companies" /><StatusPill status="Active" /></FilterBar><DataTable columns={[{ key: "name", label: "Company" }, { key: "status", label: "Status" }, { key: "plan", label: "Plan" }]} data={actualCompanies} /></AppShell>;
}