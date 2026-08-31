"use client";

import { useState } from "react";
import { useDeactivateCompany } from "../api";
import type { Company } from "../types";

interface Props {
  company: Company;
  onClose: () => void;
}

/**
 * Soft-deactivate confirmation.
 * Reversible — admin can re-activate later. Visually neutral (warning, not danger).
 * The backend DELETE /api/admin/companies/:id does NOT drop the tenant database.
 */
export function DeactivateDialog({ company, onClose }: Props) {
  const { mutate, isPending, error } = useDeactivateCompany();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    mutate(company.company_id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div
      className="altrex-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-title"
    >
      <div className="altrex-dialog altrex-dialog-md">
        <div className="altrex-dialog-header">
          <div className="altrex-dialog-icon altrex-dialog-icon-warning">
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
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h3 id="deactivate-title" className="altrex-dialog-title">
              Deactivate company
            </h3>
            <p className="altrex-dialog-subtitle">
              <strong>{company.company_name}</strong> ({company.company_code})
            </p>
          </div>
        </div>

        <div className="altrex-dialog-body">
          <p>
            Deactivating this company will prevent its users from logging in.
            The company database and all its data will be preserved and can be
            re-activated at any time.
          </p>
          <label className="altrex-dialog-confirm-check">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              id="deactivate-confirm"
            />
            <span>
              I understand this company will be blocked from logging in
            </span>
          </label>
          {error && (
            <p className="altrex-form-error" role="alert">
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
            className="altrex-button altrex-button-warning"
            onClick={handleConfirm}
            disabled={!confirmed || isPending}
          >
            {isPending ? "Deactivating…" : "Deactivate company"}
          </button>
        </div>
      </div>
    </div>
  );
}
