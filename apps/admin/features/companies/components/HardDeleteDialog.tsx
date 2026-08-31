"use client";

import { useState } from "react";
import { useHardDeleteCompany } from "../api";
import type { Company } from "../types";

interface Props {
  company: Company;
  onClose: () => void;
}

/**
 * Hard-delete confirmation.
 * IRREVERSIBLE — permanently drops the tenant database and all records.
 * Visually distinct from DeactivateDialog: danger/red palette, typed confirmation.
 * Two-step: checkbox + type company name before the destructive button enables.
 */
export function HardDeleteDialog({ company, onClose }: Props) {
  const { mutate, isPending, error } = useHardDeleteCompany();
  const [typedName, setTypedName] = useState("");
  const [checked, setChecked] = useState(false);

  const nameMatches = typedName.trim() === company.company_name.trim();
  const canSubmit = nameMatches && checked && !isPending;

  const handleConfirm = () => {
    if (!canSubmit) return;
    mutate(company.company_id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div
      className="altrex-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="harddelete-title"
    >
      <div className="altrex-dialog altrex-dialog-md altrex-dialog-danger">
        <div className="altrex-dialog-header">
          <div className="altrex-dialog-icon altrex-dialog-icon-danger">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <h3
              id="harddelete-title"
              className="altrex-dialog-title altrex-dialog-title-danger"
            >
              Permanently delete company
            </h3>
            <p className="altrex-dialog-subtitle">
              <strong>{company.company_name}</strong> ({company.company_code})
            </p>
          </div>
        </div>

        <div className="altrex-dialog-body">
          <div className="altrex-harddelete-warning">
            <p>
              <strong>This action cannot be undone.</strong> It will
              permanently:
            </p>
            <ul className="altrex-harddelete-list">
              <li>
                Drop the company's entire tenant database (
                <code>{company.db_name}</code>)
              </li>
              <li>
                Delete all records for this company from the platform database
              </li>
              <li>Revoke access for all of its users immediately</li>
            </ul>
          </div>

          <label className="altrex-dialog-confirm-check">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              id="harddelete-check"
            />
            <span>
              I understand this will permanently destroy all data and cannot be
              recovered
            </span>
          </label>

          <div className="altrex-field" style={{ marginTop: "16px" }}>
            <label
              htmlFor="harddelete-name"
              className="altrex-harddelete-name-label"
            >
              Type <strong>{company.company_name}</strong> to confirm
            </label>
            <input
              id="harddelete-name"
              className="altrex-input altrex-input-danger"
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={company.company_name}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <p
              className="altrex-form-error"
              role="alert"
              style={{ marginTop: "12px" }}
            >
              {error.message}
            </p>
          )}
        </div>

        <div className="altrex-dialog-footer">
          <button
            type="button"
            className="altrex-button altrex-button-neutral"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="altrex-button altrex-button-danger"
            onClick={handleConfirm}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
          >
            {isPending ? "Deleting permanently…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
