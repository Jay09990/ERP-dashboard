"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@altrex/ui";
import { partySchema, type PartyFormValues, type PartyType } from "../schema";
import { AddressRepeater } from "./AddressRepeater";
import { ContactPersonRepeater } from "./ContactPersonRepeater";

interface PartyFormProps {
  partyType: PartyType;
  initialValues?: Partial<PartyFormValues>;
  onSubmit: (values: PartyFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PartyForm({
  partyType,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = partyType === "customer" ? "Save Customer" : "Save Vendor",
}: PartyFormProps) {
  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      party_type: partyType,
      party_name: "",
      phone: "",
      email: "",
      gst_no: "",
      pan_no: "",
      address: "",
      addresses: [
        {
          address_type: "billing",
          address_label: "",
          attention_to: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city_id: 0,
          state_id: 0,
          country_id: 0,
          pincode: "",
        },
      ],
      contactPersons: [
        {
          name: "",
          email: "",
          phone: "",
        },
      ],
      ...initialValues,
    },
  });

  const handleSubmit = (values: PartyFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
      <div className="altrex-company-grid">
        <div className="altrex-field">
          <label>
            {partyType === "customer" ? "Customer Name" : "Vendor Name"}
          </label>
          <Input {...form.register("party_name")} />
          {form.formState.errors.party_name && (
            <small className="altrex-form-error">
              {form.formState.errors.party_name.message}
            </small>
          )}
        </div>

        <div className="altrex-field">
          <label>Phone</label>
          <Input {...form.register("phone")} />
          {form.formState.errors.phone && (
            <small className="altrex-form-error">
              {form.formState.errors.phone.message}
            </small>
          )}
        </div>

        <div className="altrex-field">
          <label>Email</label>
          <Input {...form.register("email")} />
          {form.formState.errors.email && (
            <small className="altrex-form-error">
              {form.formState.errors.email.message}
            </small>
          )}
        </div>

        <div className="altrex-field">
          <label>GST Number</label>
          <Input {...form.register("gst_no")} />
        </div>

        <div className="altrex-field">
          <label>PAN Number</label>
          <Input {...form.register("pan_no")} />
        </div>

        <div className="altrex-field">
          <label>Address</label>
          <Input {...form.register("address")} />
        </div>
      </div>

      <AddressRepeater />
      <ContactPersonRepeater />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => form.reset()}
          className="altrex-button altrex-button-secondary"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="altrex-button altrex-button-primary"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}