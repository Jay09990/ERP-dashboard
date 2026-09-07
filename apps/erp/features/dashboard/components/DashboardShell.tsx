"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
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

export function DashboardShell() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
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

      {/* High Level Stat Grid */}
      <div className="altrex-stat-grid">
        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Total Monthly Sales</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", display: "grid", placeItems: "center" }}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">₹ 0.00</div>
          <span className="altrex-stat-helper">Consolidated sales revenue</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Total Purchases</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "grid", placeItems: "center" }}>
              <ShoppingBag size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">₹ 0.00</div>
          <span className="altrex-stat-helper">Vendor procurements</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Active Quotations</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", display: "grid", placeItems: "center" }}>
              <FileText size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">0</div>
          <span className="altrex-stat-helper">Pending approval or response</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Pending Deliveries</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(249, 115, 22, 0.15)", color: "#f97316", display: "grid", placeItems: "center" }}>
              <Package size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">0</div>
          <span className="altrex-stat-helper">Challans to be dispatched</span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Link
          href="/parties/customers"
          className="altrex-card"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Users size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--altrex-text)" }}>Customers Directory</div>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Manage client profiles & billing points</span>
          </div>
          <ArrowRight size={16} style={{ color: "var(--altrex-muted)" }} />
        </Link>

        <Link
          href="/parties/vendors"
          className="altrex-card"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Building2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--altrex-text)" }}>Vendors & Suppliers</div>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Supplier accounts & purchase orders</span>
          </div>
          <ArrowRight size={16} style={{ color: "var(--altrex-muted)" }} />
        </Link>

        <Link
          href="/users"
          className="altrex-card"
          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 14 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <FileCheck size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--altrex-text)" }}>Users & Access Control</div>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Role permissions & team credentials</span>
          </div>
          <ArrowRight size={16} style={{ color: "var(--altrex-muted)" }} />
        </Link>
      </div>

      {/* Activity Section */}
      <div className="altrex-card">
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "var(--altrex-text)" }}>
          Recent Activity & Operations
        </h2>
        <div style={{ padding: "40px 24px", textAlign: "center", border: "1px dashed var(--altrex-border)", borderRadius: 10 }}>
          <Clock size={32} style={{ margin: "0 auto 10px", color: "var(--altrex-muted)", opacity: 0.5, display: "block" }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>No recent transactional logs</div>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--altrex-muted)" }}>
            Activity logs and live charts will automatically update as quotations, sales orders, and invoices are generated.
          </p>
        </div>
      </div>
    </div>
  );
}
