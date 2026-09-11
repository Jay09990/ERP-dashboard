"use client";

import {
  ArrowRight,
  Building2,
  Clock,
  FileCheck,
  FileText,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { useDashboardOverview } from "../hooks/use-dashboard-overview";

function StatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isPositive =
    normalized === "approved" ||
    normalized === "sent" ||
    normalized === "paid" ||
    normalized === "delivered" ||
    normalized === "completed";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        background: isPositive ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
        color: isPositive ? "#10b981" : "#f59e0b",
      }}
    >
      {status}
    </span>
  );
}

export function DashboardShell() {
  const overview = useDashboardOverview();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Enterprise Operations</span>
          <h1>Dashboard Overview</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/parties/customers" className="altrex-button altrex-button-primary">
            <Plus size={16} />
            <span>Add Customer</span>
          </Link>
          <Link href="/parties/vendors" className="altrex-button altrex-button-secondary">
            <Building2 size={16} />
            <span>Add Vendor</span>
          </Link>
        </div>
      </div>

      {overview.hasError ? (
        <div className="altrex-table-state altrex-table-state-error">
          Some dashboard metrics could not be loaded. Counts below use whatever responses succeeded.
        </div>
      ) : null}

      <div className="altrex-stat-grid">
        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Total Monthly Sales</div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(34, 197, 94, 0.15)",
                color: "#22c55e",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {overview.isLoading ? "…" : overview.monthlySalesLabel}
          </div>
          <span className="altrex-stat-helper">
            {overview.isLoading
              ? "Loading sales invoices…"
              : `${overview.monthlySalesCount} invoice${overview.monthlySalesCount === 1 ? "" : "s"} this month`}
          </span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Total Purchases</div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(59, 130, 246, 0.15)",
                color: "#3b82f6",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShoppingBag size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {overview.isLoading ? "…" : overview.monthlyPurchasesLabel}
          </div>
          <span className="altrex-stat-helper">
            {overview.isLoading
              ? "Loading purchase invoices…"
              : `${overview.monthlyPurchasesCount} bill${overview.monthlyPurchasesCount === 1 ? "" : "s"} this month`}
          </span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Active Quotations</div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
                display: "grid",
                placeItems: "center",
              }}
            >
              <FileText size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">{overview.isLoading ? "…" : overview.activeQuotations}</div>
          <span className="altrex-stat-helper">Open / pending customer quotes</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Pending Deliveries</div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(249, 115, 22, 0.15)",
                color: "#f97316",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Package size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">{overview.isLoading ? "…" : overview.pendingDeliveries}</div>
          <span className="altrex-stat-helper">Challans not yet completed</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Link
          href="/parties/customers"
          className="altrex-card"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(59, 130, 246, 0.15)",
              color: "#3b82f6",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Users size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--altrex-text)" }}>Customers Directory</div>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
              {overview.isLoading ? "Loading…" : `${overview.customerCount} customer${overview.customerCount === 1 ? "" : "s"}`}
            </span>
          </div>
          <ArrowRight size={16} style={{ color: "var(--altrex-muted)" }} />
        </Link>

        <Link
          href="/parties/vendors"
          className="altrex-card"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(168, 85, 247, 0.15)",
              color: "#a855f7",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Building2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--altrex-text)" }}>Vendors & Suppliers</div>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
              {overview.isLoading ? "Loading…" : `${overview.vendorCount} vendor${overview.vendorCount === 1 ? "" : "s"}`}
            </span>
          </div>
          <ArrowRight size={16} style={{ color: "var(--altrex-muted)" }} />
        </Link>

        <Link
          href="/users"
          className="altrex-card"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(34, 197, 94, 0.15)",
              color: "#22c55e",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <FileCheck size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--altrex-text)" }}>Users & Access Control</div>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Role permissions & team credentials</span>
          </div>
          <ArrowRight size={16} style={{ color: "var(--altrex-muted)" }} />
        </Link>
      </div>

      <div className="altrex-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--altrex-text)" }}>
            Recent Activity & Operations
          </h2>
          {!overview.isLoading && overview.recentActivity.length > 0 ? (
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Latest {overview.recentActivity.length}</span>
          ) : null}
        </div>

        {overview.isLoading ? (
          <div className="altrex-table-state">
            <span className="altrex-spinner" />
            <span>Loading recent documents…</span>
          </div>
        ) : overview.recentActivity.length === 0 ? (
          <div
            style={{
              padding: "40px 24px",
              textAlign: "center",
              border: "1px dashed var(--altrex-border)",
              borderRadius: 10,
            }}
          >
            <Clock
              size={32}
              style={{ margin: "0 auto 10px", color: "var(--altrex-muted)", opacity: 0.5, display: "block" }}
            />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>
              No recent transactional logs
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--altrex-muted)" }}>
              Activity appears here as quotations, orders, invoices, and challans are created.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {overview.recentActivity.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--altrex-line)",
                  background: "var(--altrex-raised)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(37,99,235,0.1)",
                    color: "var(--altrex-primary)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>
                      {item.label}
                      {item.id ? ` #${item.id}` : ""}
                    </span>
                    <StatusChip status={item.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--altrex-muted)", marginTop: 2 }}>
                    {item.dateLabel}
                    {item.amountLabel ? ` · ${item.amountLabel}` : ""}
                  </div>
                </div>
                <ArrowRight size={15} style={{ color: "var(--altrex-muted)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
