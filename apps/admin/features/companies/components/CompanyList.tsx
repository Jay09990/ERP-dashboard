"use client";

import { DataTable, FilterBar, StatusPill } from "@/components/shared";
import Link from "next/link";
import { useState } from "react";
import { useChangeCompanyStatus, useCompanies } from "../api";
import type { Company } from "../types";
import { DeactivateDialog } from "./DeactivateDialog";
import { HardDeleteDialog } from "./HardDeleteDialog";

export function CompanyList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">(
    "",
  );
  const [deactivateTarget, setDeactivateTarget] = useState<Company | null>(
    null,
  );
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Company | null>(
    null,
  );

  const {
    data: companies = [],
    isLoading,
    error,
  } = useCompanies(statusFilter ? { status: statusFilter } : undefined);

  const { mutate: changeStatus } = useChangeCompanyStatus();

  const filtered = search.trim()
    ? companies.filter(
        (c) =>
          c.company_name.toLowerCase().includes(search.toLowerCase()) ||
          c.company_code.toLowerCase().includes(search.toLowerCase()) ||
          c.company_email.toLowerCase().includes(search.toLowerCase()),
      )
    : companies;

  const columns = [
    {
      key: "status" as const,
      label: "Status",
      render: (c: Company) => <StatusPill status={c.status} />,
    },
    {
      key: "company_name" as const,
      label: "Company",
      render: (c: Company) => (
        <Link href={`/companies/${c.company_id}`} className="altrex-table-link">
          {c.company_name}
        </Link>
      ),
    },
    { key: "company_code" as const, label: "Code" },
    { key: "company_email" as const, label: "Email" },
    { key: "phone" as const, label: "Phone" },
    {
      key: "company_id" as const,
      label: "Actions",
      render: (c: Company) => (
        <div className="altrex-row-actions">
          <Link
            href={`/companies/${c.company_id}`}
            className="altrex-button altrex-button-sm altrex-button-neutral"
          >
            View
          </Link>

          {c.status === "active" ? (
            <button
              type="button"
              className="altrex-button altrex-button-sm altrex-button-warning"
              onClick={() => setDeactivateTarget(c)}
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              className="altrex-button altrex-button-sm altrex-button-neutral"
              onClick={() =>
                changeStatus({ id: c.company_id, status: "active" })
              }
            >
              Re-activate
            </button>
          )}

          <button
            type="button"
            className="altrex-button altrex-button-sm altrex-button-danger"
            onClick={() => setHardDeleteTarget(c)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Page header */}
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Platform</span>
          <h1>Companies</h1>
        </div>
        <Link
          href="/company-register"
          className="altrex-button altrex-button-primary"
        >
          Add company
        </Link>
      </div>

      {/* Filter bar — sits directly above the table, per design.md §7 */}
      <FilterBar>
        <input
          className="altrex-input"
          aria-label="Search companies"
          placeholder="Search by name, code, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="altrex-input altrex-select"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "" | "active" | "inactive")
          }
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      {/* States */}
      {isLoading && (
        <div className="altrex-table-state">
          <span className="altrex-spinner" aria-label="Loading companies" />
          <span>Loading companies…</span>
        </div>
      )}

      {error && !isLoading && (
        <div
          className="altrex-table-state altrex-table-state-error"
          role="alert"
        >
          {error.message}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="altrex-table-state">
          {search || statusFilter
            ? "No companies match the current filters."
            : "No companies registered yet."}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <DataTable
          columns={columns.map((col) => ({
            key: col.key,
            label: col.label,
            // DataTable accepts a render prop per column
            ...(col.render ? { render: col.render } : {}),
          }))}
          data={filtered}
        />
      )}

      {/* Dialogs — mounted outside the table so they overlay correctly */}
      {deactivateTarget && (
        <DeactivateDialog
          company={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
        />
      )}
      {hardDeleteTarget && (
        <HardDeleteDialog
          company={hardDeleteTarget}
          onClose={() => setHardDeleteTarget(null)}
        />
      )}
    </>
  );
}
