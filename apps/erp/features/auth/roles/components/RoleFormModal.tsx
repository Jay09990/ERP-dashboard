"use client";

import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
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
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      createRole(values, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="altrex-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="altrex-dialog altrex-dialog-md">
        <div className="altrex-dialog-header">
          <div>
            <h3 className="altrex-dialog-title">
              {isEdit ? "Edit Role" : "Create New Role"}
            </h3>
            <p className="altrex-dialog-subtitle">
              {isEdit
                ? "Modify existing role details and description."
                : "Define a new user role with specialized access rules."}
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
            id="role-form"
            onSubmit={form.handleSubmit(onSubmit)}
            style={{ display: "grid", gap: "16px" }}
          >
            <label className="altrex-field">
              <span>Role Name *</span>
              <input
                className="altrex-input"
                placeholder="e.g. Sales Manager, Warehouse Lead"
                {...form.register("role_name")}
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
                placeholder="Brief summary of what permissions and responsibilities this role entails..."
                {...form.register("description")}
              />
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
