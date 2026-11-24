"use client";

import { extractRecords } from "@/features/dashboard/utils";
import { useCustomers } from "@/features/parties/customers/api";
import { useVendors } from "@/features/parties/vendors/api";
import {
  ArrowRight,
  Building,
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserCheck,
  Users2,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Panel({
  title,
  detail,
  children,
  className = "",
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="dashboard-panel-heading">
        <div>
          <h2>{title}</h2>
          {detail && <span>{detail}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  foot,
  tone,
  href,
}: {
  icon: typeof UserCheck;
  label: string;
  value: string | number;
  foot: string;
  tone: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="dashboard-metric-top">
        <span>{label}</span>
        <i className={`dashboard-icon ${tone}`}>
          <Icon size={17} />
        </i>
      </div>
      <strong>{value}</strong>
      <small>{foot}</small>
    </>
  );
  return href ? (
    <Link className="dashboard-metric dashboard-panel" href={href}>
      {content}
    </Link>
  ) : (
    <div className="dashboard-metric dashboard-panel">{content}</div>
  );
}

function getPartyLocation(party: Record<string, unknown>): string {
  if (party.city_name && party.state_name) {
    return `${party.city_name}, ${party.state_name}`;
  }
  if (party.city_name) return String(party.city_name);
  if (party.state_name) return String(party.state_name);
  if (party.city && party.state) return `${party.city}, ${party.state}`;
  if (party.city) return String(party.city);
  if (party.state) return String(party.state);

  const addresses = (party.addresses || party.tbl_party_addresses) as
    | Record<string, unknown>[]
    | undefined;
  if (Array.isArray(addresses) && addresses.length > 0) {
    const first = addresses[0];
    if (first.city_name && first.state_name) {
      return `${first.city_name}, ${first.state_name}`;
    }
    if (first.city_name) return String(first.city_name);
    if (first.state_name) return String(first.state_name);
    if (first.city && first.state) return `${first.city}, ${first.state}`;
    if (first.city) return String(first.city);
    if (first.state) return String(first.state);
  }
  return "Location not set";
}

function getPartyName(party: Record<string, unknown>): string {
  return String(
    party.party_name || party.company_name || party.name || "Unnamed Party",
  );
}

function getPartyGst(party: Record<string, unknown>): string {
  return String(party.gst_no || party.gstin || "—");
}

function isPartyActive(item: Record<string, unknown>): boolean {
  return (
    item.is_active === true ||
    item.status === "active" ||
    item.status === "Active" ||
    (typeof item.status === "string" && item.status.toLowerCase() === "active")
  );
}

export function PartiesOverview() {
  const customersQuery = useCustomers();
  const vendorsQuery = useVendors();

  const customers = extractRecords(customersQuery.data);
  const vendors = extractRecords(vendorsQuery.data);

  const activeCustomers = customers.filter(isPartyActive);
  const activeVendors = vendors.filter(isPartyActive);

  const recentCustomers = customers.slice(-8).reverse();
  const recentVendors = vendors.slice(-8).reverse();

  const isLoading = customersQuery.isLoading || vendorsQuery.isLoading;
  const hasError = customersQuery.isError || vendorsQuery.isError;

  const chartData = [
    {
      name: "Customers",
      total: customers.length,
      active: activeCustomers.length,
    },
    {
      name: "Vendors",
      total: vendors.length,
      active: activeVendors.length,
    },
  ];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            PARTIES & CONTACTS · DIRECTORY
          </span>
          <h1>Parties Overview</h1>
          <p>
            Manage customer accounts, vendor relationships, and enterprise
            contacts.
          </p>
        </div>
        <nav aria-label="Quick actions" className="dashboard-actions">
          <Link
            href="/parties/customers"
            className="altrex-button altrex-button-primary"
          >
            <Plus size={16} />
            New Customer
          </Link>
          <Link
            href="/parties/vendors"
            className="altrex-button altrex-button-secondary"
          >
            <Building size={16} />
            New Vendor
          </Link>
        </nav>
      </header>

      {hasError && (
        <div className="dashboard-notice">
          Some party data could not be loaded; available figures are still
          shown.
        </div>
      )}
      {isLoading && (
        <output
          className="dashboard-notice dashboard-loading-notice"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="altrex-spinner" aria-hidden="true" />
          Loading party directory data...
        </output>
      )}

      <section
        className="dashboard-metrics"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        aria-label="Key party metrics"
      >
        <Metric
          icon={Users2}
          label="Total Customers"
          value={isLoading ? "—" : customers.length}
          foot={`${activeCustomers.length} active`}
          tone="blue"
          href="/parties/customers"
        />
        <Metric
          icon={Building2}
          label="Total Vendors"
          value={isLoading ? "—" : vendors.length}
          foot={`${activeVendors.length} active`}
          tone="violet"
          href="/parties/vendors"
        />
        <Metric
          icon={UserCheck}
          label="Active Customers"
          value={isLoading ? "—" : activeCustomers.length}
          foot={
            customers.length
              ? `${Math.round((activeCustomers.length / customers.length) * 100)}% of total`
              : "0% of total"
          }
          tone="green"
          href="/parties/customers"
        />
        <Metric
          icon={Building}
          label="Active Vendors"
          value={isLoading ? "—" : activeVendors.length}
          foot={
            vendors.length
              ? `${Math.round((activeVendors.length / vendors.length) * 100)}% of total`
              : "0% of total"
          }
          tone="amber"
          href="/parties/vendors"
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 12,
        }}
      >
        {/* Customer list panel */}
        <Panel
          title="Recent Customers"
          detail="Latest registered customer accounts"
        >
          {recentCustomers.length ? (
            <div className="dashboard-activity">
              {recentCustomers.map((c, idx) => {
                const id = String(c.id ?? c.party_id ?? idx);
                const name = getPartyName(c);
                const gst = getPartyGst(c);
                const location = getPartyLocation(c);

                return (
                  <Link
                    key={`customer-${id}-${idx}`}
                    href="/parties/customers"
                    className="dashboard-activity-row"
                  >
                    <span className="dashboard-activity-icon">
                      <UserCheck size={16} />
                    </span>
                    <span className="dashboard-activity-name">
                      <b>{name}</b>
                      <small>
                        <MapPin
                          size={10}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 3,
                          }}
                        />
                        {location}
                      </small>
                    </span>
                    <strong>{gst}</strong>
                    <ArrowRight size={14} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Users2 size={25} />
              <span>No customers registered yet</span>
            </div>
          )}
        </Panel>

        {/* Vendor list panel */}
        <Panel
          title="Recent Vendors"
          detail="Latest registered vendor accounts"
        >
          {recentVendors.length ? (
            <div className="dashboard-activity">
              {recentVendors.map((v, idx) => {
                const id = String(v.id ?? v.party_id ?? idx);
                const name = getPartyName(v);
                const gst = getPartyGst(v);
                const location = getPartyLocation(v);

                return (
                  <Link
                    key={`vendor-${id}-${idx}`}
                    href="/parties/vendors"
                    className="dashboard-activity-row"
                  >
                    <span className="dashboard-activity-icon">
                      <Building size={16} />
                    </span>
                    <span className="dashboard-activity-name">
                      <b>{name}</b>
                      <small>
                        <MapPin
                          size={10}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 3,
                          }}
                        />
                        {location}
                      </small>
                    </span>
                    <strong>{gst}</strong>
                    <ArrowRight size={14} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Building2 size={25} />
              <span>No vendors registered yet</span>
            </div>
          )}
        </Panel>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 12,
        }}
      >
        {/* Parties distribution chart */}
        <Panel
          title="Parties Breakdown"
          detail="Active vs total account comparison"
        >
          <div className="dashboard-chart dashboard-chart-short">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--dashboard-grid)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--altrex-border)",
                    background: "var(--altrex-surface)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="active"
                  name="Active"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="dashboard-chart-legend">
            <span>
              <i
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  display: "inline-block",
                }}
              />
              Total
            </span>
            <span>
              <i
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
              Active
            </span>
          </div>
        </Panel>

        {/* Quick links panel */}
        <Panel
          title="Directory Access"
          detail="Quick navigation to full party directories"
          className="dashboard-network-panel"
        >
          <div className="dashboard-network">
            <Link href="/parties/customers">
              <UserCheck size={17} />
              <span>Customers Directory</span>
              <b>{customers.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/parties/vendors">
              <Building size={17} />
              <span>Vendors Directory</span>
              <b>{vendors.length}</b>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 18,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--altrex-border)",
              fontSize: 11,
              color: "var(--altrex-muted)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Phone size={12} /> Contact directories
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Mail size={12} /> Email billing & notices
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <MapPin size={12} /> Addresses & GST records
            </span>
          </div>
        </Panel>
      </section>
    </main>
  );
}
