"use client";

import { DataTable, FilterBar, StatusPill } from "@altrex/ui";
import { useState } from "react";
import { useDeleteVendor, useVendors } from "../api";
import type { PartyFormValues } from "../schema";
import { PartyForm } from "./PartyForm";

export function VendorList() {
  const { data: vendors = [], isLoading, error } = useVendors();
  const deleteVendor = useDeleteVendor();
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<PartyFormValues | null>(
    null,
  );

  const handleAdd = () => {
    setEditingVendor(null);
    setShowForm(true);
  };

  const handleEdit = (vendor: PartyFormValues) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteVendor.mutate(id);
    }
  };

  const handleSubmit = (values: PartyFormValues) => {
    // TODO: Implement create/update logic
    console.log("Vendor form submitted:", values);
    setShowForm(false);
    setEditingVendor(null);
  };

  if (isLoading) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading vendors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="altrex-table-state altrex-table-state-error">
        <span>Error loading vendors</span>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="altrex-table-state">
        <span>No vendors found</span>
        <button
          onClick={handleAdd}
          className="altrex-button altrex-button-primary mt-4"
        >
          Add Vendor
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Party Management</span>
          <h1>Vendors</h1>
        </div>
        <button
          onClick={handleAdd}
          className="altrex-button altrex-button-primary"
        >
          Add Vendor
        </button>
      </div>

      <FilterBar>
        <input
          className="altrex-input"
          aria-label="Search vendors"
          placeholder="Search vendors"
        />
        <StatusPill status="Active" />
      </FilterBar>

      <DataTable
        columns={[
          { key: "party_name", label: "Vendor Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "gst_no", label: "GST Number" },
          { key: "status", label: "Status" },
          {
            key: "id",
            label: "Actions",
            render: (vendor) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => handleEdit(vendor as any)}
                  className="altrex-button altrex-button-secondary"
                  style={{ padding: "4px 8px", fontSize: "12px" }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => vendor.id && handleDelete(vendor.id)}
                  className="altrex-button altrex-button-danger"
                  style={{ padding: "4px 8px", fontSize: "12px" }}
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        data={vendors}
      />

      {showForm && (
        <div className="altrex-dialog-backdrop">
          <div className="altrex-dialog">
            <div className="altrex-dialog-header">
              <h2 className="altrex-dialog-title">
                {editingVendor ? "Edit Vendor" : "Add Vendor"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingVendor(null);
                }}
                className="altrex-icon-button"
              >
                ✕
              </button>
            </div>
            <div className="altrex-dialog-body">
              <PartyForm
                partyType="vendor"
                initialValues={editingVendor || undefined}
                onSubmit={handleSubmit}
                isSubmitting={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
