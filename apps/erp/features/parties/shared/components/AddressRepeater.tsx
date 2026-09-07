"use client";

import { LocationCascadeSelect } from "@/components/shared/LocationCascadeSelect";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { Control, useFieldArray, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PartyFormValues } from "../schema";

interface AddressRepeaterProps {
  control: Control<PartyFormValues>;
  register: UseFormRegister<PartyFormValues>;
  setValue: UseFormSetValue<PartyFormValues>;
  watch: UseFormWatch<PartyFormValues>;
  errors?: any;
}

export function AddressRepeater({
  control,
  register,
  setValue,
  watch,
  errors,
}: AddressRepeaterProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const handleAddAddress = () => {
    append({
      address_type: "billing",
      address_label: fields.length === 0 ? "Head Office" : `Branch ${fields.length + 1}`,
      attention_to: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      country_id: null,
      state_id: null,
      city_id: null,
      pincode: "",
    });
  };

  return (
    <div className="altrex-repeater-section">
      <div className="altrex-repeater-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--altrex-text)" }}>
            Addresses ({fields.length})
          </h4>
          <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
            Manage billing, shipping, and branch locations
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddAddress}
          className="altrex-button altrex-button-secondary"
          style={{ height: 32, fontSize: 12, padding: "0 10px", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={14} />
          <span>Add Address</span>
        </button>
      </div>

      {fields.length === 0 && (
        <div
          style={{
            padding: 20,
            border: "1px dashed var(--altrex-border)",
            borderRadius: 8,
            textAlign: "center",
            background: "var(--altrex-canvas)",
            color: "var(--altrex-muted)",
            fontSize: 13,
          }}
        >
          <MapPin size={24} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
          <p style={{ margin: 0 }}>No addresses added yet. Click &quot;Add Address&quot; above.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {fields.map((field, index) => {
          const countryId = watch(`addresses.${index}.country_id`);
          const stateId = watch(`addresses.${index}.state_id`);
          const cityId = watch(`addresses.${index}.city_id`);

          return (
            <div
              key={field.id}
              className="altrex-repeater-card"
              style={{
                border: "1px solid var(--altrex-border)",
                borderRadius: 8,
                padding: 16,
                background: "var(--altrex-surface)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid var(--altrex-line)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--altrex-hover)",
                      color: "var(--altrex-text)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--altrex-text)" }}>
                    {watch(`addresses.${index}.address_label`) || `Address #${index + 1}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="altrex-icon-button"
                  style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, color: "var(--altrex-danger-text)" }}
                  title="Remove Address"
                  aria-label="Remove Address"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="altrex-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="altrex-field">
                  <span>Address Label *</span>
                  <input
                    type="text"
                    className="altrex-input"
                    placeholder="e.g. Head Office, Warehouse"
                    {...register(`addresses.${index}.address_label`)}
                  />
                  {errors?.addresses?.[index]?.address_label && (
                    <span className="altrex-field-error">
                      {errors.addresses[index].address_label.message}
                    </span>
                  )}
                </label>

                <label className="altrex-field">
                  <span>Address Type</span>
                  <select
                    className="altrex-input altrex-select"
                    {...register(`addresses.${index}.address_type`)}
                  >
                    <option value="billing">Billing Address</option>
                    <option value="shipping">Shipping Address</option>
                    <option value="both">Both (Billing & Shipping)</option>
                  </select>
                </label>

                <label className="altrex-field">
                  <span>Attention / Recipient Name</span>
                  <input
                    type="text"
                    className="altrex-input"
                    placeholder="Contact person at address"
                    {...register(`addresses.${index}.attention_to`)}
                  />
                </label>

                <label className="altrex-field">
                  <span>Phone</span>
                  <input
                    type="text"
                    className="altrex-input"
                    placeholder="Address phone"
                    {...register(`addresses.${index}.phone`)}
                  />
                </label>

                <label className="altrex-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Address Line 1 *</span>
                  <input
                    type="text"
                    className="altrex-input"
                    placeholder="Building, street, area"
                    {...register(`addresses.${index}.address_line1`)}
                  />
                  {errors?.addresses?.[index]?.address_line1 && (
                    <span className="altrex-field-error">
                      {errors.addresses[index].address_line1.message}
                    </span>
                  )}
                </label>

                <label className="altrex-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Address Line 2</span>
                  <input
                    type="text"
                    className="altrex-input"
                    placeholder="Apartment, suite, unit (optional)"
                    {...register(`addresses.${index}.address_line2`)}
                  />
                </label>

                {/* Cascading Country -> State -> City */}
                <LocationCascadeSelect
                  countryId={countryId}
                  stateId={stateId}
                  cityId={cityId}
                  onCountryChange={(val) => setValue(`addresses.${index}.country_id`, val || null)}
                  onStateChange={(val) => setValue(`addresses.${index}.state_id`, val || null)}
                  onCityChange={(val) => setValue(`addresses.${index}.city_id`, val || null)}
                />

                <label className="altrex-field">
                  <span>Pincode / Postal Code</span>
                  <input
                    type="text"
                    className="altrex-input"
                    placeholder="e.g. 380001"
                    {...register(`addresses.${index}.pincode`)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
