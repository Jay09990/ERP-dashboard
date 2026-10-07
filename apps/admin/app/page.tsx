"use client";

import { DataTable, StatCard, StatusPill, TableSkeleton } from "@/components/shared";
import { AppShell } from "@/components/app-shell";
import { useCompanies } from "@/features/companies/api";
import type { Company } from "@/features/companies/types";
import Link from "next/link";

export default function AdminHomePage() {
  const { data: companies = [], isLoading, error } = useCompanies();
  const activeCount = companies.filter((company) => company.status === "active").length;

  const columns = [
    {
      key: "company_name" as const,
      label: "Company",
      render: (company: Company) => (
        <Link href={`/companies/${company.company_id}`} className="altrex-table-link">
          {company.company_name}
        </Link>
      ),
    },
    { key: "company_code" as const, label: "Code" },
    { key: "company_email" as const, label: "Email" },
    {
      key: "status" as const,
      label: "Status",
      render: (company: Company) => <StatusPill status={company.status} />,
    },
  ];

  return (
    <AppShell>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Platform</span>
          <h1>Overview</h1>
          <p className="altrex-muted">Company accounts and platform access at a glance.</p>
        </div>
        <Link href="/company-register" className="altrex-button altrex-button-primary">
          Add company
        </Link>
      </div>

      {error && <div className="altrex-table-state altrex-table-state-error" role="alert">{error.message}</div>}

      {isLoading ? (
        <div className="altrex-stat-grid" aria-label="Loading overview" aria-busy="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="altrex-stat-card" key={index}><span className="altrex-skeleton" /><span className="altrex-skeleton" /></div>
          ))}
        </div>
      ) : (
        <div className="altrex-stat-grid">
          <StatCard label="Total companies" value={String(companies.length)} detail="Registered tenants" />
          <StatCard label="Active companies" value={String(activeCount)} detail={`${companies.length - activeCount} inactive`} />
          <StatCard label="Administrators" value={String(companies.filter((company) => company.superAdminEmail).length)} detail="Tenant super-admin contacts" />
        </div>
      )}

      <div className="altrex-page-header" style={{ marginTop: 28 }}>
        <div><h2>Registered companies</h2><p className="altrex-muted">Company accounts returned by the platform API.</p></div>
        <Link href="/companies" className="altrex-button altrex-button-neutral">View all</Link>
      </div>
      {isLoading ? <TableSkeleton columns={4} rows={4} /> : !error ? <DataTable columns={columns} data={companies.slice(0, 5)} /> : null}
    </AppShell>
  );
}
