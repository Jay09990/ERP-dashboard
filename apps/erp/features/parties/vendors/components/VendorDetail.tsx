"use client";

import { ArrowLeft, Edit2, ExternalLink, Globe, Mail, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useVendor, useUpdateVendor } from "../api";
import { PartyFormDrawer, PartyFormValues, PartyRecord } from "../../shared";

interface VendorDetailProps {
  id: string | number;
}

export function VendorDetail({ id }: VendorDetailProps) {
  const { data: vendor, isLoading } = useVendor(id);
  const { mutateAsync: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleFormSubmit = async (values: PartyFormValues) => {
    try {
      await updateVendor({ id, body: values });
      setDrawerOpen(false);
    } catch (err) {
      console.error("Failed to update vendor:", err);
    }
  };

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--altrex-muted)" }}>Loading vendor profile...</div>;
  }

  if (!vendor) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--altrex-muted)" }}>
        <p>Vendor not found.</p>
        <Link href="/parties/vendors" className="altrex-button altrex-button-secondary">Back to Vendors</Link>
      </div>
    );
  }

  const addresses = vendor.addresses || vendor.tbl_party_addresses || [];
  const contactPersons = vendor.contactPersons || vendor.tbl_party_contact_person || [];
  const balance = parseFloat(String(vendor.opening_balance || 0));

  return (
    <div>
      <div className="altrex-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/parties/vendors" className="altrex-icon-button" aria-label="Back to vendors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="altrex-eyebrow">Vendors / Profile</span>
            <h1>{vendor.party_name}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="altrex-button altrex-button-secondary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Edit2 size={15} />
          <span>Edit Vendor</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Identity */}
          <div className="altrex-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 18, borderBottom: "1px solid var(--altrex-line)", marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--altrex-hover)", color: "var(--altrex-primary)", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                {vendor.party_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: "var(--altrex-text)" }}>{vendor.party_name}</h2>
                <span style={{ fontSize: 13, color: "var(--altrex-muted)" }}>Vendor ID: #{id}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {vendor.phone && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>Phone</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Phone size={13} style={{ color: "var(--altrex-muted)" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--altrex-text)" }}>{vendor.phone}</span>
                  </div>
                </div>
              )}
              {vendor.email && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>Email</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Mail size={13} style={{ color: "var(--altrex-muted)" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--altrex-text)" }}>{vendor.email}</span>
                  </div>
                </div>
              )}
              {vendor.gst_no && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>GSTIN</span>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontFamily: "monospace", color: "var(--altrex-text)", fontWeight: 600 }}>{vendor.gst_no}</span>
                  </div>
                </div>
              )}
              {vendor.pan_no && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>PAN</span>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontFamily: "monospace", color: "var(--altrex-text)", fontWeight: 600 }}>{vendor.pan_no}</span>
                  </div>
                </div>
              )}
              {vendor.website && (
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>Website</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <Globe size={13} style={{ color: "var(--altrex-muted)" }} />
                    <a href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "var(--altrex-link)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      {vendor.website} <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )}
            </div>
            {vendor.notes && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--altrex-line)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>Notes</span>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--altrex-text)", lineHeight: 1.6 }}>{vendor.notes}</p>
              </div>
            )}
          </div>

          {/* Addresses */}
          {addresses.length > 0 && (
            <div className="altrex-card">
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={16} style={{ color: "var(--altrex-primary)" }} />
                Addresses ({addresses.length})
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {addresses.map((addr: any, i: number) => (
                  <div key={addr.address_id || addr.id || i} style={{ padding: 14, border: "1px solid var(--altrex-border)", borderRadius: 8, background: "var(--altrex-canvas)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--altrex-text)" }}>{addr.address_label || `Address ${i + 1}`}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "var(--altrex-hover)", color: "var(--altrex-primary)", padding: "2px 8px", borderRadius: 99 }}>{addr.address_type || "billing"}</span>
                    </div>
                    {addr.attention_to && <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: "var(--altrex-text)" }}>{addr.attention_to}</p>}
                    <p style={{ margin: 0, fontSize: 12, color: "var(--altrex-muted)", lineHeight: 1.6 }}>
                      {[addr.address_line1, addr.address_line2, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Persons */}
          {contactPersons.length > 0 && (
            <div className="altrex-card">
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
                <User size={16} style={{ color: "var(--altrex-primary)" }} />
                Contact Persons ({contactPersons.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {contactPersons.map((cp: any, i: number) => (
                  <div key={cp.person_id || cp.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: "1px solid var(--altrex-border)", borderRadius: 8, background: "var(--altrex-canvas)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--altrex-hover)", color: "var(--altrex-primary)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      {cp.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>{cp.name}</div>
                      <div style={{ fontSize: 12, color: "var(--altrex-muted)" }}>{[cp.email, cp.phone].filter(Boolean).join(" · ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Financial */}
        <div>
          <div className="altrex-card">
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: "var(--altrex-text)" }}>Financial Summary</h3>
            <div style={{ borderBottom: "1px solid var(--altrex-line)", paddingBottom: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--altrex-muted)" }}>Opening Balance</span>
              <div style={{ fontSize: 26, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: balance < 0 ? "var(--altrex-danger-text)" : "var(--altrex-text)", marginTop: 4 }}>
                ₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Address Points</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--altrex-text)" }}>{addresses.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>Contact Persons</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--altrex-text)" }}>{contactPersons.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PartyFormDrawer
        partyType="vendor"
        party={vendor as PartyRecord}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isUpdating}
      />
    </div>
  );
}
