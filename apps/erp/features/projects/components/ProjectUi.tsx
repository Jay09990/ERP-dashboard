"use client";

import { Button } from "@altrex/ui";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ReferenceOption } from "../lookups";

export type FieldDefinition = {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "reference"
    | "collection";
  required?: boolean;
  placeholder?: string;
  rows?: number;
  nullable?: boolean;
  referenceSource?: "project-sites" | "project-boq";
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

export function SearchableReferencePicker({
  id,
  label,
  value,
  options,
  required,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: ReferenceOption[];
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!value) return;
    setQuery(selected?.label ?? (value ? `Unknown reference (#${value})` : ""));
  }, [selected?.label, value]);

  return (
    <>
      <input
        id={id}
        className="altrex-input"
        type="search"
        list={listId}
        aria-label={label}
        autoComplete="off"
        required={required}
        value={query}
        placeholder={`Search ${label.toLowerCase()}...`}
        onChange={(event) => {
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          onChange(
            options.find((option) => option.label === nextQuery)?.value ?? "",
          );
        }}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.label} />
        ))}
      </datalist>
      {options.length === 0 && (
        <small style={{ color: "var(--altrex-muted)" }}>
          No reference records available.
        </small>
      )}
    </>
  );
}

export function EntityFormDialog({
  title,
  fields,
  initialValues,
  fieldOptions = {},
  lookupLoading = false,
  lookupError,
  onFieldChange,
  isPending,
  submitEmptyValues = false,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: FieldDefinition[];
  initialValues?: Record<string, unknown>;
  fieldOptions?: Record<string, ReferenceOption[]>;
  lookupLoading?: boolean;
  lookupError?: unknown;
  onFieldChange?: (name: string, value: string) => void;
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

  const updateValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    onFieldChange?.(name, value);
  };

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
        if (!value && field.type !== "collection") {
          if (field.nullable) {
            payload[field.name] = null;
          } else if (submitEmptyValues) {
            payload[field.name] =
              field.type === "number" ||
              field.type === "date" ||
              field.type === "reference"
                ? null
                : "";
          }
          continue;
        }
        if (field.type === "collection") {
          const rows = collectionValues[field.name] ?? [];
          const parsedRows = rows
            .map((row) =>
              (field.itemFields ?? []).reduce<Record<string, unknown>>(
                (itemValues, itemField) => {
                  const itemValue = row[itemField.name]?.trim() ?? "";
                  if (!itemValue) {
                    if (itemField.required) {
                      throw new Error(
                        `${itemField.label} is required for each item.`,
                      );
                    }
                    if (itemField.nullable) {
                      itemValues[itemField.name] = null;
                    }
                    return itemValues;
                  }
                  if (itemField.type === "number") {
                    const number = Number(itemValue);
                    if (!Number.isFinite(number)) {
                      throw new Error(
                        `${itemField.label} must be a valid number.`,
                      );
                    }
                    itemValues[itemField.name] = number;
                    return itemValues;
                  }
                  if (itemField.type === "reference") {
                    const options =
                      fieldOptions[itemField.name] ?? itemField.options ?? [];
                    const originalRows = initialValues?.[field.name];
                    const isExistingReference =
                      Array.isArray(originalRows) &&
                      originalRows.some(
                        (originalRow) =>
                          originalRow &&
                          typeof originalRow === "object" &&
                          String(
                            (originalRow as Record<string, unknown>)[
                              itemField.name
                            ] ?? "",
                          ) === itemValue,
                      );
                    if (
                      !options.some((option) => option.value === itemValue) &&
                      !isExistingReference
                    ) {
                      throw new Error(
                        `Choose a valid ${itemField.label.toLowerCase()} from the list.`,
                      );
                    }
                    const referenceId = Number(itemValue);
                    if (!Number.isSafeInteger(referenceId) || referenceId < 1) {
                      throw new Error(
                        `${itemField.label} must be a valid record ID.`,
                      );
                    }
                    itemValues[itemField.name] = referenceId;
                    return itemValues;
                  }
                  itemValues[itemField.name] = itemValue;
                  return itemValues;
                },
                {},
              ),
            )
            .filter((row) => Object.keys(row).length > 0);
          if (field.required && parsedRows.length === 0) {
            throw new Error(`${field.label} needs at least one item.`);
          }
          payload[field.name] = parsed;
        } else if (field.type === "number") {
          const number = Number(value);
          if (!Number.isFinite(number)) {
            throw new Error(`${field.label} must be a valid number.`);
          }
          payload[field.name] = number;
        } else if (field.type === "reference") {
          const options = fieldOptions[field.name] ?? field.options ?? [];
          const isExistingReference =
            String(initialValues?.[field.name] ?? "") === value;
          if (
            !options.some((option) => option.value === value) &&
            !isExistingReference
          ) {
            throw new Error(
              `Choose a valid ${field.label.toLowerCase()} from the list.`,
            );
          }
          const referenceId = Number(value);
          if (!Number.isSafeInteger(referenceId) || referenceId < 1) {
            throw new Error(`${field.label} must be a valid record ID.`);
          }
          payload[field.name] = referenceId;
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
                  {field.type === "collection" ? (
                    <span>
                      {field.label}
                      {field.required ? " *" : ""}
                    </span>
                  ) : (
                    <label htmlFor={field.name}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </label>
                  )}
                  {field.type === "collection" ? (
                    <div style={{ gridColumn: "1 / -1" }}>
                      {(collectionValues[field.name] ?? []).map(
                        (row, rowIndex) => (
                          <div
                            key={`${field.name}-${rowIndex}`}
                            className="altrex-card"
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                              gap: 12,
                              marginBottom: 10,
                              padding: 12,
                            }}
                          >
                            {(field.itemFields ?? []).map((itemField) => (
                              <label
                                className="altrex-field"
                                key={itemField.name}
                                htmlFor={`${field.name}-${rowIndex}-${itemField.name}`}
                              >
                                <span>{itemField.label}</span>
                                {itemField.type === "select" ? (
                                  <select
                                    id={`${field.name}-${rowIndex}-${itemField.name}`}
                                    className="altrex-input"
                                    value={row[itemField.name] ?? ""}
                                    onChange={(event) =>
                                      setCollectionValues((current) => ({
                                        ...current,
                                        [field.name]: (
                                          current[field.name] ?? []
                                        ).map((item, index) =>
                                          index === rowIndex
                                            ? {
                                                ...item,
                                                [itemField.name]:
                                                  event.target.value,
                                              }
                                            : item,
                                        ),
                                      }))
                                    }
                                  >
                                    <option value="">
                                      Choose {itemField.label.toLowerCase()}
                                    </option>
                                    {itemField.options?.map((option) => (
                                      <option
                                        value={option.value}
                                        key={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : itemField.type === "reference" ? (
                                  <SearchableReferencePicker
                                    id={`${field.name}-${rowIndex}-${itemField.name}`}
                                    label={itemField.label}
                                    value={row[itemField.name] ?? ""}
                                    options={
                                      fieldOptions[itemField.name] ??
                                      itemField.options ??
                                      []
                                    }
                                    required={itemField.required}
                                    onChange={(value) =>
                                      setCollectionValues((current) => ({
                                        ...current,
                                        [field.name]: (
                                          current[field.name] ?? []
                                        ).map((item, index) =>
                                          index === rowIndex
                                            ? {
                                                ...item,
                                                [itemField.name]: value,
                                              }
                                            : item,
                                        ),
                                      }))
                                    }
                                  />
                                ) : (
                                  <input
                                    id={`${field.name}-${rowIndex}-${itemField.name}`}
                                    className="altrex-input"
                                    type={itemField.type ?? "text"}
                                    step={
                                      itemField.type === "number"
                                        ? "any"
                                        : undefined
                                    }
                                    value={row[itemField.name] ?? ""}
                                    placeholder={itemField.placeholder}
                                    onChange={(event) =>
                                      setCollectionValues((current) => ({
                                        ...current,
                                        [field.name]: (
                                          current[field.name] ?? []
                                        ).map((item, index) =>
                                          index === rowIndex
                                            ? {
                                                ...item,
                                                [itemField.name]:
                                                  event.target.value,
                                              }
                                            : item,
                                        ),
                                      }))
                                    }
                                  />
                                )}
                              </label>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setCollectionValues((current) => ({
                                  ...current,
                                  [field.name]: (
                                    current[field.name] ?? []
                                  ).filter((_, index) => index !== rowIndex),
                                }))
                              }
                            >
                              Remove item
                            </Button>
                          </div>
                        ),
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setCollectionValues((current) => ({
                            ...current,
                            [field.name]: [
                              ...(current[field.name] ?? []),
                              Object.fromEntries(
                                (field.itemFields ?? []).map((itemField) => [
                                  itemField.name,
                                  "",
                                ]),
                              ),
                            ],
                          }))
                        }
                      >
                        Add {field.label.toLowerCase()}
                      </Button>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={field.name}
                      className="altrex-input"
                      rows={field.rows ?? (field.type === "json" ? 7 : 3)}
                      value={values[field.name] ?? ""}
                      placeholder={field.placeholder}
                      required={field.required}
                      onChange={(event) =>
                        updateValue(field.name, event.target.value)
                      }
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.name}
                      className="altrex-input"
                      value={values[field.name] ?? ""}
                      required={field.required}
                      onChange={(event) =>
                        updateValue(field.name, event.target.value)
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
                  ) : field.type === "reference" ? (
                    <SearchableReferencePicker
                      id={field.name}
                      label={field.label}
                      value={values[field.name] ?? ""}
                      options={fieldOptions[field.name] ?? field.options ?? []}
                      required={field.required}
                      onChange={(value) => updateValue(field.name, value)}
                    />
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
                        updateValue(field.name, event.target.value)
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            {lookupLoading && (
              <output style={{ color: "var(--altrex-muted)" }}>
                Loading reference options...
              </output>
            )}
            {Boolean(lookupError) && <MutationError error={lookupError} />}
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
            <Button
              type="submit"
              disabled={isPending || lookupLoading || Boolean(lookupError)}
            >
              {isPending ? "Saving..." : lookupLoading ? "Loading..." : "Save"}
            </Button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
