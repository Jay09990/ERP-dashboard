"use client";

/** Company profile view for platform admins, including tenant and subscription details. */

import { StatusPill } from "@/components/shared";
import { ArrowLeft, Building2, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useChangeCompanyStatus, useCompany } from "../api";
import { DeactivateDialog } from "./DeactivateDialog";
import { HardDeleteDialog } from "./HardDeleteDialog";

interface Props {
  companyId: string;
}

const COMPANY_SKELETON_FIELDS = [
  "name",
  "code",
  "tax",
  "email",
  "phone",
  "database",
  "address",
] as const;
const SIDE_SKELETON_FIELDS = ["first", "second", "third"] as const;

function DetailRow({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: string | number | null;
  wide?: boolean;
}) {
  return (
    <div
      className={`admin-company-detail-row${wide ? " admin-company-detail-row-wide" : ""}`}
    >
      <dt>{label}</dt>
      <dd>
        {value === null || value === undefined || value === "" ? (
          <span className="admin-company-value-empty">Not provided</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function DetailSection({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-company-card ${className}`}>
      <header className="admin-company-card-heading">
        <span className="admin-company-card-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function formatRegistrationDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CompanyDetailSkeleton() {
  return (
    <div
      className="admin-company-page"
      aria-label="Loading company"
      aria-busy="true"
    >
      <div className="admin-company-skeleton-header">
        <span className="altrex-skeleton" />
        <span className="altrex-skeleton" />
        <span className="altrex-skeleton" />
      </div>
      <div className="admin-company-content-grid">
        <div className="admin-company-card admin-company-skeleton-card">
          {COMPANY_SKELETON_FIELDS.map((field) => (
            <span className="altrex-skeleton" key={field} />
          ))}
        </div>
        <div className="admin-company-side-stack">
          {["administrator", "subscription"].map((section) => (
            <div
              className="admin-company-card admin-company-skeleton-card"
              key={section}
            >
              {SIDE_SKELETON_FIELDS.map((field) => (
                <span className="altrex-skeleton" key={`${section}-${field}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading company details</span>
    </div>
  );
}

export function CompanyDetail({ companyId }: Props) {
  const { data: company, isLoading, error } = useCompany(companyId);
  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeCompanyStatus();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showHardDelete, setShowHardDelete] = useState(false);

  if (isLoading) return <CompanyDetailSkeleton />;

  if (error || !company) {
    return (
      <div className="admin-company-error" role="alert">
        <span className="admin-company-card-icon">
          <Building2 size={20} />
        </span>
        <div>
          <h1>Company details unavailable</h1>
          <p>{error?.message ?? "Company not found."}</p>
          <Link
            href="/companies"
            className="altrex-button altrex-button-neutral"
          >
            <ArrowLeft size={16} /> Back to companies
          </Link>
        </div>
      </div>
    );
  }

  const administratorName = [
    company.superAdminFirstName,
    company.superAdminLastName,
  ]
    .filter(Boolean)
    .join(" ");
  const hasAdministratorDetails = Boolean(
    administratorName || company.superAdminEmail || company.superAdminPhone,
  );

  return (
    <div className="admin-company-page">
      <header className="admin-company-header">
        <div className="admin-company-heading-copy">
          <Link href="/companies" className="admin-company-back-link">
            <ArrowLeft size={15} /> Companies
          </Link>
          <div className="admin-company-title-row">
            <div className="admin-company-avatar" aria-hidden="true">
              {(company.company_name || "C").slice(0, 1).toUpperCase()}
            </div>
            <div className="admin-company-title-copy">
              <div className="admin-company-kicker">
                Company profile · {company.company_code}
              </div>
              <div className="admin-company-name-row">
                <h1>{company.company_name}</h1>
                <StatusPill status={company.status} />
              </div>
              <p>Platform account details and tenant access</p>
            </div>
          </div>
        </div>

        <div className="admin-company-actions">
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
      </header>

      <div className="admin-company-content-grid">
        <DetailSection
          title="Company details"
          description="Registered business and tenant database"
          icon={<Building2 size={19} />}
          className="admin-company-primary-card"
        >
          <dl className="admin-company-detail-grid">
            <DetailRow label="Company name" value={company.company_name} />
            <DetailRow label="Company code" value={company.company_code} />
            <DetailRow label="GST number" value={company.gst_no} />
            <DetailRow label="Email" value={company.company_email} />
            <DetailRow label="Phone" value={company.phone} />
            <DetailRow label="Database name" value={company.db_name} wide />
            <DetailRow label="Address" value={company.address} wide />
          </dl>
        </DetailSection>

        <div className="admin-company-side-stack">
          <DetailSection
            title="Super admin"
            description="Primary tenant administrator"
            icon={<ShieldCheck size={19} />}
          >
            {hasAdministratorDetails ? (
              <dl className="admin-company-detail-list">
                <DetailRow label="Name" value={administratorName} />
                <DetailRow label="Email" value={company.superAdminEmail} />
                <DetailRow label="Phone" value={company.superAdminPhone} />
              </dl>
            ) : (
              <p className="admin-company-empty-note">
                Administrator contact details were not included in this
                response.
              </p>
            )}
          </DetailSection>

          <DetailSection
            title="Subscription"
            description="Plan and account status"
            icon={<CreditCard size={19} />}
          >
            <dl className="admin-company-detail-list">
              <DetailRow
                label="Plan"
                value={
                  company.subscription_plan_id
                    ? `Plan ${company.subscription_plan_id}`
                    : undefined
                }
              />
              <DetailRow
                label="Account status"
                value={company.status === "active" ? "Active" : "Inactive"}
              />
              <DetailRow
                label="Registered"
                value={formatRegistrationDate(company.created_at)}
              />
            </dl>
          </DetailSection>
        </div>
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
    </div>
  );
}
