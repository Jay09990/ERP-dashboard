"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";

function CustomBarTooltip({ active, payload, label }: any) {
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
      <div style={{ fontWeight: 700, marginBottom: 4 }}>
        {label} Financial Comparison
      </div>
      {payload.map((entry: any, idx: number) => {
        const valStr = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(entry.value);

        return (
          <div
            key={`bar-${idx}`}
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
                backgroundColor: entry.color,
              }}
            />
            <span style={{ color: "var(--altrex-muted)" }}>{entry.name}:</span>
            <span style={{ fontWeight: 700 }}>{valStr}</span>
          </div>
        );
      })}
    </div>
  );
}

export function SalesVsPurchaseBarChart() {
  const { monthlyComparison } = useDashboardAnalytics();

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 800,
              margin: 0,
              color: "var(--altrex-text)",
            }}
          >
            Monthly Sales vs Purchases Comparison
          </h3>
          <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
            Monthly revenue generated vs vendor procurement spend
          </span>
        </div>
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyComparison}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--altrex-line)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="var(--altrex-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--altrex-line)" }}
            />
            <YAxis
              stroke="var(--altrex-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                if (val >= 10000000) return `${val / 10000000}Cr`;
                if (val >= 100000) return `${val / 100000}L`;
                return `${val / 1000}k`;
              }}
            />
            <Tooltip content={<CustomBarTooltip />} />
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
            <Bar
              dataKey="sales"
              name="Sales Revenue"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="purchases"
              name="Purchases Spend"
              fill="#a855f7"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
