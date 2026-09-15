"use client";

import { Button } from "@altrex/ui";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Edit,
  Globe,
  ImageIcon,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCompanyProfile } from "../api";
import { bankApi, cityApi, countryApi, stateApi } from "@/features/masters/api";
import { ProfileForm } from "./ProfileForm";

function extractRecords(value: unknown): Array<Record<string, any>> {
  if (Array.isArray(value)) return value as Array<Record<string, any>>;
  if (!value || typeof value !== "object") return [];
  for (const nested of Object.values(value as Record<string, any>)) {
    const records = extractRecords(nested);
    if (records.length) return records;
  }
  return [];
}

function normalizeProfile(data: any): Record<string, any> {
  if (!data || typeof data !== "object") return {};
  const profileDetails = data.profile_details ?? data.company ?? data.profile ?? data.data ?? (data.company_name ? data : {});
  const bankDetails = data.bank_details ?? data.bank ?? (data.account_no ? data : {});
  return {
    ...profileDetails,
    ...bankDetails,
    bank_id: bankDetails.bank_id ?? profileDetails.bank_id ?? null,
  };
}

export function CompanyProfileView() {
  const { data: profileData, isLoading } = useCompanyProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Master lookups
  const { data: banksData } = bankApi.useList();
  const { data: countriesData } = countryApi.useList();
  const { data: statesData } = stateApi.useList();
  const { data: citiesData } = cityApi.useList();

  const banks = extractRecords(banksData);
  const countries = extractRecords(countriesData);
  const states = extractRecords(statesData);
  const cities = extractRecords(citiesData);

  const profile = normalizeProfile(profileData);

  // Resolved lookup values
  const bankObj = banks.find((b) => String(b.bank_id ?? b.id) === String(profile.bank_id ?? ""));
  const bankName = bankObj ? (bankObj.bank_name ?? bankObj.name) : "";
  
  const countryObj = countries.find((c) => String(c.country_id ?? c.id) === String(profile.country_id ?? ""));
  const countryName = countryObj ? (countryObj.country_name ?? countryObj.name) : "";

  const stateObj = states.find((s) => String(s.state_id ?? s.id) === String(profile.state_id ?? ""));
  const stateName = stateObj ? (stateObj.state_name ?? stateObj.name) : "";

  const cityObj = cities.find((c) => String(c.city_id ?? c.id) === String(profile.city_id ?? ""));
  const cityName = cityObj ? (cityObj.city_name ?? cityObj.name) : "";

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="altrex-table-state" style={{ padding: "48px 0" }}>
        <span className="altrex-spinner" />
        <span>Loading company profile...</span>
      </div>
    );
  }

  const companyName = profile.company_name || "Company Name Not Set";
  const tradeName = profile.trade_name;
  const logo = profile.logo;
  const signature = profile.authorized_signature;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Top Hero / Header Card ── */}
      <div
        className="altrex-detail-card"
        style={{
          padding: "28px",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--altrex-primary) 8%, var(--altrex-surface)), var(--altrex-surface))",
          borderTop: "4px solid var(--altrex-primary)",
          borderRadius: "14px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Logo Avatar */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                border: "2px solid var(--altrex-border)",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {logo ? (
                <img src={logo} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <Building2 size={38} style={{ color: "var(--altrex-primary)" }} />
              )}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "var(--altrex-text)" }}>
                  {companyName}
                </h1>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    fontWeight: 600,
                    fontSize: "11px",
                  }}
                >
                  <ShieldCheck size={13} /> Active Profile
                </span>
              </div>

              {tradeName && (
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--altrex-muted)", fontWeight: 500 }}>
                  Trading as: <strong>{tradeName}</strong>
                </p>
              )}

              {/* Identity Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {profile.gst_no && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      background: "rgba(37,99,235,0.08)",
                      border: "1px solid rgba(37,99,235,0.2)",
                      color: "var(--altrex-primary)",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    GSTIN: {profile.gst_no}
                  </span>
                )}
                {profile.pan_no && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      background: "var(--altrex-raised)",
                      border: "1px solid var(--altrex-border)",
                      color: "var(--altrex-text)",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    PAN: {profile.pan_no}
                  </span>
                )}
                {profile.registration_number && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      background: "var(--altrex-raised)",
                      border: "1px solid var(--altrex-border)",
                      color: "var(--altrex-muted)",
                      fontSize: "12px",
                    }}
                  >
                    Reg #: {profile.registration_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            onClick={() => setIsEditModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "13.5px",
              fontWeight: 600,
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
            }}
          >
            <Edit size={16} />
            Edit Company Profile
          </Button>
        </div>

        {/* Quick Contact Bar */}
        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid var(--altrex-line)",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            fontSize: "13px",
            color: "var(--altrex-muted)",
          }}
        >
          {profile.contact_name && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} style={{ color: "var(--altrex-primary)" }} />
              <span>Contact: <strong>{profile.contact_name}</strong></span>
            </span>
          )}
          {profile.email && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={14} style={{ color: "var(--altrex-primary)" }} />
              <a href={`mailto:${profile.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                {profile.email}
              </a>
            </span>
          )}
          {profile.phone && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Phone size={14} style={{ color: "var(--altrex-primary)" }} />
              <a href={`tel:${profile.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                {profile.phone}
              </a>
            </span>
          )}
          {profile.website && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Globe size={14} style={{ color: "var(--altrex-primary)" }} />
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--altrex-primary)", fontWeight: 500, textDecoration: "none" }}
              >
                {profile.website}
              </a>
            </span>
          )}
        </div>
      </div>

      {/* ── Details Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        
        {/* 1. Identity & Registration */}
        <div className="altrex-detail-card" style={{ padding: "24px" }}>
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--altrex-text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Building2 size={18} style={{ color: "var(--altrex-primary)" }} />
            Company Identity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <DetailRow label="Legal Company Name" value={profile.company_name} bold />
            <DetailRow label="Trade / Brand Name" value={profile.trade_name} />
            <DetailRow label="GSTIN Number" value={profile.gst_no} copyable onCopy={() => handleCopy(profile.gst_no, "gst")} isCopied={copiedField === "gst"} />
            <DetailRow label="PAN Number" value={profile.pan_no} copyable onCopy={() => handleCopy(profile.pan_no, "pan")} isCopied={copiedField === "pan"} />
            <DetailRow label="Registration Number" value={profile.registration_number} />
            <DetailRow label="Primary Contact Person" value={profile.contact_name} />
          </div>
        </div>

        {/* 2. Contact & Address */}
        <div className="altrex-detail-card" style={{ padding: "24px" }}>
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--altrex-text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPin size={18} style={{ color: "var(--altrex-primary)" }} />
            Contact & Address Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <DetailRow label="Official Email" value={profile.email} />
            <DetailRow label="Phone Number" value={profile.phone} />
            <DetailRow label="Website" value={profile.website} />
            <DetailRow label="Address Line 1" value={profile.address_line1} />
            <DetailRow label="Address Line 2" value={profile.address_line2} />
            <DetailRow
              label="Location"
              value={
                [cityName, stateName, countryName].filter(Boolean).join(", ") || profile.address
              }
            />
            <DetailRow label="Pincode" value={profile.pincode} />
          </div>
        </div>

        {/* 3. Banking & Financial Details */}
        <div className="altrex-detail-card" style={{ padding: "24px", gridColumn: "1 / -1" }}>
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--altrex-text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Landmark size={18} style={{ color: "var(--altrex-primary)" }} />
            Banking & Financial Details
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <DetailRow label="Bank Name" value={bankName || profile.bank_name || "Not selected"} bold />
            <DetailRow label="Account Holder Name" value={profile.account_holder_name} />
            <DetailRow
              label="Account Number"
              value={profile.account_no}
              copyable
              onCopy={() => handleCopy(profile.account_no, "acc")}
              isCopied={copiedField === "acc"}
              bold
            />
            <DetailRow label="IFSC Code" value={profile.ifsc_code} copyable onCopy={() => handleCopy(profile.ifsc_code, "ifsc")} isCopied={copiedField === "ifsc"} />
            <DetailRow label="Branch Name" value={profile.branch_name} />
            <DetailRow label="SWIFT Code" value={profile.swift_code} />
            <DetailRow label="UPI ID / VPA" value={profile.upi_no} />
            <DetailRow
              label="Opening Balance"
              value={
                profile.opening_balance != null
                  ? `₹${Number(profile.opening_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : null
              }
            />
          </div>
        </div>

        {/* 4. Branding & Signature */}
        <div className="altrex-detail-card" style={{ padding: "24px", gridColumn: "1 / -1" }}>
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--altrex-text)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ImageIcon size={18} style={{ color: "var(--altrex-primary)" }} />
            Branding & Authorized Signature
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {/* Logo Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--altrex-muted)" }}>Company Logo</span>
              <div
                style={{
                  height: "120px",
                  borderRadius: "10px",
                  border: "1px dashed var(--altrex-border)",
                  background: "var(--altrex-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  overflow: "hidden",
                }}
              >
                {logo ? (
                  <img src={logo} alt="Company Logo" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--altrex-muted)" }}>No logo uploaded</span>
                )}
              </div>
            </div>

            {/* Signature Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--altrex-muted)" }}>Authorized Signature</span>
              <div
                style={{
                  height: "120px",
                  borderRadius: "10px",
                  border: "1px dashed var(--altrex-border)",
                  background: "var(--altrex-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  overflow: "hidden",
                }}
              >
                {signature ? (
                  <img src={signature} alt="Authorized Signature" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--altrex-muted)" }}>No signature uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal / Slide-over ── */}
      {isEditModalOpen && (
        <div
          className="altrex-dialog-backdrop"
          role="presentation"
          onClick={() => setIsEditModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "24px",
          }}
        >
          <div
            className="altrex-dialog"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "860px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--altrex-surface)",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--altrex-line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "var(--altrex-surface)",
                zIndex: 10,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--altrex-text)" }}>
                  Update Company Profile
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--altrex-muted)" }}>
                  Modify company identity, address, banking details, and uploaded logos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--altrex-muted)",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body with Form */}
            <div style={{ padding: "24px" }}>
              <ProfileForm
                isModal
                onSuccess={() => setIsEditModalOpen(false)}
                onCancel={() => setIsEditModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold = false,
  copyable = false,
  onCopy,
  isCopied = false,
}: {
  label: string;
  value?: string | number | null;
  bold?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: "8px",
        background: "var(--altrex-raised)",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "12.5px", color: "var(--altrex-muted)", fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "13px",
            color: value ? "var(--altrex-text)" : "var(--altrex-muted)",
            fontWeight: bold ? 700 : 500,
            fontStyle: value ? "normal" : "italic",
          }}
        >
          {value || "Not provided"}
        </span>
        {copyable && value && (
          <button
            type="button"
            onClick={onCopy}
            title="Copy to clipboard"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: isCopied ? "#10b981" : "var(--altrex-muted)",
              display: "flex",
              alignItems: "center",
              padding: "2px",
            }}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
