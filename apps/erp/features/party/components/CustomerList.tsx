"use client";

import { useState } from "react";
import { DataTable, FilterBar, StatusPill } from "@altrex/ui";
import { useCustomers, useDeleteCustomer } from "../api";
import { PartyForm } from "./PartyForm";
import type { PartyFormValues } from "../schema";

export function CustomerList() {
  const { data: customers = [], isLoading, error } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<PartyFormValues | null>(null);

  const handleAdd = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  const handleEdit = (customer: PartyFormValues) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer.mutate(id);
    }
  };

  const handleSubmit = (values: PartyFormValues) => {
    // TODO: Implement create/update logic
    console.log("Customer form submitted:", values);
    setShowForm(false);
    setEditingCustomer(null);
  };

  if (isLoading) {
    return (
      <div className="altrex-table-state">
        <span className="altrex-spinner" />
        <span>Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="altrex-table-state altrex-table-state-error">
        <span>Error loading customers</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="altrex-table-state">
        <span>No customers found</span>
        <button onClick={handleAdd} className="altrex-button altrex-button-primary mt-4">
          Add Customer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Party Management</span>
          <h1>Customers</h1>
        </div>
        <button onClick={handleAdd} className="altrex-button altrex-button-primary">
          Add Customer
        </button>
      </div>

      <FilterBar>
        <input
          className="altrex-input"
          aria-label="Search customers"
          placeholder="Search customers"
        />
        <StatusPill status="Active" />
      </FilterBar>

      <DataTable
        columns={[
          { key: "party_name", label: "Customer Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "gst_no", label: "GST Number" },
          { key: "status", label: "Status" },
        ]}
        data={customers}
        onEdit={handleEdit}
        onDelete={(customer) => handleDelete(customer.id!)}
      />

      {showForm && (
        <div className="altrex-dialog-backdrop">
          <div className="altrex-dialog">
            <div className="altrex-dialog-header">
              <h2 className="altrex-dialog-title">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                }}
                className="altrex-icon-button"
              >
                ✕
              </button>
            </div>
            <div className="altrex-dialog-body">
              <PartyForm
                partyType="customer"
                initialValues={editingCustomer || undefined}
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