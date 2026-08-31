"use client";

import { StatusPill } from "@/components/shared";
import Link from "next/link";
import { useState } from "react";
import { useChangeCompanyStatus, useCompany } from "../api";
import { DeactivateDialog } from "./DeactivateDialog";
import { HardDeleteDialog } from "./HardDeleteDialog";

interface Props {
  companyId: string;
}

function DetailRow({
  label,
  value,
}: { label: string; value?: string | number | null }) {
  return (
    <div className="altrex-detail-row">
      <span className="altrex-detail-label">{label}</span>
      <span className="altrex-detail-value">{value ?? "—"}</span>
    </div>
  );
}

export function CompanyDetail({ companyId }: Props) {
  const { data: company, isLoading, error } = useCompany(companyId);
  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeCompanyStatus();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" aria-label="Loading company" />
        <span>Loading company…</span>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="altrex-table-state altrex-table-state-error" role="alert">
        {error?.message ?? "Company not found."}
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">
            <Link href="/companies" className="altrex-breadcrumb-link">
              Companies
            </Link>
            {" / "}
            {company.company_code}
          </span>
          <h1 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {company.company_name}
            <StatusPill status={company.status} />
          </h1>
        </div>

        {/* Actions — top-right per design.md §7 */}
        <div className="altrex-row-actions">
          {company.status === "active" ? (
            <button
              type="button"
              className="altrex-button altrex-button-warning"
              onClick={() => setShowDeactivate(true)}
            >
              Deactivate
            </button>
          ) : (
            <button
              type="button"
              className="altrex-button altrex-button-neutral"
              onClick={() =>
                changeStatus({ id: company.company_id, status: "active" })
              }
              disabled={isChangingStatus}
            >
              {isChangingStatus ? "Activating…" : "Re-activate"}
            </button>
          )}
          <button
            type="button"
            className="altrex-button altrex-button-danger"
            onClick={() => setShowHardDelete(true)}
          >
            Delete permanently
          </button>
        </div>
      </div>

      {/* Detail panels */}
      <div className="altrex-detail-grid">
        {/* Company identity */}
        <section className="altrex-detail-card">
          <h2 className="altrex-detail-card-title">Company details</h2>
          <DetailRow label="Company name" value={company.company_name} />
          <DetailRow label="Company code" value={company.company_code} />
          <DetailRow label="GST number" value={company.gst_no} />
          <DetailRow label="Email" value={company.company_email} />
          <DetailRow label="Phone" value={company.phone} />
          <DetailRow label="Address" value={company.address} />
          <DetailRow label="Database" value={company.db_name} />
        </section>

        {/* Super admin */}
        <section className="altrex-detail-card">
          <h2 className="altrex-detail-card-title">Super admin</h2>
          <DetailRow
            label="Name"
            value={
              company.superAdminFirstName
                ? `${company.superAdminFirstName} ${company.superAdminLastName ?? ""}`.trim()
                : undefined
            }
          />
          <DetailRow label="Email" value={company.superAdminEmail} />
          <DetailRow label="Phone" value={company.superAdminPhone} />
        </section>

        {/* Subscription */}
        <section className="altrex-detail-card">
          <h2 className="altrex-detail-card-title">Subscription</h2>
          <DetailRow label="Plan ID" value={company.subscription_plan_id} />
          <DetailRow label="Status" value={company.status} />
          {company.created_at && (
            <DetailRow
              label="Registered"
              value={new Date(company.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
          )}
        </section>
      </div>

      {showDeactivate && (
        <DeactivateDialog
          company={company}
          onClose={() => setShowDeactivate(false)}
        />
      )}
      {showHardDelete && (
        <HardDeleteDialog
          company={company}
          onClose={() => setShowHardDelete(false)}
        />
      )}
    </>
  );
}
