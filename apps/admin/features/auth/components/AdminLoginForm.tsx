"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button } from "@altrex/ui";
import { type AdminLoginValues, adminLoginSchema } from "../schema";

export function AdminLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
  });
  const submit = async (values: AdminLoginValues) => {
    setServerError("");
    try {
      await apiClient.post(endpoints.admin.login, values);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(
        next?.startsWith("/") && !next.startsWith("//") ? next : "/",
      );
    } catch (error) {
      setServerError(
        String((error as { message?: string }).message ?? "Sign in failed"),
      );
    }
  };
  return (
    <main className="altrex-auth-page">
      <section className="altrex-auth-panel">
        <span className="altrex-eyebrow">Platform access</span>
        <h1>Admin sign in</h1>
        <p className="altrex-auth-description">
          Manage companies, plans, and platform access.
        </p>
        <form className="altrex-auth-form" onSubmit={form.handleSubmit(submit)}>
          <label className="altrex-field">
            <span>Email</span>
            <input
              className="altrex-input"
              type="email"
              {...form.register("email")}
            />
          </label>
          <label className="altrex-field">
            <span>Password</span>
            <input
              className="altrex-input"
              type="password"
              {...form.register("password")}
            />
          </label>
          {serverError ? (
            <p className="altrex-form-error">{serverError}</p>
          ) : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Sign in
          </Button>
          <a className="altrex-auth-link" href="/register">
            Not registered? Create an admin account
          </a>
        </form>
      </section>
    </main>
  );
}
