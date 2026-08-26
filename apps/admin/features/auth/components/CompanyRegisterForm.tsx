"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Button } from "@altrex/ui";
import { type CompanyRegisterValues, companyRegisterSchema } from "../schema";

const fields: {
  name: keyof CompanyRegisterValues;
  label: string;
  type?: string;
}[] = [
  { name: "companyName", label: "Company name" },
  { name: "companyCode", label: "Company code" },
  { name: "companyEmail", label: "Company email", type: "email" },
  { name: "gstNo", label: "GST number" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address" },
  { name: "subscriptionPlanId", label: "Subscription plan" },
  { name: "superAdminFirstName", label: "Super admin first name" },
  { name: "superAdminLastName", label: "Super admin last name" },
  { name: "superAdminEmail", label: "Super admin email", type: "email" },
  { name: "superAdminPhone", label: "Super admin phone" },
  {
    name: "superAdminPassword",
    label: "Super admin password",
    type: "password",
  },
  { name: "db_name", label: "Database name" },
];

export function CompanyRegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const form = useForm<CompanyRegisterValues>({
    resolver: zodResolver(companyRegisterSchema),
  });
  const submit = async (values: CompanyRegisterValues) => {
    setServerError("");
    try {
      await apiClient.post(endpoints.companies, values);
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
    <main className="altrex-auth-page">
      <section className="altrex-auth-panel altrex-auth-panel-wide">
        <span className="altrex-eyebrow">Tenant setup</span>
        <h1>Register a company</h1>
        <p className="altrex-auth-description">
          Create the company and its first super admin in one operation.
        </p>
        <form
          className="altrex-auth-form altrex-company-form"
          onSubmit={form.handleSubmit(submit)}
        >
          {fields.map((field) => (
            <label className="altrex-field" key={field.name}>
              <span>{field.label}</span>
              <input
                className="altrex-input"
                type={
                  field.name === "subscriptionPlanId"
                    ? "number"
                    : (field.type ?? "text")
                }
                {...form.register(field.name)}
              />
              {form.formState.errors[field.name] ? (
                <small className="altrex-form-error">
                  This field is required
                </small>
              ) : null}
            </label>
          ))}
          {serverError ? (
            <p className="altrex-form-error">{serverError}</p>
          ) : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Creating company..."
              : "Create company"}
          </Button>
        </form>
      </section>
    </main>
  );
}
