"use client";

import {
  Building2,
  Edit2,
  Eye,
  Mail,
  MapPin,
  MoreVertical,
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
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../api";
import { PartyFormDrawer, PartyFormValues, PartyRecord } from "../../shared";

export function CustomerList() {
  const { data: customers = [], isLoading } = useCustomers();
  const { mutateAsync: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutateAsync: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutateAsync: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();

  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<PartyRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c: PartyRecord) =>
        c.party_name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.gst_no?.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (customer: PartyRecord) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const handleFormSubmit = async (values: PartyFormValues) => {
    try {
      if (selectedCustomer && (selectedCustomer.id || selectedCustomer.party_id)) {
        const id = selectedCustomer.id || selectedCustomer.party_id!;
        await updateCustomer({ id, body: values });
      } else {
        await createCustomer(values);
      }
      setDrawerOpen(false);
      setSelectedCustomer(null);
    } catch (err: any) {
      console.error("Failed to save customer:", err?.message || err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteCustomer(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Directory / Parties</span>
          <h1>Customers</h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="altrex-button altrex-button-primary"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="altrex-stat-grid">
        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Total Customers</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "color-mix(in srgb, var(--altrex-primary) 15%, transparent)", color: "var(--altrex-primary)", display: "grid", placeItems: "center" }}>
              <Users size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">{customers.length}</div>
          <span className="altrex-stat-helper">Registered business accounts</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">Active Directory</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", display: "grid", placeItems: "center" }}>
              <UserCheck size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {customers.filter((c: PartyRecord) => c.status !== "inactive").length}
          </div>
          <span className="altrex-stat-helper">Eligible for quotation & sales</span>
        </div>

        <div className="altrex-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="altrex-stat-label">With GSTIN</div>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", display: "grid", placeItems: "center" }}>
              <ShieldCheck size={17} />
            </div>
          </div>
          <div className="altrex-stat-value">
            {customers.filter((c: PartyRecord) => Boolean(c.gst_no)).length}
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
            {customers.reduce(
              (acc: number, c: PartyRecord) =>
                acc + (c.addresses?.length || c.tbl_party_addresses?.length || 0),
              0
            )}
          </div>
          <span className="altrex-stat-helper">Billing & shipping points</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 380,
          }}
        >
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--altrex-muted)",
            }}
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
          Showing <strong>{filteredCustomers.length}</strong> of{" "}
          <strong>{customers.length}</strong> customers
        </span>
      </div>

      {/* Data Table */}
      <div className="altrex-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="altrex-table">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Customer</th>
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
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 40, color: "var(--altrex-muted)" }}
                  >
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 48, color: "var(--altrex-muted)" }}
                  >
                    <UserCheck
                      size={32}
                      style={{ margin: "0 auto 10px", opacity: 0.5, display: "block" }}
                    />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>
                      No customers found
                    </div>
                    <p style={{ margin: "4px 0 14px", fontSize: 12 }}>
                      {searchQuery
                        ? "No results matched your search."
                        : "Start by registering your first customer account."}
                    </p>
                    {!searchQuery && (
                      <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="altrex-button altrex-button-secondary"
                        style={{ height: 32, fontSize: 12 }}
                      >
                        Add Customer
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c: PartyRecord, index: number) => {
                  const id = c.party_id ?? c.id ?? index;
                  const rowKey = `customer-${id}-${index}`;
                  const balance = parseFloat(String(c.opening_balance || 0));

                  return (
                    <tr key={rowKey}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: "var(--altrex-hover)",
                              color: "var(--altrex-primary)",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {c.party_name?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div>
                            <Link
                              href={`/parties/customers/${id}`}
                              style={{
                                color: "var(--altrex-text)",
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                              className="altrex-table-link"
                            >
                              {c.party_name}
                            </Link>
                            {c.email && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--altrex-muted)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Mail size={11} />
                                <span>{c.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: 13, color: "var(--altrex-text)", fontWeight: 500 }}>
                          {c.contact_name || "—"}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--altrex-text)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Phone size={12} style={{ color: "var(--altrex-muted)" }} />
                          <span>{c.phone || "—"}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: "monospace",
                            color: "var(--altrex-muted)",
                          }}
                        >
                          {c.gst_no || "—"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color:
                              balance > 0
                                ? "var(--altrex-text)"
                                : balance < 0
                                ? "var(--altrex-danger-text)"
                                : "var(--altrex-muted)",
                          }}
                        >
                          ₹ {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 4,
                          }}
                        >
                          <Link
                            href={`/parties/customers/${id}`}
                            className="altrex-icon-button"
                            style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                            title="View Details"
                            aria-label="View Details"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="altrex-icon-button"
                            style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }}
                            title="Edit Customer"
                            aria-label="Edit Customer"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(id)}
                            className="altrex-icon-button"
                            style={{
                              width: 32,
                              height: 32,
                              minWidth: 32,
                              minHeight: 32,
                              color: "var(--altrex-danger-text)",
                            }}
                            title="Delete Customer"
                            aria-label="Delete Customer"
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

      {/* Party Form Slide-Over Drawer */}
      <PartyFormDrawer
        partyType="customer"
        party={selectedCustomer}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            background: "rgba(0, 0, 0, 0.45)",
          }}
        >
          <div
            className="altrex-card"
            style={{
              maxWidth: 420,
              width: "100%",
              padding: 24,
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 17, color: "var(--altrex-text)" }}>
              Delete Customer
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--altrex-muted)" }}>
              Are you sure you want to remove this customer? This will deactivate the customer record
              from the directory.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="altrex-button altrex-button-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="altrex-button"
                style={{
                  background: "var(--altrex-danger-text)",
                  color: "#fff",
                  border: "none",
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
