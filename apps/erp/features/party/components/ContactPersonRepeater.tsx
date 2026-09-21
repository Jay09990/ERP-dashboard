"use client";

import { Input } from "@altrex/ui";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { PartyFormValues } from "../schema";

export function ContactPersonRepeater() {
  const { control } = useFormContext<PartyFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactPersons",
  });

  const addContactPerson = () => {
    append({
      name: "",
      email: "",
      phone: "",
    });
  };

  return (
    <div className="altrex-field">
      <label>Contact Persons</label>
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
              aria-label="Remove contact person"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="altrex-field">
                <label>Name</label>
                <Input {...control.register(`contactPersons.${index}.name`)} />
              </div>

              <div className="altrex-field">
                <label>Email</label>
                <Input {...control.register(`contactPersons.${index}.email`)} />
              </div>

              <div className="altrex-field col-span-2">
                <label>Phone</label>
                <Input {...control.register(`contactPersons.${index}.phone`)} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addContactPerson}
        className="altrex-button altrex-button-secondary mt-2"
      >
        <Plus size={16} />
        Add Contact Person
      </button>
    </div>
  );
}
