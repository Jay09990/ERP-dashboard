"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { UserCog, UserPlus, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateUser, useUpdateUser } from "../api";
import {
  type User,
  type UserCreateValues,
  type UserUpdateValues,
  userCreateSchema,
  userUpdateSchema,
} from "../schema";

interface Props {
  user: User | null;
  onClose: () => void;
}

export function UserFormDrawer({ user, onClose }: Props) {
  const isEdit = !!user;
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  // Fetch Roles for dropdown
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await apiClient.get<{ roles?: any[] } | any[]>(
        endpoints.auth.roles,
      );
      return Array.isArray(res) ? res : (res as any).roles || [];
    },
  });

  const createForm = useForm<UserCreateValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      roleId: "",
    },
  });

  const editForm = useForm<UserUpdateValues>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      profile_image: null,
      status: "active",
      roleId: "",
    },
  });

  useEffect(() => {
    if (user) {
      const fn = user.firstName ?? user.first_name ?? "";
      const ln = user.lastName ?? user.last_name ?? "";
      const rid = (user.roleId ?? user.role_id ?? "").toString();
      editForm.reset({
        firstName: fn,
        lastName: ln,
        phone: user.phone ?? "",
        profile_image: user.profile_image,
        status: user.status || "active",
        roleId: rid,
      });
    }
  }, [user, editForm]);

  const onCreateSubmit = (values: UserCreateValues) => {
    const numericRoleId = values.roleId ? Number(values.roleId) : null;
    const payload = {
      ...values,
      first_name: values.firstName,
      last_name: values.lastName || "",
      role_id: numericRoleId,
      roleId: numericRoleId,
    };
    createUser(payload as any, {
      onSuccess: () => onClose(),
    });
  };

  const onEditSubmit = (values: UserUpdateValues) => {
    if (!user) return;
    const userId = (user.user_id ?? (user as any).id).toString();
    const numericRoleId = values.roleId ? Number(values.roleId) : null;
    const payload = {
      ...values,
      first_name: values.firstName,
      last_name: values.lastName || "",
      role_id: numericRoleId,
      roleId: numericRoleId,
    };
    updateUser(
      { id: userId, body: payload as any },
      {
        onSuccess: () => onClose(),
      },
    );
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
                background: isEdit ? "rgba(37,99,235,0.1)" : "rgba(16,185,129,0.1)",
                color: isEdit ? "var(--altrex-primary)" : "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isEdit ? <UserCog size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h3 className="altrex-dialog-title">
                {isEdit ? "Edit User" : "Create New User"}
              </h3>
              <p className="altrex-dialog-subtitle">
                {isEdit
                  ? "Update user profile details and enterprise role assignment."
                  : "Fill in the required information to invite a new team member."}
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
          {isEdit ? (
            <form
              id="user-form"
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              style={{ display: "grid", gap: "16px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <label className="altrex-field">
                  <span>First Name</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. Rahul"
                    {...editForm.register("firstName")}
                  />
                  {editForm.formState.errors.firstName && (
                    <span className="altrex-form-error">
                      {editForm.formState.errors.firstName.message}
                    </span>
                  )}
                </label>

                <label className="altrex-field">
                  <span>Last Name</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. Patel"
                    {...editForm.register("lastName")}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <label className="altrex-field">
                  <span>Phone Number</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. 9876543210"
                    {...editForm.register("phone")}
                  />
                </label>

                <label className="altrex-field">
                  <span>Account Status</span>
                  <select
                    className="altrex-input altrex-select"
                    {...editForm.register("status")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label className="altrex-field">
                <span>Enterprise Role</span>
                <select
                  className="altrex-input altrex-select"
                  {...editForm.register("roleId")}
                  disabled={loadingRoles}
                >
                  <option value="">Select a role...</option>
                  {roles.map((r: any) => (
                    <option
                      key={r.role_id ?? r.id}
                      value={(r.role_id ?? r.id).toString()}
                    >
                      {r.role_name ?? r.name}
                    </option>
                  ))}
                </select>
                {editForm.formState.errors.roleId && (
                  <span className="altrex-form-error">
                    {editForm.formState.errors.roleId.message}
                  </span>
                )}
              </label>
            </form>
          ) : (
            <form
              id="user-form"
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              style={{ display: "grid", gap: "16px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <label className="altrex-field">
                  <span>First Name *</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. Rahul"
                    {...createForm.register("firstName")}
                  />
                  {createForm.formState.errors.firstName && (
                    <span className="altrex-form-error">
                      {createForm.formState.errors.firstName.message}
                    </span>
                  )}
                </label>

                <label className="altrex-field">
                  <span>Last Name</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. Patel"
                    {...createForm.register("lastName")}
                  />
                </label>
              </div>

              <label className="altrex-field">
                <span>Email Address *</span>
                <input
                  className="altrex-input"
                  type="email"
                  placeholder="e.g. user@company.com"
                  {...createForm.register("email")}
                />
                {createForm.formState.errors.email && (
                  <span className="altrex-form-error">
                    {createForm.formState.errors.email.message}
                  </span>
                )}
              </label>

              <label className="altrex-field">
                <span>Password *</span>
                <input
                  className="altrex-input"
                  type="password"
                  placeholder="Min 6 characters"
                  {...createForm.register("password")}
                />
                {createForm.formState.errors.password && (
                  <span className="altrex-form-error">
                    {createForm.formState.errors.password.message}
                  </span>
                )}
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <label className="altrex-field">
                  <span>Phone Number</span>
                  <input
                    className="altrex-input"
                    placeholder="e.g. 9876543210"
                    {...createForm.register("phone")}
                  />
                </label>

                <label className="altrex-field">
                  <span>Enterprise Role *</span>
                  <select
                    className="altrex-input altrex-select"
                    {...createForm.register("roleId")}
                    disabled={loadingRoles}
                  >
                    <option value="">Select a role...</option>
                    {roles.map((r: any) => (
                      <option
                        key={r.role_id ?? r.id}
                        value={(r.role_id ?? r.id).toString()}
                      >
                        {r.role_name ?? r.name}
                      </option>
                    ))}
                  </select>
                  {createForm.formState.errors.roleId && (
                    <span className="altrex-form-error">
                      {createForm.formState.errors.roleId.message}
                    </span>
                  )}
                </label>
              </div>
            </form>
          )}
        </div>

        <div className="altrex-dialog-footer">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" disabled={isPending}>
            {isPending ? "Saving..." : isEdit ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
}
