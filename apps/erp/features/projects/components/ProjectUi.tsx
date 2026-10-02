"use client";

import { Button } from "@altrex/ui";
import { X } from "lucide-react";
import { useState } from "react";

export type FieldDefinition = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "json" | "select";
  required?: boolean;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
};

export function extractRecords<T>(
  value: unknown,
  seen = new Set<unknown>(),
): T[] {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);

  const record = value as Record<string, unknown>;
  for (const key of [
    "projects",
    "project",
    "project_sites",
    "project_boq_items",
    "project_milestones",
    "project_tasks",
    "project_documents",
    "projectDocuments",
    "projectSites",
    "boqItems",
    "milestones",
    "tasks",
    "costBudget",
    "documents",
    "dpr",
    "daily_progress_reports",
    "dailyProgressReports",
    "reports",
    "requisitions",
    "purchase_requisitions",
    "grns",
    "goods_receipts",
    "site_issues",
    "siteIssues",
    "issues",
    "items",
    "rows",
    "records",
    "data",
    "result",
    "payload",
  ]) {
    if (key in record) {
      const result = extractRecords<T>(record[key], seen);
      if (result.length > 0) return result;
    }
  }
  return [];
}

export function extractRecord<T>(value: unknown): T | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  for (const key of [
    "project",
    "requisition",
    "grn",
    "site_issue",
    "financials",
    "data",
    "result",
  ]) {
    const nested = record[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return extractRecord<T>(nested) ?? (nested as T);
    }
  }
  return value as T;
}

export function recordId(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") return value;
  }
  return undefined;
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const candidate = error as {
      response?: { data?: { message?: unknown } };
      message?: unknown;
    };
    const serverMessage = candidate.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage)
      return serverMessage;
    if (typeof candidate.message === "string" && candidate.message) {
      return candidate.message;
    }
  }
  return "The request failed. Please try again.";
}

export function MutationError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="altrex-table-state-error"
      style={{ margin: "12px 0" }}
    >
      {errorMessage(error)}
    </div>
  );
}

export function EntityFormDialog({
  title,
  fields,
  initialValues,
  isPending,
  submitEmptyValues = false,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: FieldDefinition[];
  initialValues?: Record<string, unknown>;
  isPending: boolean;
  submitEmptyValues?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => {
        const value = initialValues?.[field.name];
        const displayValue =
          field.type === "json" && value !== undefined
            ? JSON.stringify(value, null, 2)
            : value == null
              ? ""
              : String(value);
        return [field.name, displayValue];
      }),
    ),
  );
  const [formError, setFormError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const payload: Record<string, unknown> = {};
    try {
      for (const field of fields) {
        const value = values[field.name]?.trim() ?? "";
        if (field.required && !value) {
          throw new Error(`${field.label} is required.`);
        }
        if (!value) {
          if (submitEmptyValues && field.type !== "json") {
            payload[field.name] =
              field.type === "number" || field.type === "date" ? null : "";
          }
          continue;
        }
        if (field.type === "json") {
          const parsed: unknown = JSON.parse(value);
          if (
            !Array.isArray(parsed) ||
            (field.required && parsed.length === 0)
          ) {
            throw new Error(
              `${field.label} must be a JSON array${field.required ? " with at least one entry" : ""}.`,
            );
          }
          payload[field.name] = parsed;
        } else if (field.type === "number") {
          const number = Number(value);
          if (!Number.isFinite(number)) {
            throw new Error(`${field.label} must be a valid number.`);
          }
          payload[field.name] = number;
        } else {
          payload[field.name] = value;
        }
      }
      onSubmit(payload);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Check the submitted values.",
      );
    }
  };

  return (
    <div className="altrex-dialog-backdrop" onMouseDown={onClose}>
      <dialog
        open
        className="altrex-dialog altrex-dialog-lg"
        aria-modal="true"
        aria-labelledby="entity-form-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ position: "relative", margin: 0, maxWidth: 880 }}
      >
        <header className="altrex-dialog-header">
          <div>
            <h2 className="altrex-dialog-title" id="entity-form-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="altrex-icon-button"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={16} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="altrex-dialog-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {fields.map((field) => (
                <label
                  className="altrex-field"
                  key={field.name}
                  htmlFor={field.name}
                  style={{
                    gridColumn:
                      field.type === "json" || field.type === "textarea"
                        ? "1 / -1"
                        : undefined,
                  }}
                >
                  <span>
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  {field.type === "textarea" || field.type === "json" ? (
                    <textarea
                      id={field.name}
                      className="altrex-input"
                      rows={field.rows ?? (field.type === "json" ? 7 : 3)}
                      value={values[field.name] ?? ""}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.name]: event.target.value,
                        }))
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      className="altrex-input"
                      value={values[field.name] ?? ""}
                      required={field.required}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.name]: event.target.value,
                        }))
                      }
                    >
                      <option value="">
                        Select {field.label.toLowerCase()}
                      </option>
                      {field.options?.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      className="altrex-input"
                      type={field.type ?? "text"}
                      value={values[field.name] ?? ""}
                      placeholder={field.placeholder}
                      required={field.required}
                      step={field.type === "number" ? "any" : undefined}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.name]: event.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            {formError && (
              <p
                role="alert"
                style={{ color: "var(--altrex-danger, #dc2626)" }}
              >
                {formError}
              </p>
            )}
          </div>
          <footer className="altrex-dialog-footer">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
