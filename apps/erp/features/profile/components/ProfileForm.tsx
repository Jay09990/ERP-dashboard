"use client";

import { LocationCascadeSelect } from "@/components/shared/LocationCascadeSelect";
import { Button } from "@altrex/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CreditCard,
  ImageIcon,
  Info,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Save,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCompanyProfile, useUpdateCompanyProfile } from "../api";
import { type ProfileValues, profileSchema } from "../schema";
import { useSessionStore } from "@/stores/session-store";

type Tab = "identity" | "contact" | "banking" | "branding";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "identity", label: "Company Identity", icon: <Building2 size={15} /> },
  { id: "contact", label: "Contact & Location", icon: <MapPin size={15} /> },
  { id: "banking", label: "Banking & Financials", icon: <Landmark size={15} /> },
  { id: "branding", label: "Branding & Logos", icon: <ImageIcon size={15} /> },
];

function FileDropZone({
  label,
  value,
  onChange,
  accept = "image/*",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (val: string | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: "var(--altrex-text)" }}>
        {label}
      </div>
      {value ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={value}
            alt={label}
            style={{
              maxHeight: "100px",
              maxWidth: "240px",
              borderRadius: "8px",
              border: "1px solid var(--altrex-border)",
              objectFit: "contain",
              background: "var(--altrex-raised)",
              padding: "8px",
            }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "var(--altrex-danger-text)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          style={{
            border: "2px dashed var(--altrex-border)",
            borderRadius: "10px",
            padding: "28px 24px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            background: "var(--altrex-raised)",
            transition: "border-color 150ms",
            maxWidth: "280px",
          }}
        >
          <Upload size={24} style={{ color: "var(--altrex-muted)" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--altrex-text)" }}>
            Click or drag to upload
          </span>
          <span style={{ fontSize: "11px", color: "var(--altrex-muted)" }}>
            PNG, JPG, SVG up to 2MB
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

export function ProfileForm() {
  const { data: profile, isLoading } = useCompanyProfile();
  const { mutate: updateProfile, isPending } = useUpdateCompanyProfile();
  const session = useSessionStore((state) => state.session);
  const [activeTab, setActiveTab] = useState<Tab>("identity");

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

  const isDirty = form.formState.isDirty;
  const companyName = form.watch("company_name");
  const gstNo = form.watch("gst_no");
  const logo = form.watch("logo");

  if (isLoading) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Company Hero Card */}
      <div
        className="altrex-detail-card"
        style={{
          padding: "24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--altrex-primary) 6%, var(--altrex-surface)), var(--altrex-surface))",
          borderTop: "3px solid var(--altrex-primary)",
        }}
      >
        {/* Logo / Avatar */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "16px",
            border: "2px solid var(--altrex-border)",
            background: "var(--altrex-raised)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {logo ? (
            <img src={logo} alt="Company logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <Building2 size={32} style={{ color: "var(--altrex-primary)" }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700, color: "var(--altrex-text)" }}>
            {companyName || "Company Name"}
          </h2>
          {gstNo && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--altrex-muted)" }}>
              <span style={{
                padding: "2px 8px",
                borderRadius: "6px",
                background: "rgba(37,99,235,0.1)",
                color: "var(--altrex-primary)",
                fontWeight: 600,
                fontSize: "11px",
              }}>
                GST: {gstNo}
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            {form.watch("email") && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--altrex-muted)" }}>
                <Mail size={12} /> {form.watch("email")}
              </span>
            )}
            {form.watch("phone") && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--altrex-muted)" }}>
                <Phone size={12} /> {form.watch("phone")}
              </span>
            )}
          </div>
        </div>

        {isDirty && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Info size={14} />
            Unsaved changes
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          borderBottom: "1px solid var(--altrex-line)",
          marginBottom: "24px",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--altrex-primary)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--altrex-primary)" : "var(--altrex-muted)",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 150ms",
              marginBottom: "-1px",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="altrex-detail-grid">
        {/* ── Company Identity Tab ── */}
        {activeTab === "identity" && (
          <section className="altrex-detail-card">
            <h2 className="altrex-detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={16} style={{ color: "var(--altrex-primary)" }} />
              Company Identity
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <label className="altrex-field">
                <span>
                  Company Name{" "}
                  <span style={{ color: "var(--altrex-danger-text)" }}>*</span>
                </span>
                <input className="altrex-input" {...form.register("company_name")} />
                {form.formState.errors.company_name && (
                  <p className="altrex-form-error">{form.formState.errors.company_name.message}</p>
                )}
              </label>
              <label className="altrex-field">
                <span>Trade Name</span>
                <input className="altrex-input" {...form.register("trade_name")} />
              </label>
              <label className="altrex-field">
                <span>GST Number</span>
                <input className="altrex-input" placeholder="e.g. 27AAPFU0939F1ZV" {...form.register("gst_no")} />
              </label>
              <label className="altrex-field">
                <span>PAN Number</span>
                <input className="altrex-input" placeholder="e.g. AAPFU0939F" {...form.register("pan_no")} />
              </label>
              <label className="altrex-field">
                <span>Registration Number</span>
                <input className="altrex-input" {...form.register("registration_number")} />
              </label>
              <label className="altrex-field">
                <span>Contact Name</span>
                <input className="altrex-input" {...form.register("contact_name")} />
              </label>
            </div>
          </section>
        )}

        {/* ── Contact & Location Tab ── */}
        {activeTab === "contact" && (
          <section className="altrex-detail-card">
            <h2 className="altrex-detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={16} style={{ color: "var(--altrex-primary)" }} />
              Contact & Location
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <label className="altrex-field">
                  <span>Email</span>
                  <input className="altrex-input" type="email" {...form.register("email")} />
                  {form.formState.errors.email && (
                    <p className="altrex-form-error">{form.formState.errors.email.message}</p>
                  )}
                </label>
                <label className="altrex-field">
                  <span>Phone</span>
                  <input className="altrex-input" type="tel" {...form.register("phone")} />
                </label>
                <label className="altrex-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Website</span>
                  <input className="altrex-input" type="url" placeholder="https://" {...form.register("website")} />
                </label>
              </div>
              <div style={{ height: "1px", background: "var(--altrex-line)" }} />
              <label className="altrex-field">
                <span>Address Line 1</span>
                <input className="altrex-input" {...form.register("address_line1")} />
              </label>
              <label className="altrex-field">
                <span>Address Line 2</span>
                <input className="altrex-input" {...form.register("address_line2")} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
        )}

        {/* ── Banking & Financials Tab ── */}
        {activeTab === "banking" && (
          <section className="altrex-detail-card">
            <h2 className="altrex-detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={16} style={{ color: "var(--altrex-primary)" }} />
              Banking & Financials
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <label className="altrex-field">
                <span>Account Holder Name</span>
                <input className="altrex-input" {...form.register("account_holder_name")} />
              </label>
              <label className="altrex-field">
                <span>Account Number</span>
                <input className="altrex-input" {...form.register("account_no")} />
              </label>
              <label className="altrex-field">
                <span>IFSC Code</span>
                <input className="altrex-input" placeholder="e.g. SBIN0001234" {...form.register("ifsc_code")} />
              </label>
              <label className="altrex-field">
                <span>SWIFT Code</span>
                <input className="altrex-input" {...form.register("swift_code")} />
              </label>
              <label className="altrex-field">
                <span>Branch Name</span>
                <input className="altrex-input" {...form.register("branch_name")} />
              </label>
              <label className="altrex-field">
                <span>UPI Number / VPA</span>
                <input className="altrex-input" placeholder="e.g. company@upi" {...form.register("upi_no")} />
              </label>
              <label className="altrex-field">
                <span>Opening Balance</span>
                <input
                  className="altrex-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("opening_balance")}
                />
              </label>
            </div>
          </section>
        )}

        {/* ── Branding & Logos Tab ── */}
        {activeTab === "branding" && (
          <section className="altrex-detail-card">
            <h2 className="altrex-detail-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ImageIcon size={16} style={{ color: "var(--altrex-primary)" }} />
              Branding & Logos
            </h2>
            <p style={{ fontSize: "13px", color: "var(--altrex-muted)", marginTop: 0, marginBottom: "24px" }}>
              Upload your company logo and authorized signature — these will appear on invoices and documents.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <Controller
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FileDropZone
                    label="Company Logo"
                    value={field.value as string | null}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="authorized_signature"
                render={({ field }) => (
                  <FileDropZone
                    label="Authorized Signature"
                    value={field.value as string | null}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </section>
        )}
      </div>

      {/* Sticky Save Bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--altrex-surface)",
          borderTop: "1px solid var(--altrex-line)",
          padding: "16px 0",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          marginTop: "24px",
          zIndex: 10,
        }}
      >
        {isDirty && (
          <span style={{ fontSize: "13px", color: "var(--altrex-muted)" }}>
            You have unsaved changes
          </span>
        )}
        <Button
          type="submit"
          disabled={isPending || !isDirty}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Save size={15} />
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
