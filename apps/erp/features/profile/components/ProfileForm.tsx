"use client";

import { LocationCascadeSelect } from "@/components/shared/LocationCascadeSelect";
import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCompanyProfile, useUpdateCompanyProfile } from "../api";
import { type ProfileValues, profileSchema } from "../schema";
import { useSessionStore } from "@/stores/session-store";

export function ProfileForm() {
  const { data: profile, isLoading } = useCompanyProfile();
  const { mutate: updateProfile, isPending } = useUpdateCompanyProfile();
  const session = useSessionStore((state) => state.session);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: session?.company?.name || "",
      trade_name: "",
      logo: null,
      registration_number: "",
      gst_no: session?.company?.gstNo || "",
      pan_no: "",
      phone: session?.company?.phone || session?.user?.phone || "",
      email: session?.company?.email || session?.user?.email || "",
      website: "",
      contact_name: session?.user?.name || "",
      authorized_signature: null,
      address_line1: session?.company?.address || "",
      address_line2: "",
      city_id: null,
      state_id: null,
      country_id: null,
      pincode: "",
      bank_id: null,
      account_holder_name: "",
      account_no: "",
      ifsc_code: "",
      swift_code: "",
      branch_name: "",
      upi_no: "",
      opening_balance: null,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileValues) => {
    updateProfile(values);
  };

  if (isLoading) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="altrex-detail-grid">
      {/* Identity Section */}
      <section className="altrex-detail-card">
        <h2 className="altrex-detail-card-title">Company Identity</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <label className="altrex-field">
            <span>
              Company Name{" "}
              <span style={{ color: "var(--altrex-danger-text)" }}>*</span>
            </span>
            <input
              className="altrex-input"
              {...form.register("company_name")}
            />
            {form.formState.errors.company_name && (
              <p className="altrex-form-error">
                {form.formState.errors.company_name.message}
              </p>
            )}
          </label>
          <label className="altrex-field">
            <span>Trade Name</span>
            <input className="altrex-input" {...form.register("trade_name")} />
          </label>
          <label className="altrex-field">
            <span>GST Number</span>
            <input className="altrex-input" {...form.register("gst_no")} />
          </label>
          <label className="altrex-field">
            <span>PAN Number</span>
            <input className="altrex-input" {...form.register("pan_no")} />
          </label>
          <label className="altrex-field">
            <span>Registration Number</span>
            <input
              className="altrex-input"
              {...form.register("registration_number")}
            />
          </label>
          <label className="altrex-field">
            <span>Contact Name</span>
            <input
              className="altrex-input"
              {...form.register("contact_name")}
            />
          </label>
          <label className="altrex-field">
            <span>Email</span>
            <input
              className="altrex-input"
              type="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="altrex-form-error">
                {form.formState.errors.email.message}
              </p>
            )}
          </label>
          <label className="altrex-field">
            <span>Phone</span>
            <input
              className="altrex-input"
              type="tel"
              {...form.register("phone")}
            />
          </label>
          <label className="altrex-field">
            <span>Website</span>
            <input
              className="altrex-input"
              type="url"
              {...form.register("website")}
            />
          </label>
        </div>
      </section>

      {/* Address Section */}
      <section className="altrex-detail-card">
        <h2 className="altrex-detail-card-title">Address</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label className="altrex-field">
            <span>Address Line 1</span>
            <input
              className="altrex-input"
              {...form.register("address_line1")}
            />
          </label>
          <label className="altrex-field">
            <span>Address Line 2</span>
            <input
              className="altrex-input"
              {...form.register("address_line2")}
            />
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <LocationCascadeSelect
              countryId={form.watch("country_id")}
              stateId={form.watch("state_id")}
              cityId={form.watch("city_id")}
              onCountryChange={(v) => form.setValue("country_id", v)}
              onStateChange={(v) => form.setValue("state_id", v)}
              onCityChange={(v) => form.setValue("city_id", v)}
            />
            <label className="altrex-field">
              <span>Pincode</span>
              <input className="altrex-input" {...form.register("pincode")} />
            </label>
          </div>
        </div>
      </section>

      {/* Banking Section */}
      <section className="altrex-detail-card">
        <h2 className="altrex-detail-card-title">Banking Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <label className="altrex-field">
            <span>Account Holder Name</span>
            <input
              className="altrex-input"
              {...form.register("account_holder_name")}
            />
          </label>
          <label className="altrex-field">
            <span>Account Number</span>
            <input className="altrex-input" {...form.register("account_no")} />
          </label>
          <label className="altrex-field">
            <span>IFSC Code</span>
            <input className="altrex-input" {...form.register("ifsc_code")} />
          </label>
          <label className="altrex-field">
            <span>Swift Code</span>
            <input className="altrex-input" {...form.register("swift_code")} />
          </label>
          <label className="altrex-field">
            <span>Branch Name</span>
            <input className="altrex-input" {...form.register("branch_name")} />
          </label>
          <label className="altrex-field">
            <span>UPI Number</span>
            <input className="altrex-input" {...form.register("upi_no")} />
          </label>
          <label className="altrex-field">
            <span>Opening Balance</span>
            <input
              className="altrex-input"
              type="number"
              step="0.01"
              {...form.register("opening_balance")}
            />
          </label>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "24px 0",
        }}
      >
        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
