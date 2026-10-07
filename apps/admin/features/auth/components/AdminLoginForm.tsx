"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { companiesQueryKey, fetchCompanies } from "@/features/companies/api";
import type { Company } from "@/features/companies/types";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { clearToken, setToken } from "@/lib/auth/token";
import { type SessionSnapshot, useSessionStore } from "@/stores/session-store";
import { AuthCard, Button, Input } from "@altrex/ui";
import { type AdminLoginValues, adminLoginSchema } from "../schema";

/**
 * Validates post-login redirect path to prevent Open Redirect vulnerabilities.
 * Ensures the target starts with a single slash `/`, does not contain `\\` or control characters,
 * decodes URL-encoded payloads to prevent encoded bypasses (e.g. `%2f%2f` or `%5c`),
 * and stays on the same origin when resolved against a relative base.
 */
function isSafeRedirect(path: string): boolean {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    return false;
  }
  let decoded = path;
  try {
    for (let i = 0; i < 3; i++) {
      const prev = decoded;
      decoded = decodeURIComponent(decoded);
      if (decoded === prev) break;
    }
  } catch {
    return false;
  }
  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\x00-\x1f]/.test(decoded)
  ) {
    return false;
  }
  try {
    const dummyOrigin = "http://localhost";
    const parsed = new URL(decoded, dummyOrigin);
    return parsed.origin === dummyOrigin && parsed.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export function AdminLoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);
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
      const response = await apiClient.post<{
        token?: string;
        access_token?: string;
        user?: Record<string, unknown>;
        data?: Record<string, unknown>;
      }>(endpoints.admin.login, payload);
      const token = response.token ?? response.access_token;
      const user =
        response.user ?? response.data?.user ?? response.data ?? response;
      if (!token) throw new Error("Login response did not include a token");

      // Clear data from a prior account before checking this admin's companies.
      queryClient.clear();
      setToken(token);
      let companies: Company[];
      try {
        companies = await queryClient.fetchQuery({
          queryKey: companiesQueryKey(),
          queryFn: () => fetchCompanies(),
        });
      } catch {
        clearToken();
        setSession(null);
        setServerError(
          "Signed in, but company setup could not be checked. Please try again.",
        );
        return;
      }
      // Normalize user object — the backend may return different shapes.
      type AdminLoginUser = {
        userId?: string | number;
        user_id?: string | number;
        id?: string | number;
        fullName?: string;
        full_name?: string;
        name?: string;
        email?: string;
        phone?: string;
        permissions?: unknown[];
      };
      const u = user as AdminLoginUser;
      const session: SessionSnapshot = {
        user: {
          id: String(u.userId ?? u.user_id ?? u.id ?? ""),
          name: u.fullName ?? u.full_name ?? u.name ?? u.email ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
        },
        permissions: (u.permissions ?? []) as SessionSnapshot["permissions"],
      };
      setSession(session);

      if (companies.length === 0) {
        router.push("/company-register");
      } else {
        router.push("/");
      }
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
        <label className="altrex-field" htmlFor="admin-login">
          <span>Email or phone</span>
          <Input
            id="admin-login"
            aria-invalid={Boolean(form.formState.errors.login)}
            {...form.register("login")}
          />
          {form.formState.errors.login?.message && (
            <small className="altrex-form-error">
              {form.formState.errors.login.message}
            </small>
          )}
        </label>
        <label className="altrex-field" htmlFor="admin-password">
          <span>Password</span>
          <div className="altrex-password-row">
            <Input
              id="admin-password"
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
            <small className="altrex-form-error">
              {form.formState.errors.password.message}
            </small>
          )}
        </label>
        {serverError ? (
          <div className="altrex-auth-banner" role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        ) : null}
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Signing in and checking companies…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <Link
          href="/register"
          className="altrex-auth-link"
          style={{ marginTop: "12px", display: "block", textAlign: "center" }}
        >
          First time? Create an admin account
        </Link>
      </form>
    </AuthCard>
  );
}
