"use client";

import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateRole, useUpdateRole } from "../api";
import { type Role, type RoleValues, roleSchema } from "../schema";

interface Props {
  role: Role | null;
  onClose: () => void;
}

export function RoleFormModal({ role, onClose }: Props) {
  const isEdit = !!role;
  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role_name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        role_name: role.role_name,
        description: role.description ?? "",
      });
    }
  }, [role, form]);

  const onSubmit = (values: RoleValues) => {
    if (isEdit && role) {
      updateRole(
        { id: role.role_id.toString(), body: values },
        { onSuccess: () => onClose() },
      );
    } else {
      createRole(values, { onSuccess: () => onClose() });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="altrex-dialog-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="altrex-dialog altrex-dialog-md" onClick={(e) => e.stopPropagation()}>
        <div className="altrex-dialog-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(37, 99, 235, 0.1)",
                color: "var(--altrex-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h3 className="altrex-dialog-title">
                {isEdit ? "Edit Role" : "Create New Role"}
              </h3>
              <p className="altrex-dialog-subtitle">
                {isEdit
                  ? "Modify existing role details and description."
                  : "Define a new role with specialized access rules."}
              </p>
            </div>
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
            id="role-form"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ display: "grid", gap: "20px" }}
          >
            <label className="altrex-field">
              <span>
                Role Name{" "}
                <span style={{ color: "var(--altrex-danger-text)" }}>*</span>
              </span>
              <input
                className="altrex-input"
                placeholder="e.g. Sales Manager, Warehouse Lead"
                {...form.register("role_name")}
                autoFocus
              />
              {form.formState.errors.role_name && (
                <span className="altrex-form-error">
                  {form.formState.errors.role_name.message}
                </span>
              )}
            </label>

            <label className="altrex-field">
              <span>Description</span>
              <textarea
                className="altrex-input altrex-textarea"
                rows={3}
                placeholder="Brief summary of what this role is responsible for and what access level it grants..."
                {...form.register("description")}
              />
              <span style={{ fontSize: "11px", color: "var(--altrex-muted)" }}>
                After creating this role, open Permissions to configure its access rights.
              </span>
            </label>
          </form>
        </div>

        <div className="altrex-dialog-footer">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </div>
    </div>
  );
}
