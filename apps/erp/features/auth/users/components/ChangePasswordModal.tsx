"use client";

import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useChangePassword } from "../api";
import { type PasswordChangeValues, passwordChangeSchema } from "../schema";

interface Props {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: Props) {
  const { mutate: changePassword, isPending, error } = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
    },
  });

  const onSubmit = (values: PasswordChangeValues) => {
    changePassword(values, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="altrex-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="altrex-dialog altrex-dialog-md">
        <div className="altrex-dialog-header">
          <div>
            <h3 className="altrex-dialog-title">Change Password</h3>
            <p className="altrex-dialog-subtitle">
              Enter your current password and choose a secure new one.
            </p>
          </div>
          <button
            type="button"
            className="altrex-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="altrex-dialog-body">
          <form
            id="password-form"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ display: "grid", gap: "16px" }}
          >
            <label className="altrex-field">
              <span>Current Password</span>
              <div className="altrex-password-row">
                <input
                  className="altrex-input"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  {...form.register("current_password")}
                />
                <button
                  type="button"
                  className="altrex-password-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.formState.errors.current_password && (
                <span className="altrex-form-error">
                  {form.formState.errors.current_password.message}
                </span>
              )}
            </label>

            <label className="altrex-field">
              <span>New Password</span>
              <div className="altrex-password-row">
                <input
                  className="altrex-input"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  {...form.register("new_password")}
                />
                <button
                  type="button"
                  className="altrex-password-toggle"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.formState.errors.new_password && (
                <span className="altrex-form-error">
                  {form.formState.errors.new_password.message}
                </span>
              )}
            </label>

            {error && (
              <p className="altrex-form-error" role="alert">
                {error.message}
              </p>
            )}
          </form>
        </div>

        <div className="altrex-dialog-footer">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="password-form" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
