"use client";

import {
  DataTable,
  FilterBar,
  StatusPill,
  TableSkeleton,
} from "@/components/shared";
import Link from "next/link";
import { useMemo, useState } from "react";
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

  const { data: companies = [], isLoading, error } = useCompanies();

  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeCompanyStatus();

  // Performance Optimization: Hoist query normalization outside filter loop,
  // fast-path empty filters in O(1) time without array traversal, and memoize
  // filtered results to prevent redundant filtering when opening/closing dialogs.
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query && !statusFilter) return companies;

    return companies.filter((company) => {
      const matchesStatus = !statusFilter || company.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;

      return (
        company.company_name?.toLowerCase().includes(query) ||
        company.company_code?.toLowerCase().includes(query) ||
        company.company_email?.toLowerCase().includes(query)
      );
    });
  }, [companies, search, statusFilter]);

  // Memoize column metadata to preserve reference stability across renders
  // and eliminate allocating duplicate column wrapper objects on every frame.
  const columns = useMemo(
    () => [
      {
        key: "status" as const,
        label: "Status",
        render: (c: Company) => <StatusPill status={c.status} />,
      },
      {
        key: "company_name" as const,
        label: "Company",
        render: (c: Company) => (
          <Link
            href={`/companies/${c.company_id}`}
            className="altrex-table-link"
          >
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
                disabled={isChangingStatus}
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
    ],
    [changeStatus, isChangingStatus],
  );

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
      {isLoading && <TableSkeleton columns={6} />}

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
        <DataTable columns={columns} data={filtered} rowKey="company_id" />
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
