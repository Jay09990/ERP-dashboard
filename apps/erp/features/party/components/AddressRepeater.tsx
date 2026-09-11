"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@altrex/ui";
import type { AddressFormValues } from "../schema";

export function AddressRepeater() {
  const { control } = useFormContext<AddressFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  });

  const addAddress = () => {
    append({
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
    });
  };

  return (
    <div className="altrex-field">
      <label>Addresses</label>
      <div className="grid gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-[var(--altrex-border)] rounded-lg p-4 relative"
          >
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 text-[var(--altrex-muted)] hover:text-[var(--altrex-danger-text)]"
              aria-label="Remove address"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="altrex-field">
                <label>Address Type</label>
                <select
                  {...control.register(`addresses.${index}.address_type`)}
                  className="altrex-input altrex-select"
                >
                  <option value="billing">Billing</option>
                  <option value="shipping">Shipping</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="altrex-field">
                <label>Address Label</label>
                <Input {...control.register(`addresses.${index}.address_label`)} />
              </div>

              <div className="altrex-field">
                <label>Attention To</label>
                <Input {...control.register(`addresses.${index}.attention_to`)} />
              </div>

              <div className="altrex-field">
                <label>Phone</label>
                <Input {...control.register(`addresses.${index}.phone`)} />
              </div>

              <div className="altrex-field col-span-2">
                <label>Address Line 1</label>
                <Input {...control.register(`addresses.${index}.address_line1`)} />
              </div>

              <div className="altrex-field col-span-2">
                <label>Address Line 2</label>
                <Input {...control.register(`addresses.${index}.address_line2`)} />
              </div>

              <div className="altrex-field">
                <label>Country</label>
                <Input type="number" {...control.register(`addresses.${index}.country_id`)} />
              </div>

              <div className="altrex-field">
                <label>State</label>
                <Input type="number" {...control.register(`addresses.${index}.state_id`)} />
              </div>

              <div className="altrex-field">
                <label>City</label>
                <Input type="number" {...control.register(`addresses.${index}.city_id`)} />
              </div>

              <div className="altrex-field">
                <label>Pincode</label>
                <Input {...control.register(`addresses.${index}.pincode`)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addAddress}
        className="altrex-button altrex-button-secondary mt-2"
      >
        <Plus size={16} />
        Add Address
      </button>
    </div>
  );
}