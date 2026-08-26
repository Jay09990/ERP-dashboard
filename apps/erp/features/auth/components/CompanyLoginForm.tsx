"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button } from "@altrex/ui";
import { type CompanyLoginValues, companyLoginSchema } from "../schema";

export function CompanyLoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<CompanyLoginValues>({
    resolver: zodResolver(companyLoginSchema),
  });
  const submit = async (values: CompanyLoginValues) => {
    setServerError("");
    try {
      await apiClient.post(endpoints.auth.login, values);
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
        <span className="altrex-eyebrow">Company workspace</span>
        <h1>Sign in to Altrex</h1>
        <p className="altrex-auth-description">
          Use your email address or phone number to continue.
        </p>
        <form className="altrex-auth-form" onSubmit={form.handleSubmit(submit)}>
          <label className="altrex-field">
            <span>Email or phone</span>
            <input className="altrex-input" {...form.register("login")} />
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
        </form>
      </section>
    </main>
  );
}
