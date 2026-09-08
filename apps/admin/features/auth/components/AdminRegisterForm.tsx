"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { AuthCard, Button } from "@altrex/ui";
import { type AdminRegisterValues, adminRegisterSchema } from "../schema";

export function AdminRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminRegisterValues>({
    resolver: zodResolver(adminRegisterSchema),
  });
  const submit = async (values: AdminRegisterValues) => {
    setServerError("");
    try {
      await apiClient.post(endpoints.admin.register, values);
      router.push("/login?next=/company-register");
    } catch (error) {
      setServerError(
        String(
          (error as { message?: string }).message ?? "Registration failed",
        ),
      );
    }
  };
  return (
    <AuthFrame
      eyebrow="First-time setup"
      title="Create platform admin"
      description="Register the administrator who will manage Altrex tenants."
    >
      <form className="altrex-auth-form" onSubmit={form.handleSubmit(submit)}>
        <Field
          label="Full name"
          htmlFor="admin-full-name"
          error={form.formState.errors.full_name?.message}
        >
          <input
            id="admin-full-name"
            className="altrex-input"
            {...form.register("full_name")}
          />
        </Field>
        <Field
          label="Email"
          htmlFor="admin-email"
          error={form.formState.errors.email?.message}
        >
          <input
            id="admin-email"
            className="altrex-input"
            type="email"
            {...form.register("email")}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="admin-password"
          error={form.formState.errors.password?.message}
        >
          <div className="altrex-password-row">
            <input
              id="admin-password"
              className="altrex-input"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
            />
            <button
              type="button"
              className="altrex-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </Field>
        {serverError ? (
          <div className="altrex-auth-banner" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        ) : null}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Create admin
        </Button>
        <a className="altrex-auth-link" href="/login">
          Already registered? Sign in
        </a>
      </form>
    </AuthFrame>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="altrex-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <small className="altrex-form-error">{error}</small> : null}
    </div>
  );
}
function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <AuthCard eyebrow={eyebrow} title={title} description={description}>
      {children}
    </AuthCard>
  );
}
