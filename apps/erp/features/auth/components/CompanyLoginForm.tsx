"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { setToken } from "@/lib/auth/token";
import { useSessionStore, type SessionSnapshot } from "@/stores/session-store";
import { AuthCard, Button, Input } from "@altrex/ui";
import { type CompanyLoginValues, companyLoginSchema } from "../schema";

export function CompanyLoginForm() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<CompanyLoginValues>({
    resolver: zodResolver(companyLoginSchema),
  });
  const submit = async (values: CompanyLoginValues) => {
    setServerError("");
    try {
      const response = await apiClient.post<{
        token?: string;
        access_token?: string;
        user?: Record<string, any>;
        data?: Record<string, any>;
      }>(endpoints.auth.login, values);
      const token = response.token ?? response.access_token;
      const user = response.user ?? response.data?.user ?? response.data ?? response;
      if (!token) throw new Error("Login response did not include a token");
      setToken(token);
      const session: SessionSnapshot = {
        user: {
          id: String(user.userId ?? user.user_id ?? user.id ?? ""),
          name: user.fullName ?? user.full_name ?? user.name ?? user.email ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
        },
        permissions: user.permissions ?? [],
        company: user.companyId || user.company_id || user.company
          ? {
              id: String(user.companyId ?? user.company_id ?? user.company?.id ?? ""),
              name: user.companyName ?? user.company_name ?? user.company?.name ?? "",
              gstNo: user.gstNo ?? user.gst_no ?? "",
              phone: user.companyPhone ?? user.company_phone ?? "",
              email: user.companyEmail ?? user.company_email ?? "",
              address: user.address ?? "",
            }
          : undefined,
      };
      setSession(session);
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
      eyebrow="Company workspace"
      title="Sign in to Altrex"
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
