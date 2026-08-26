import type { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "neutral";
}) {
  return (
    <button className={`altrex-button altrex-button-${variant}`} {...props}>
      {children}
    </button>
  );
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No records found",
}: {
  columns: { key: keyof T; label: string }[];
  data: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="altrex-table-wrap">
      <table className="altrex-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="altrex-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {String(row[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`altrex-status altrex-status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="altrex-filter-bar">{children}</div>;
}

export function StatCard({
  label,
  value,
  detail,
}: { label: string; value: string; detail?: string }) {
  return (
    <section className="altrex-stat-card">
      <span className="altrex-label">{label}</span>
      <strong>{value}</strong>
      {detail ? <span className="altrex-muted">{detail}</span> : null}
    </section>
  );
}
