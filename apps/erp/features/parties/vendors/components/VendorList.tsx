"use client";

import {
  Building,
  Edit2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "../api";
import { PartyFormDrawer, PartyFormValues, PartyRecord } from "../../shared";

export function VendorList() {
  const { data: vendors = [], isLoading, error } = useVendors();
  const { mutateAsync: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutateAsync: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const { mutateAsync: deleteVendor, isPending: isDeleting } = useDeleteVendor();

  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<PartyRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const filteredVendors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return vendors;
    return vendors.filter(
      (v: PartyRecord) =>
        v.party_name?.toLowerCase().includes(q) ||
        v.phone?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.gst_no?.toLowerCase().includes(q) ||
        v.contact_name?.toLowerCase().includes(q)
    );
  }, [vendors, searchQuery]);

  const handleFormSubmit = async (values: PartyFormValues) => {
    try {
      if (selectedVendor && (selectedVendor.id || selectedVendor.party_id)) {
        const id = selectedVendor.id || selectedVendor.party_id!;
        await updateVendor({ id, body: values });
      } else {
        await createVendor(values);
      }
      setDrawerOpen(false);
      setSelectedVendor(null);
    } catch (err: any) {
      console.error("Failed to save vendor:", err?.message || err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteVendor(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete vendor:", err);
    }
  };

  return (
    <div>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Directory / Parties</span>
          <h1>Vendors</h1>
        </div>
        <button
          type="button"
          onClick={() => { setSelectedVendor(null); setDrawerOpen(true); }}
          className="altrex-button altrex-button-primary"
        >
          <Plus size={16} />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="altrex-stat-grid">
        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Total Vendors</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "color-mix(in srgb, var(--altrex-primary) 15%, transparent)", color: "var(--altrex-primary)", display: "grid", placeItems: "center" }}>
              <Building size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">{vendors.length}</div>
          <span className="altrex-stat-helper">Registered supplier accounts</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Active Suppliers</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", display: "grid", placeItems: "center" }}>
              <UserCheck size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {vendors.filter((v: PartyRecord) => v.status !== "inactive").length}
          </div>
          <span className="altrex-stat-helper">Eligible for purchase orders</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">With GSTIN</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", display: "grid", placeItems: "center" }}>
              <ShieldCheck size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {vendors.filter((v: PartyRecord) => Boolean(v.gst_no)).length}
          </div>
          <span className="altrex-stat-helper">Tax compliant entities</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Locations Saved</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(249, 115, 22, 0.15)", color: "#f97316", display: "grid", placeItems: "center" }}>
              <MapPin size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {vendors.reduce(
              (acc: number, v: PartyRecord) =>
                acc + (v.addresses?.length || v.tbl_party_addresses?.length || 0),
              0
            )}
          </div>
          <span className="altrex-stat-helper">Delivery & billing points</span>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="altrex-card"
        style={{
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--altrex-muted)" }}
          />
          <input
            type="text"
            className="altrex-input"
            placeholder="Search by name, phone, email, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: 36 }}
          />
        </div>
        <span style={{ fontSize: 13, color: "var(--altrex-muted)" }}>
          Showing <strong>{filteredVendors.length}</strong> of <strong>{vendors.length}</strong> vendors
        </span>
      </div>

      {/* Data Table */}
      <div className="altrex-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="altrex-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Vendor</th>
                <th style={{ width: "20%" }}>Contact Person</th>
                <th style={{ width: "15%" }}>Phone</th>
                <th style={{ width: "15%" }}>GSTIN</th>
                <th style={{ width: "15%", textAlign: "right" }}>Balance</th>
                <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--altrex-muted)" }}>
                    Loading vendor directory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--altrex-danger-text)" }}>
                    Could not load vendors from the server.
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--altrex-muted)" }}>
                    <Building size={32} style={{ margin: "0 auto 10px", opacity: 0.5, display: "block" }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>No vendors found</div>
                    <p style={{ margin: "4px 0 14px", fontSize: 12 }}>
                      {searchQuery ? "No results matched your search." : "Start by registering your first supplier."}
                    </p>
                    {!searchQuery && (
                      <button
                        type="button"
                        onClick={() => { setSelectedVendor(null); setDrawerOpen(true); }}
                        className="altrex-button altrex-button-secondary"
                        style={{ height: 32, fontSize: 12 }}
                      >
                        Add Vendor
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v: PartyRecord, index: number) => {
                  const id = v.party_id ?? v.id;
                  const rowKey = `vendor-${id}-${index}`;
                  const balance = parseFloat(String(v.opening_balance || 0));
                  return (
                    <tr key={rowKey}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34, height: 34, borderRadius: 8,
                              background: "var(--altrex-hover)", color: "var(--altrex-primary)",
                              display: "grid", placeItems: "center",
                              fontWeight: 800, fontSize: 13, flexShrink: 0,
                            }}
                          >
                            {v.party_name?.charAt(0).toUpperCase() || "V"}
                          </div>
                          <div>
                            <Link
                              href={id == null ? "/parties/vendors" : `/parties/vendors/${id}`}
                              style={{ color: "var(--altrex-text)", fontWeight: 700, textDecoration: "none" }}
                              className="altrex-table-link"
                            >
                              {v.party_name}
                            </Link>
                            {v.email && (
                              <div style={{ fontSize: 12, color: "var(--altrex-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                <Mail size={11} />
                                <span>{v.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: "var(--altrex-text)", fontWeight: 500 }}>
                          {v.contact_name || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: "var(--altrex-text)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={12} style={{ color: "var(--altrex-muted)" }} />
                          <span>{v.phone || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--altrex-muted)" }}>
                          {v.gst_no || "—"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: balance < 0 ? "var(--altrex-danger-text)" : "var(--altrex-text)" }}>
                          ₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                          <Link
                            href={id == null ? "/parties/vendors" : `/parties/vendors/${id}`}
                            className="altrex-icon-button"
                            style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                            title="View Details" aria-label="View Vendor Details"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => { setSelectedVendor(v); setDrawerOpen(true); }}
                            className="altrex-icon-button"
                            style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                            title="Edit Vendor" aria-label="Edit Vendor"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(id)}
                            className="altrex-icon-button"
                            style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, color: "var(--altrex-danger-text)" }}
                            title="Delete Vendor" aria-label="Delete Vendor"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PartyFormDrawer
        partyType="vendor"
        party={selectedVendor}
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedVendor(null); }}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {deleteId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.45)" }}>
          <div className="altrex-card" style={{ maxWidth: 420, width: "100%", padding: 24, boxShadow: "0 12px 32px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 17, color: "var(--altrex-text)" }}>Delete Vendor</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--altrex-muted)" }}>
              Are you sure you want to remove this vendor? The record will be deactivated from the directory.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setDeleteId(null)} className="altrex-button altrex-button-secondary" disabled={isDeleting}>Cancel</button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="altrex-button"
                style={{ background: "var(--altrex-danger-text)", color: "#fff", border: "none" }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
