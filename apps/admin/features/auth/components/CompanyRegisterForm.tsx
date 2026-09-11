"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { AuthCard } from "@altrex/ui";
import { type CompanyRegisterValues, companyRegisterSchema } from "../schema";

type StepDef = { label: string; fields: (keyof CompanyRegisterValues)[] };

const STEPS: StepDef[] = [
  {
    label: "Company Details",
    fields: ["companyName", "companyCode", "gstNo", "address"],
  },
  { label: "Contact Details", fields: ["phone", "companyEmail"] },
  { label: "Subscription Plan", fields: ["subscriptionPlanId"] },
  {
    label: "Admin & Database",
    fields: [
      "superAdminFirstName",
      "superAdminLastName",
      "superAdminEmail",
      "superAdminPhone",
      "superAdminPassword",
      "confirmPassword",
      "db_name",
    ],
  },
];

// ─── Plan cards data ──────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 1,
    name: "Base",
    available: true,
    features: [
      "Parties",
      "Item Master",
      "Sales",
      "Purchase",
      "Masters",
      "Administration",
    ],
  },
  { id: 2, name: "Standard", available: false, features: [] },
  { id: 3, name: "Premium", available: false, features: [] },
  { id: 4, name: "Custom", available: false, features: [] },
] as const;

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(password: string): {
  level: "weak" | "medium" | "strong";
  value: number;
} {
  if (!password) return { level: "weak", value: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}]/.test(password)) score++;
  if (score <= 1) return { level: "weak", value: 25 };
  if (score <= 2) return { level: "medium", value: 60 };
  return { level: "strong", value: 100 };
}

// ─── Field component ──────────────────────────────────────────────────────────

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

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="altrex-step-indicator"
      role="list"
      aria-label={`Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          {/* Connector line before every dot except the first */}
          {i > 0 && (
            <div
              className={`altrex-step-line ${i <= current ? "altrex-step-line-done" : ""}`}
              aria-hidden="true"
            />
          )}

          <div
            role="listitem"
            aria-current={i === current ? "step" : undefined}
            className={`altrex-step-dot ${
              i < current
                ? "altrex-step-done"
                : i === current
                  ? "altrex-step-active"
                  : "altrex-step-upcoming"
            }`}
          >
            {i < current ? (
              /* Completed — show checkmark only */
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-label={`Step ${i + 1} complete`}
              >
                <path
                  d="M2 6l2.8 3L10 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              /* Active or upcoming — show number only */
              <span aria-hidden="true">{i + 1}</span>
            )}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function CompanyRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const form = useForm<CompanyRegisterValues>({
    resolver: zodResolver(companyRegisterSchema),
    defaultValues: {
      companyName: "",
      companyCode: "",
      gstNo: "",
      address: "",
      phone: "",
      companyEmail: "",
      subscriptionPlanId: undefined,
      superAdminFirstName: "",
      superAdminLastName: "",
      superAdminEmail: "",
      superAdminPhone: "",
      superAdminPassword: "",
      confirmPassword: "",
      db_name: "",
    },
    mode: "onBlur",
  });

  const passwordValue = form.watch("superAdminPassword");
  const strength = getPasswordStrength(passwordValue ?? "");
  const selectedPlanId = form.watch("subscriptionPlanId");

  // GSAP step transition
  useEffect(() => {
    async function animate() {
      const gsap = (await import("gsap")).gsap;
      const el = panelRef.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
    animate();
  }, [step]);

  const goNext = async () => {
    const fields = STEPS[step].fields;
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async (values: CompanyRegisterValues) => {
    setServerError("");
    // Strip confirmPassword — not part of the API payload
    const { confirmPassword: _, ...payload } = values;
    try {
      await apiClient.post(endpoints.companies, payload);
      router.push("/");
    } catch (error) {
      setServerError(
        String(
          (error as { message?: string }).message ?? "Company creation failed",
        ),
      );
    }
  };

  return (
    <AuthCard
      eyebrow="Tenant setup"
      title="Register a company"
      description="Create the company and its first super admin in one step."
      wide
    >

        <StepIndicator current={step} total={STEPS.length} />
        <p className="altrex-step-label">{STEPS[step].label}</p>

        <form onSubmit={form.handleSubmit(submit)} noValidate>
          <div className="altrex-step-panel" ref={panelRef}>
            {/* ── Step 1: Company Details ── */}
            {step === 0 && (
              <div className="altrex-company-grid">
                <Field
                  label="Company name"
                  htmlFor="co-name"
                  error={form.formState.errors.companyName?.message}
                >
                  <input
                    id="co-name"
                    className="altrex-input"
                    {...form.register("companyName")}
                    autoComplete="organization"
                  />
                </Field>

                <Field
                  label="Company code"
                  htmlFor="co-code"
                  error={form.formState.errors.companyCode?.message}
                >
                  <input
                    id="co-code"
                    className="altrex-input"
                    style={{ textTransform: "uppercase" }}
                    {...form.register("companyCode", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      },
                    })}
                    autoComplete="off"
                  />
                </Field>

                <Field
                  label="GST number"
                  htmlFor="co-gst"
                  error={form.formState.errors.gstNo?.message}
                >
                  <input
                    id="co-gst"
                    className="altrex-input"
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    style={{ textTransform: "uppercase" }}
                    {...form.register("gstNo", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      },
                    })}
                    autoComplete="off"
                  />
                </Field>

                <Field
                  label="Registered address"
                  htmlFor="co-address"
                  error={form.formState.errors.address?.message}
                >
                  <textarea
                    id="co-address"
                    className="altrex-input altrex-textarea"
                    rows={3}
                    {...form.register("address")}
                    autoComplete="street-address"
                  />
                </Field>
              </div>
            )}

            {/* ── Step 2: Contact Details ── */}
            {step === 1 && (
              <div className="altrex-company-grid">
                <Field
                  label="Phone"
                  htmlFor="co-phone"
                  error={form.formState.errors.phone?.message}
                >
                  <div className="altrex-phone-row">
                    <span className="altrex-phone-prefix">+91</span>
                    <input
                      id="co-phone"
                      className="altrex-input altrex-input-phone"
                      type="tel"
                      maxLength={10}
                      placeholder="9XXXXXXXXX"
                      {...form.register("phone")}
                      autoComplete="tel-national"
                    />
                  </div>
                </Field>

                <Field
                  label="Company email"
                  htmlFor="co-email"
                  error={form.formState.errors.companyEmail?.message}
                >
                  <input
                    id="co-email"
                    className="altrex-input"
                    type="email"
                    {...form.register("companyEmail")}
                    autoComplete="email"
                  />
                </Field>
              </div>
            )}

            {/* ── Step 3: Subscription Plan ── */}
            {step === 2 && (
              <div>
                <div className="altrex-plan-grid">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        className={`altrex-plan-card ${isSelected ? "altrex-plan-card-selected" : ""} ${!plan.available ? "altrex-plan-card-disabled" : ""}`}
                        onClick={() => {
                          if (plan.available) {
                            form.setValue("subscriptionPlanId", plan.id, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        disabled={!plan.available}
                        aria-pressed={isSelected}
                      >
                        <div className="altrex-plan-header">
                          <strong className="altrex-plan-name">
                            {plan.name}
                          </strong>
                          {isSelected && (
                            <span
                              className="altrex-plan-selected-mark"
                              aria-label="Selected"
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="altrex-plan-body">
                          {plan.available ? (
                            <ul className="altrex-plan-features">
                              {plan.features.map((f) => (
                                <li key={f} className="altrex-plan-feature">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    aria-hidden="true"
                                  >
                                    <path
                                      d="M2.5 7l3 3L11.5 4"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="altrex-plan-coming-soon">
                              Coming soon
                            </p>
                          )}
                        </div>
                        <div className="altrex-plan-footer">
                          <span
                            className={`altrex-plan-btn ${plan.available ? "" : "altrex-plan-btn-disabled"}`}
                          >
                            {plan.available
                              ? `Select ${plan.name} Plan`
                              : "Unavailable"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.subscriptionPlanId && (
                  <small
                    className="altrex-form-error"
                    style={{ display: "block", marginTop: "12px" }}
                  >
                    {form.formState.errors.subscriptionPlanId.message}
                  </small>
                )}
              </div>
            )}

            {/* ── Step 4: Super Admin & Database ── */}
            {step === 3 && (
              <div className="altrex-company-grid">
                <Field
                  label="First name"
                  htmlFor="sa-first"
                  error={form.formState.errors.superAdminFirstName?.message}
                >
                  <input
                    id="sa-first"
                    className="altrex-input"
                    {...form.register("superAdminFirstName")}
                    autoComplete="given-name"
                  />
                </Field>

                <Field
                  label="Last name"
                  htmlFor="sa-last"
                  error={form.formState.errors.superAdminLastName?.message}
                >
                  <input
                    id="sa-last"
                    className="altrex-input"
                    {...form.register("superAdminLastName")}
                    autoComplete="family-name"
                  />
                </Field>

                <Field
                  label="Super admin email"
                  htmlFor="sa-email"
                  error={form.formState.errors.superAdminEmail?.message}
                >
                  <input
                    id="sa-email"
                    className="altrex-input"
                    type="email"
                    {...form.register("superAdminEmail")}
                    autoComplete="email"
                  />
                </Field>

                <Field
                  label="Super admin phone"
                  htmlFor="sa-phone"
                  error={form.formState.errors.superAdminPhone?.message}
                >
                  <div className="altrex-phone-row">
                    <span className="altrex-phone-prefix">+91</span>
                    <input
                      id="sa-phone"
                      className="altrex-input altrex-input-phone"
                      type="tel"
                      maxLength={10}
                      placeholder="9XXXXXXXXX"
                      {...form.register("superAdminPhone")}
                      autoComplete="tel-national"
                    />
                  </div>
                </Field>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="Password"
                    htmlFor="sa-password"
                    error={form.formState.errors.superAdminPassword?.message}
                  >
                    <div className="altrex-password-row">
                      <input
                        id="sa-password"
                        className="altrex-input"
                        type={showPassword ? "text" : "password"}
                        {...form.register("superAdminPassword")}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="altrex-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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

                  {/* Password strength meter */}
                  {passwordValue && (
                    <div className="altrex-strength-meter">
                      <div
                        className={`altrex-strength-bar altrex-strength-${strength.level}`}
                        style={{ width: `${strength.value}%` }}
                        role="progressbar"
                        aria-valuenow={strength.value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Password strength: ${strength.level}`}
                      />
                      <span
                        className={`altrex-strength-label altrex-strength-label-${strength.level}`}
                      >
                        {strength.level.charAt(0).toUpperCase() +
                          strength.level.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="Confirm password"
                    htmlFor="sa-confirm"
                    error={form.formState.errors.confirmPassword?.message}
                  >
                    <div className="altrex-password-row">
                      <input
                        id="sa-confirm"
                        className="altrex-input"
                        type={showConfirmPassword ? "text" : "password"}
                        {...form.register("confirmPassword")}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="altrex-password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
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
                </div>

                <Field
                  label="Database name"
                  htmlFor="db-name"
                  error={form.formState.errors.db_name?.message}
                >
                  <input
                    id="db-name"
                    className="altrex-input"
                    placeholder="e.g. acme_corp"
                    {...form.register("db_name")}
                    autoComplete="off"
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Navigation */}
          {serverError && step === 3 ? (
            <div className="altrex-auth-banner" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          ) : null}

          <div className="altrex-step-nav">
            {step > 0 && (
              <button
                type="button"
                className="altrex-button altrex-button-neutral"
                onClick={goBack}
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="altrex-button altrex-button-primary altrex-step-next"
                onClick={goNext}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="altrex-button altrex-button-primary altrex-step-next"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Creating company…"
                  : "Create company"}
              </button>
            )}
          </div>
        </form>
        <Link
          href="/register"
          className="altrex-auth-link"
          style={{ marginTop: "12px", display: "block", textAlign: "center" }}
        >
          Need to register an admin account first?
        </Link>
    </AuthCard>
  );
}
