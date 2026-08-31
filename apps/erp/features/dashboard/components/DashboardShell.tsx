"use client";

import { StatCard } from "@altrex/ui";

export function DashboardShell() {
  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Overview</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="altrex-stat-grid">
        <StatCard label="Total Sales" value="₹0.00" detail="This month" />
        <StatCard label="Total Purchases" value="₹0.00" detail="This month" />
        <StatCard
          label="Active Quotations"
          value="0"
          detail="Pending approval"
        />
        <StatCard
          label="Pending Deliveries"
          value="0"
          detail="To be dispatched"
        />
      </div>

      <section className="altrex-detail-card" style={{ minHeight: "240px" }}>
        <h2 className="altrex-detail-card-title">Recent Activity</h2>
        <div
          className="altrex-table-state"
          style={{ border: "none", padding: "64px 24px" }}
        >
          <span className="altrex-muted" style={{ fontSize: "14px" }}>
            No recent activity yet. Transactional charts will display here as
            sales and purchase orders are logged.
          </span>
        </div>
      </section>
    </>
  );
}
