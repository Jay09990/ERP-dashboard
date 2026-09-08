"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { AuthCard, Button, Input } from "@altrex/ui";
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
    <AuthCard
      eyebrow="Platform access"
      title="Admin sign in"
      description="Use your email address or phone number to continue."
    >
        <form className="altrex-auth-form" onSubmit={form.handleSubmit(submit)}>
          <label className="altrex-field">
            <span>Email or phone</span>
            <Input
              aria-invalid={Boolean(form.formState.errors.login)}
              {...form.register("login")}
            />
            {form.formState.errors.login?.message && (
              <small className="altrex-form-error">{form.formState.errors.login.message}</small>
            )}
          </label>
          <label className="altrex-field">
            <span>Password</span>
            <div className="altrex-password-row">
              <Input
                type={showPassword ? "text" : "password"}
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <button
                type="button"
                className="altrex-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.formState.errors.password?.message && (
              <small className="altrex-form-error">{form.formState.errors.password.message}</small>
            )}
          </label>
          {serverError ? (
            <div className="altrex-auth-banner" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          ) : null}
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            Sign in
          </Button>
        </form>
    </AuthCard>
  );
}
