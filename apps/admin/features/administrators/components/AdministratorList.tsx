"use client";

import {
  DataTable,
  FilterBar,
  StatusPill,
  TableSkeleton,
} from "@/components/shared";
import { useCompanies } from "@/features/companies/api";
import type { Company } from "@/features/companies/types";
import Link from "next/link";
import { useMemo, useState } from "react";

/** Lists tenant super-admin contacts included in the platform company records. */
type TenantAdministrator = {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyId: number;
  companyStatus: Company["status"];
};

function getTenantAdministrators(companies: Company[]): TenantAdministrator[] {
  return companies.flatMap((company) => {
    if (!company.superAdminEmail) return [];
    const name = [company.superAdminFirstName, company.superAdminLastName]
      .filter(Boolean)
      .join(" ");
    return [
      {
        id: company.company_id,
        name: name || "Name unavailable",
        email: company.superAdminEmail,
        phone: company.superAdminPhone ?? "",
        companyName: company.company_name,
        companyId: company.company_id,
        companyStatus: company.status,
      },
    ];
  });
}

export function AdministratorList() {
  const [search, setSearch] = useState("");
  const { data: companies = [], isLoading, error } = useCompanies();
  const administrators = useMemo(
    () => getTenantAdministrators(companies),
    [companies],
  );
  const filtered = administrators.filter((admin) =>
    `${admin.name} ${admin.email} ${admin.phone} ${admin.companyName}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const columns = [
    { key: "name" as const, label: "Administrator" },
    { key: "email" as const, label: "Email" },
    { key: "phone" as const, label: "Phone" },
    {
      key: "companyName" as const,
      label: "Company",
      render: (admin: TenantAdministrator) => (
        <Link
          className="altrex-table-link"
          href={`/companies/${admin.companyId}`}
        >
          {admin.companyName}
        </Link>
      ),
    },
    {
      key: "companyStatus" as const,
      label: "Company status",
      render: (admin: TenantAdministrator) => (
        <StatusPill status={admin.companyStatus} />
      ),
    },
  ];

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Platform</span>
          <h1>Administrators</h1>
          <p className="altrex-muted">
            Tenant super-admin contacts created during company setup.
          </p>
        </div>
      </div>
      <div className="altrex-table-state" role="note">
        This directory uses the super-admin details returned with company
        records. The documented API has no separate administrator management
        endpoint.
      </div>
      <FilterBar>
        <input
          className="altrex-input"
          aria-label="Search administrators"
          placeholder="Search name, email, phone, or company"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </FilterBar>
      {error ? (
        <div
          className="altrex-table-state altrex-table-state-error"
          role="alert"
        >
          {error.message}
        </div>
      ) : isLoading ? (
        <TableSkeleton columns={5} />
      ) : filtered.length === 0 ? (
        <div className="altrex-table-state">
          {administrators.length === 0
            ? "No tenant administrator details were returned by the company API."
            : "No administrators match this search."}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} rowKey="id" />
      )}
    </>
  );
}
