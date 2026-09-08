import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  description,
  wide = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="altrex-auth-page">
      <section className={`altrex-auth-panel${wide ? " altrex-auth-panel-wide" : ""}`}>
        <div className="altrex-auth-mark" aria-hidden="true">
          A
        </div>
        <span className="altrex-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="altrex-auth-description">{description}</p>
        {children}
      </section>
    </main>
  );
}

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

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "No records found",
  rowKey,
}: {
  columns: {
    key: keyof T;
    label: string;
    render?: (row: T) => ReactNode;
  }[];
  data: T[];
  emptyMessage?: string;
  rowKey?: keyof T | ((row: T, index: number) => string | number);
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
            data.map((row, index) => {
              const computedKey =
                typeof rowKey === "function"
                  ? rowKey(row, index)
                  : rowKey
                  ? row[rowKey]
                  : row.id ?? row.user_id ?? row.role_id ?? row.company_id ?? index;
              return (
                <tr key={String(computedKey)}>
                  {columns.map((column) => (
                    <td key={String(column.key)}>
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              );
            })
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
