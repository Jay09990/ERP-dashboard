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
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
  });
  const submit = async (values: AdminLoginValues) => {
    setServerError("");
    try {
      // Transform login field to email for backend compatibility
      const payload = {
        email: values.login,
        password: values.password,
      };
      await apiClient.post(endpoints.admin.login, payload);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
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
          Use your email address or phone number to continue.
        </p>
        <form className="altrex-auth-form" onSubmit={form.handleSubmit(submit)}>
          <label className="altrex-field">
            <span>Email or phone</span>
            <input
              className="altrex-input"
              {...form.register("login")}
            />
          </label>
          <label className="altrex-field">
            <span>Password</span>
            <div className="altrex-password-row">
              <input
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
