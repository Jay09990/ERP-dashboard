"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  BookOpen,
  Boxes,
  Building,
  ClipboardList,
  Package,
  Plus,
  Scale,
  Tag,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adjustmentApi,
  batchApi,
  stockApi,
  transferApi,
  warehouseApi,
} from "@/features/inventory/api";
import { useItems } from "@/features/items/api";
import {
  extractRecords,
  formatDisplayDate,
  formatINR,
  toNumber,
} from "@/features/dashboard/utils";

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
  icon: typeof Package;
  label: string;
  value: string;
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

export function InventoryOverview() {
  const warehouseQuery = warehouseApi.useList();
  const batchQuery = batchApi.useList();
  const stockQuery = stockApi.useSummary();
  const transferQuery = transferApi.useList();
  const adjustmentQuery = adjustmentApi.useList();
  const itemsQuery = useItems();

  const isLoading =
    warehouseQuery.isLoading ||
    batchQuery.isLoading ||
    stockQuery.isLoading ||
    transferQuery.isLoading ||
    adjustmentQuery.isLoading ||
    itemsQuery.isLoading;

  const hasError = Boolean(
    warehouseQuery.error ||
      batchQuery.error ||
      stockQuery.error ||
      transferQuery.error ||
      adjustmentQuery.error ||
      itemsQuery.error,
  );

  const stats = useMemo(() => {
    const warehouses = extractRecords(warehouseQuery.data);
    const batches = extractRecords(batchQuery.data);
    const stock = extractRecords(stockQuery.data);
    const transfers = extractRecords(transferQuery.data);
    const adjustments = extractRecords(adjustmentQuery.data);
    const items = extractRecords(itemsQuery.data);

    // Active batches
    let activeBatchesCount = 0;
    for (const b of batches) {
      const status = String(b.status ?? "active").toLowerCase();
      const isActive =
        b.is_active !== undefined ? Boolean(b.is_active) : status === "active";
      if (isActive && status !== "inactive") {
        activeBatchesCount++;
      }
    }

    // Low stock items: reorder_level > 0 && current_stock <= reorder_level
    const lowStockItems: { name: string; stock: number; reorder: number }[] = [];
    let lowStockCount = 0;
    for (const row of stock) {
      const reorder = toNumber(row.reorder_level);
      const currentStock = toNumber(row.current_stock ?? row.quantity);
      if (reorder > 0 && currentStock <= reorder) {
        lowStockCount++;
        lowStockItems.push({
          name: String(row.item_name ?? "Item"),
          stock: currentStock,
          reorder,
        });
      }
    }

    // Pending transfers: status is pending or in_transit
    let pendingTransfersCount = 0;
    for (const t of transfers) {
      const status = String(t.status ?? "").toLowerCase();
      if (status === "pending" || status === "in_transit") {
        pendingTransfersCount++;
      }
    }

    // Stock by warehouse chart series
    const warehouseStockMap = new Map<string, number>();
    for (const row of stock) {
      const whName = String(row.warehouse_name || "General");
      const currentStock = toNumber(row.current_stock ?? row.quantity);
      warehouseStockMap.set(
        whName,
        (warehouseStockMap.get(whName) || 0) + currentStock,
      );
    }
    const warehouseChartData = Array.from(
      warehouseStockMap.entries(),
    ).map(([name, stock]) => ({
      name,
      stock,
    }));

    // Recent transfers (last 5)
    const recentTransfers = [...transfers]
      .map((t) => {
        const id = String(t.id ?? t.transfer_id ?? t.stock_transfer_id ?? "");
        const transferNo = String(
          t.transfer_no || (id ? `TRF-#${id}` : "Transfer"),
        );
        const fromName = t.from_warehouse_name
          ? String(t.from_warehouse_name)
          : "";
        const toName = t.to_warehouse_name ? String(t.to_warehouse_name) : "";
        const route =
          fromName && toName ? `${fromName} → ${toName}` : fromName || toName;
        const label = route ? `${transferNo} · ${route}` : transferNo;
        const status = String(t.status ?? "draft");
        const dateStr = t.transfer_date ?? t.created_at;
        const timestamp = dateStr ? new Date(String(dateStr)).getTime() : 0;

        const itemsCount = Array.isArray(t.itemsDetails)
          ? t.itemsDetails.length
          : 0;
        const totalQty = Array.isArray(t.itemsDetails)
          ? t.itemsDetails.reduce(
              (sum: number, it: any) => sum + toNumber(it.quantity),
              0,
            )
          : 0;
        const quantityLabel =
          totalQty > 0
            ? `${totalQty} units`
            : itemsCount > 0
              ? `${itemsCount} items`
              : undefined;

        return {
          id: id || String(Math.random()),
          label,
          status,
          dateLabel: formatDisplayDate(dateStr ? String(dateStr) : null),
          quantityLabel,
          timestamp: Number.isFinite(timestamp) ? timestamp : 0,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      totalWarehouses: warehouses.length,
      activeBatches: activeBatchesCount,
      lowStockCount,
      lowStockItems,
      pendingTransfers: pendingTransfersCount,
      totalAdjustments: adjustments.length,
      totalItems: items.length || stock.length,
      totalBatches: batches.length,
      totalTransfers: transfers.length,
      totalStockEntries: stock.length,
      warehouseChartData,
      recentTransfers,
    };
  }, [
    warehouseQuery.data,
    batchQuery.data,
    stockQuery.data,
    transferQuery.data,
    adjustmentQuery.data,
    itemsQuery.data,
  ]);

  const nameDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            INVENTORY MANAGEMENT · {nameDate.toUpperCase()}
          </span>
          <h1>Inventory Overview</h1>
          <p>Real-time stock levels, warehouse inventory, batches and movements.</p>
        </div>
        <nav aria-label="Quick actions" className="dashboard-actions">
          <Link
            href="/inventory/transfers"
            className="altrex-button altrex-button-primary"
          >
            <Plus size={16} />
            New Transfer
          </Link>
          <Link
            href="/inventory/stock"
            className="altrex-button altrex-button-secondary"
          >
            <Boxes size={16} />
            Stock Summary
          </Link>
        </nav>
      </header>

      {hasError && (
        <div className="dashboard-notice">
          <AlertTriangle size={16} />
          Some inventory data could not be loaded; available figures are still shown.
        </div>
      )}
      {isLoading && (
        <output
          className="dashboard-notice dashboard-loading-notice"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="altrex-spinner" aria-hidden="true" />
          Loading inventory overview data...
        </output>
      )}

      {/* 6 Metrics cards */}
      <section className="dashboard-metrics" aria-label="Key inventory figures">
        <Metric
          icon={Building}
          label="Total Warehouses"
          value={isLoading ? "—" : String(stats.totalWarehouses)}
          foot="Active storage locations"
          tone="blue"
          href="/inventory/warehouses"
        />
        <Metric
          icon={Tag}
          label="Active Batches"
          value={isLoading ? "—" : String(stats.activeBatches)}
          foot={`${stats.totalBatches} total tracked`}
          tone="green"
          href="/inventory/batches"
        />
        <Metric
          icon={AlertTriangle}
          label="Low Stock Items"
          value={isLoading ? "—" : String(stats.lowStockCount)}
          foot="At or below reorder level"
          tone="rose"
          href="/inventory/stock"
        />
        <Metric
          icon={ArrowRightLeft}
          label="Pending Transfers"
          value={isLoading ? "—" : String(stats.pendingTransfers)}
          foot="In transit or pending"
          tone="amber"
          href="/inventory/transfers"
        />
        <Metric
          icon={Scale}
          label="Stock Adjustments"
          value={isLoading ? "—" : String(stats.totalAdjustments)}
          foot="Adjustment records"
          tone="violet"
          href="/inventory/adjustments"
        />
        <Metric
          icon={Boxes}
          label="Total Items"
          value={isLoading ? "—" : String(stats.totalItems)}
          foot="Cataloged products"
          tone="cyan"
          href="/items"
        />
      </section>

      {/* Main Grid Panels */}
      <section
        className="dashboard-main-grid"
        style={{
          gridTemplateAreas:
            '"money money stock" "activity activity network"',
        }}
      >
        {/* Panel: Stock by Warehouse BarChart */}
        <Panel
          title="Stock by Warehouse"
          detail="Total inventory distribution across locations"
          className="dashboard-wide dashboard-money"
        >
          {stats.warehouseChartData.length ? (
            <div className="dashboard-chart dashboard-chart-large">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.warehouseChartData}
                  margin={{ top: 10, right: 8, left: -14, bottom: 0 }}
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
                    tick={{ fill: "var(--altrex-muted)", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--altrex-border)",
                      background: "var(--altrex-surface)",
                    }}
                  />
                  <Bar
                    dataKey="stock"
                    name="Stock Units"
                    fill="#3b82f6"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="dashboard-empty">
              <Building size={25} />
              <span>No warehouse stock records found</span>
            </div>
          )}
        </Panel>

        {/* Panel 1: Low stock warning */}
        <Panel
          title="Stock Watch"
          detail="Items at or below reorder level"
          className="dashboard-stock"
        >
          {stats.lowStockItems.length ? (
            <div className="dashboard-stock-list">
              {stats.lowStockItems.slice(0, 6).map((item) => (
                <div className="dashboard-stock-item" key={item.name}>
                  <div>
                    <span>{item.name}</span>
                    <small>
                      {item.stock} on hand · reorder at {item.reorder}
                    </small>
                  </div>
                  <div className="dashboard-stock-track">
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            5,
                            Math.round(
                              (item.stock / Math.max(1, item.reorder)) * 100,
                            ),
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Package size={25} />
              <span>Stock levels look healthy</span>
            </div>
          )}
        </Panel>

        {/* Panel 2: Recent transfers */}
        <Panel
          title="Recent Transfers"
          detail="Latest inventory movements"
          className="dashboard-wide dashboard-activity-panel"
        >
          {stats.recentTransfers.length ? (
            <div className="dashboard-activity">
              {stats.recentTransfers.map((item) => (
                <Link
                  key={item.id}
                  href="/inventory/transfers"
                  className="dashboard-activity-row"
                >
                  <span className="dashboard-activity-icon">
                    <ArrowRightLeft size={16} />
                  </span>
                  <span className="dashboard-activity-name">
                    <b>{item.label}</b>
                    <small>
                      {item.dateLabel} · {item.status}
                    </small>
                  </span>
                  <strong>{item.quantityLabel ?? "—"}</strong>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <ClipboardList size={25} />
              <span>No recent transfers recorded</span>
            </div>
          )}
        </Panel>

        {/* Panel 3: Quick links */}
        <Panel
          title="Quick Links"
          detail="Access inventory registers"
          className="dashboard-network-panel"
        >
          <div className="dashboard-network">
            <Link href="/items">
              <Boxes size={17} />
              <span>Items</span>
              <b>{stats.totalItems}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/warehouses">
              <Building size={17} />
              <span>Warehouses</span>
              <b>{stats.totalWarehouses}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/batches">
              <Tag size={17} />
              <span>Batches</span>
              <b>{stats.totalBatches}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/transfers">
              <ArrowRightLeft size={17} />
              <span>Transfers</span>
              <b>{stats.totalTransfers}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/adjustments">
              <Scale size={17} />
              <span>Adjustments</span>
              <b>{stats.totalAdjustments}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/stock">
              <ClipboardList size={17} />
              <span>Stock Summary</span>
              <b>{stats.totalStockEntries}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/inventory/ledger">
              <BookOpen size={17} />
              <span>Stock Ledger</span>
              <b>View</b>
              <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>
      </section>
    </main>
  );
}
