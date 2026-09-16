"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardAnalytics } from "../hooks/use-dashboard-analytics";

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  const formattedVal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(data.value);

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
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: data.payload.color,
          }}
        />
        <span style={{ fontWeight: 700 }}>{data.name}:</span>
        <span>{formattedVal}</span>
        <span style={{ color: "var(--altrex-muted)", fontSize: 11 }}>({data.payload.percentage}%)</span>
      </div>
    </div>
  );
}

export function PaymentStatusDonut() {
  const { statusData, totalInvoicedFormatted } = useDashboardAnalytics();

  return (
    <div
      className="altrex-card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "var(--altrex-surface)",
        border: "1px solid var(--altrex-border)",
        borderRadius: 12,
        padding: 20,
        height: "100%",
      }}
    >
      <div>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            margin: 0,
            color: "var(--altrex-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Payment Status Breakdown
        </h3>
        <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
          Distribution across current & overdue status
        </span>
      </div>

      <div style={{ position: "relative", width: "100%", height: 200, margin: "10px 0" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--altrex-surface)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--altrex-muted)", textTransform: "uppercase" }}>
            Total Volume
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--altrex-text)", marginTop: 2 }}>
            {totalInvoicedFormatted.split(".")[0]}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {statusData.map((item) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 6,
              background: "var(--altrex-raised)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                }}
              />
              <span style={{ fontWeight: 600, color: "var(--altrex-text)" }}>{item.name}</span>
            </div>
            <div style={{ fontWeight: 700, color: "var(--altrex-text)" }}>
              {item.percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
