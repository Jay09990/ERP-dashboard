"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { currencyApi } from "@/features/masters/api";
import { AddressRepeater } from "./AddressRepeater";
import { ContactPersonRepeater } from "./ContactPersonRepeater";
import { partySchema, PartyFormValues } from "../schema";
import { PartyRecord, PartyType } from "../types";

interface PartyFormDrawerProps {
  partyType: PartyType;
  party?: PartyRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartyFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function PartyFormDrawer({
  partyType,
  party,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PartyFormDrawerProps) {
  const isEdit = Boolean(party && (party.id || party.party_id));
  const title = isEdit
    ? `Edit ${partyType === "customer" ? "Customer" : "Vendor"}`
    : `New ${partyType === "customer" ? "Customer" : "Vendor"}`;

  // Currency master data is shared with Items and transactional documents.
  const { data: currencyData = [] } = currencyApi.useList();
  const currencies = Array.isArray(currencyData) ? currencyData : (currencyData as any).data || [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      party_name: "",
      phone: "",
      email: "",
      gst_no: "",
      pan_no: "",
      website: "",
      contact_name: "",
      notes: "",
      opening_balance: "0",
      currency_id: 1,
      addresses: [],
      contactPersons: [],
    },
  });

  // Pre-fill form on edit or reset on open
  useEffect(() => {
    if (isOpen) {
      if (party) {
        const addresses = party.addresses || party.tbl_party_addresses || [];
        const contactPersons =
          party.contactPersons || party.tbl_party_contact_person || [];

        reset({
          party_name: party.party_name || "",
          phone: party.phone || "",
          email: party.email || "",
          gst_no: party.gst_no || "",
          pan_no: party.pan_no || "",
          website: party.website || "",
          contact_name: party.contact_name || "",
          notes: party.notes || "",
          opening_balance: party.opening_balance?.toString() || "0",
          currency_id: party.currency_id || 1,
          addresses: addresses.map((a: any) => ({
            address_id: a.address_id || a.id,
            address_type: (a.address_type as any) || "billing",
            address_label: a.address_label || "Office",
            attention_to: a.attention_to || "",
            phone: a.phone || "",
            address_line1: a.address_line1 || "",
            address_line2: a.address_line2 || "",
            country_id: a.country_id || null,
            state_id: a.state_id || null,
            city_id: a.city_id || null,
            pincode: a.pincode || "",
          })),
          contactPersons: contactPersons.map((c: any) => ({
            person_id: c.person_id || c.id,
            name: c.name || "",
            email: c.email || "",
            phone: c.phone || "",
          })),
        });
      } else {
        reset({
          party_name: "",
          phone: "",
          email: "",
          gst_no: "",
          pan_no: "",
          website: "",
          contact_name: "",
          notes: "",
          opening_balance: "0",
          currency_id: 1,
          addresses: [
            {
              address_type: "billing",
              address_label: "Head Office",
              attention_to: "",
              phone: "",
              address_line1: "",
              address_line2: "",
              country_id: null,
              state_id: null,
              city_id: null,
              pincode: "",
            },
          ],
          contactPersons: [],
        });
      }
    }
  }, [isOpen, party, reset]);

  const handleSave = async (data: PartyFormValues) => {
    const parseFk = (val: any) => {
      if (!val) return null;
      const s = String(val);
      if (s.startsWith("fb_") || s.startsWith("fallback") || isNaN(Number(s))) return null;
      return Number(s);
    };

    const formattedData: PartyFormValues = {
      ...data,
      currency_id: data.currency_id ? Number(data.currency_id) : 1,
      opening_balance: data.opening_balance ? String(data.opening_balance) : "0",
      authorized_signature: data.authorized_signature || "",
      addresses: (data.addresses || []).map((addr) => ({
        ...addr,
        country_id: parseFk(addr.country_id),
        state_id: parseFk(addr.state_id),
        city_id: parseFk(addr.city_id),
      })),
      contactPersons: (data.contactPersons || []).map((cp) => ({
        ...cp,
        email: cp.email || "",
        phone: cp.phone || "",
      })),
    };
    await onSubmit(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(0, 0, 0, 0.45)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          height: "100%",
          background: "var(--altrex-canvas)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.2)",
          animation: "slideInRight 180ms ease-out",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            height: 64,
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--altrex-border)",
            background: "var(--altrex-surface)",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: "var(--altrex-text)",
              }}
            >
              {title}
            </h3>
            <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
              {isEdit
                ? `Update ${partyType} profile and locations`
                : `Register a new ${partyType} in the directory`}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="altrex-icon-button"
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form
          onSubmit={handleSubmit(handleSave)}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Section 1: Basic Identity */}
          <div
            style={{
              padding: 18,
              border: "1px solid var(--altrex-border)",
              borderRadius: 8,
              background: "var(--altrex-surface)",
            }}
          >
            <h4
              style={{
                margin: "0 0 14px",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--altrex-text)",
              }}
            >
              Basic Details
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <label
                className="altrex-field"
                style={{ gridColumn: "1 / -1" }}
              >
                <span>
                  {partyType === "customer"
                    ? "Customer Name *"
                    : "Vendor / Company Name *"}
                </span>
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="e.g. Acme Corporation"
                  {...register("party_name")}
                />
                {errors.party_name && (
                  <span className="altrex-field-error">
                    {errors.party_name.message}
                  </span>
                )}
              </label>

              <label className="altrex-field">
                <span>Phone Number *</span>
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="e.g. +91 9876543210"
                  {...register("phone")}
                />
                {errors.phone && (
                  <span className="altrex-field-error">
                    {errors.phone.message}
                  </span>
                )}
              </label>

              <label className="altrex-field">
                <span>Email Address</span>
                <input
                  type="email"
                  className="altrex-input"
                  placeholder="billing@company.com"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="altrex-field-error">
                    {errors.email.message}
                  </span>
                )}
              </label>

              <label className="altrex-field">
                <span>Primary Contact Person</span>
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="e.g. Jane Doe"
                  {...register("contact_name")}
                />
              </label>

              <label className="altrex-field">
                <span>Website</span>
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="https://example.com"
                  {...register("website")}
                />
              </label>

              <label className="altrex-field">
                <span>GSTIN / Tax ID</span>
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="24AAAAA0000A1Z5"
                  {...register("gst_no")}
                />
              </label>

              <label className="altrex-field">
                <span>PAN Number</span>
                <input
                  type="text"
                  className="altrex-input"
                  placeholder="AAAAA0000A"
                  {...register("pan_no")}
                />
              </label>
            </div>
          </div>

          {/* Section 2: Financial Terms */}
          <div
            style={{
              padding: 18,
              border: "1px solid var(--altrex-border)",
              borderRadius: 8,
              background: "var(--altrex-surface)",
            }}
          >
            <h4
              style={{
                margin: "0 0 14px",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--altrex-text)",
              }}
            >
              Financial & Currency
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <label className="altrex-field">
                <span>Currency</span>
                <select
                  className="altrex-input altrex-select"
                  {...register("currency_id")}
                >
                  {currencies.map((c: any) => (
                    <option
                      key={c.id ?? c.currency_id}
                      value={c.id ?? c.currency_id}
                    >
                      {c.currency_code ?? c.code ?? "INR"} (
                      {c.currency_name ?? c.name ?? "Indian Rupee"})
                    </option>
                  ))}
                  {currencies.length === 0 && (
                    <option value={1}>INR (Indian Rupee)</option>
                  )}
                </select>
              </label>

              <label className="altrex-field">
                <span>Opening Balance</span>
                <input
                  type="number"
                  step="0.01"
                  className="altrex-input"
                  placeholder="0.00"
                  {...register("opening_balance")}
                />
              </label>
            </div>
          </div>

          {/* Section 3: Addresses Repeater */}
          <AddressRepeater
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />

          {/* Section 4: Contact Persons Repeater */}
          <ContactPersonRepeater
            control={control}
            register={register}
            errors={errors}
          />

          {/* Section 5: Remarks / Notes */}
          <div
            style={{
              padding: 18,
              border: "1px solid var(--altrex-border)",
              borderRadius: 8,
              background: "var(--altrex-surface)",
            }}
          >
            <label className="altrex-field" style={{ margin: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                Internal Notes & Remarks
              </span>
              <textarea
                className="altrex-input"
                rows={3}
                placeholder="Add special notes, payment terms, or instructions..."
                style={{ height: "auto", padding: 10 }}
                {...register("notes")}
              />
            </label>
          </div>

          {/* Drawer Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 12,
              paddingTop: 16,
              borderTop: "1px solid var(--altrex-border)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="altrex-button altrex-button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="altrex-button altrex-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? `Update ${partyType === "customer" ? "Customer" : "Vendor"}`
                : `Create ${partyType === "customer" ? "Customer" : "Vendor"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
