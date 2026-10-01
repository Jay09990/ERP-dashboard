"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type MetricTypeOption,
  type TimeframeOption,
  useDashboardAnalytics,
} from "../hooks/use-dashboard-analytics";

const TIMEFRAME_LABELS: Record<TimeframeOption, string> = {
  "30d": "30 DAYS",
  "90d": "90 DAYS",
  "6mo": "6 MONTHS",
  "1yr": "1 YEAR",
  all: "ALL TIME",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "var(--altrex-surface, #ffffff)",
        border: "1px solid var(--altrex-border, #cbd5e1)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
        color: "var(--altrex-text, #0f172a)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 4,
          color: "var(--altrex-text, #0f172a)",
        }}
      >
        {label}
      </div>
      {payload.map((entry: any, index: number) => {
        const isInv = entry.dataKey === "invoiced";
        const color = isInv ? "#10b981" : "#3b82f6";
        const labelText = isInv ? "Invoiced" : "Paid";
        const valStr = new Intl.NumberFormat("en-IN").format(entry.value);

        return (
          <div
            key={`item-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              margin: "2px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: color,
              }}
            />
            <span style={{ color: "var(--altrex-muted, #64748b)" }}>
              {labelText}:
            </span>
            <span style={{ fontWeight: 700 }}>{valStr}</span>
          </div>
        );
      })}
    </div>
  );
}

export function InvoicedVsPaidChart() {
  const {
    timeframe,
    setTimeframe,
    metricType,
    setMetricType,
    totalInvoicedFormatted,
    totalPaidFormatted,
    totalCurrentFormatted,
    totalOverdueFormatted,
    chartData,
    isLoading,
  } = useDashboardAnalytics();

  return (
    <div
      className="altrex-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "var(--altrex-surface)",
        border: "1px solid var(--altrex-border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      {/* Header Metric Row + Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          borderBottom: "1px solid var(--altrex-line)",
          paddingBottom: 16,
        }}
      >
        {/* Left Stats */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--altrex-muted)",
                textTransform: "uppercase",
              }}
            >
              INVOICED
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#10b981",
                marginTop: 2,
              }}
            >
              {totalInvoicedFormatted}
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--altrex-muted)",
              alignSelf: "center",
            }}
          >
            VS
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--altrex-muted)",
                textTransform: "uppercase",
              }}
            >
              PAID ({TIMEFRAME_LABELS[timeframe]})
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#3b82f6",
                marginTop: 2,
              }}
            >
              {totalPaidFormatted}
            </div>
          </div>
        </div>

        {/* Right Stats & Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--altrex-muted)",
                textTransform: "uppercase",
              }}
            >
              CURRENT
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--altrex-text)",
                marginTop: 2,
              }}
            >
              {totalCurrentFormatted}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--altrex-muted)",
                textTransform: "uppercase",
              }}
            >
              OVERDUE
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#ef4444",
                marginTop: 2,
              }}
            >
              {totalOverdueFormatted}
            </div>
          </div>

          {/* Filter Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--altrex-raised)",
              padding: 4,
              borderRadius: 8,
              border: "1px solid var(--altrex-line)",
            }}
          >
            <select
              value={metricType}
              onChange={(e) =>
                setMetricType(e.target.value as MetricTypeOption)
              }
              style={{
                background: "transparent",
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--altrex-text)",
                padding: "4px 8px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="sales">Sales Invoices</option>
              <option value="purchases">Purchase Bills</option>
              <option value="combined">Combined Total</option>
            </select>

            <div
              style={{ width: 1, height: 16, background: "var(--altrex-line)" }}
            />

            {(["30d", "90d", "6mo", "1yr"] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                style={{
                  border: "none",
                  background:
                    timeframe === tf ? "var(--altrex-surface)" : "transparent",
                  color:
                    timeframe === tf
                      ? "var(--altrex-primary)"
                      : "var(--altrex-muted)",
                  boxShadow:
                    timeframe === tf ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ width: "100%", height: 280, position: "relative" }}>
        {isLoading ? (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              color: "var(--altrex-muted)",
              fontSize: 13,
            }}
          >
            Loading chart data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--altrex-line, #e2e8f0)"
                vertical={false}
              />

              <XAxis
                dataKey="dateLabel"
                stroke="var(--altrex-muted, #64748b)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "var(--altrex-line)" }}
              />

              <YAxis
                stroke="var(--altrex-muted, #64748b)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 10000000) return `${val / 10000000}0M`;
                  if (val >= 100000) return `${val / 100000}L`;
                  if (val >= 1000) return `${val / 1000}k`;
                  return `${val}`;
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: 10,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              <Area
                type="monotone"
                dataKey="invoiced"
                name="Invoiced"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#invoicedGrad)"
              />

              <Area
                type="monotone"
                dataKey="paid"
                name="Paid"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#paidGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
