"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button } from "@altrex/ui";
import { type AdminRegisterValues, adminRegisterSchema } from "../schema";

export function AdminRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
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
          <input
            id="admin-password"
            className="altrex-input"
            type="password"
            {...form.register("password")}
          />
        </Field>
        {serverError ? (
          <p className="altrex-form-error">{serverError}</p>
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
    <main className="altrex-auth-page">
      <section className="altrex-auth-panel">
        <span className="altrex-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="altrex-auth-description">{description}</p>
        {children}
      </section>
    </main>
  );
}
