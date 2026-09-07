"use client";

import { Plus, Trash2, User } from "lucide-react";
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { PartyFormValues } from "../schema";

interface ContactPersonRepeaterProps {
  control: Control<PartyFormValues>;
  register: UseFormRegister<PartyFormValues>;
  errors?: any;
}

export function ContactPersonRepeater({
  control,
  register,
  errors,
}: ContactPersonRepeaterProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactPersons",
  });

  const handleAddPerson = () => {
    append({
      name: "",
      email: "",
      phone: "",
    });
  };

  return (
    <div className="altrex-repeater-section">
      <div
        className="altrex-repeater-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "var(--altrex-text)",
            }}
          >
            Contact Persons ({fields.length})
          </h4>
          <span style={{ fontSize: 12, color: "var(--altrex-muted)" }}>
            Key representatives, department leads, or account managers
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddPerson}
          className="altrex-button altrex-button-secondary"
          style={{
            height: 32,
            fontSize: 12,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={14} />
          <span>Add Contact</span>
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
          <User size={24} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
          <p style={{ margin: 0 }}>
            No additional contact persons. Click &quot;Add Contact&quot; above.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="altrex-repeater-card"
            style={{
              border: "1px solid var(--altrex-border)",
              borderRadius: 8,
              padding: 14,
              background: "var(--altrex-surface)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <label className="altrex-field" style={{ margin: 0 }}>
              <span style={{ fontSize: 12 }}>Name *</span>
              <input
                type="text"
                className="altrex-input"
                placeholder="e.g. John Doe"
                style={{ height: 36 }}
                {...register(`contactPersons.${index}.name`)}
              />
              {errors?.contactPersons?.[index]?.name && (
                <span className="altrex-field-error">
                  {errors.contactPersons[index].name.message}
                </span>
              )}
            </label>

            <label className="altrex-field" style={{ margin: 0 }}>
              <span style={{ fontSize: 12 }}>Email</span>
              <input
                type="email"
                className="altrex-input"
                placeholder="email@example.com"
                style={{ height: 36 }}
                {...register(`contactPersons.${index}.email`)}
              />
              {errors?.contactPersons?.[index]?.email && (
                <span className="altrex-field-error">
                  {errors.contactPersons[index].email.message}
                </span>
              )}
            </label>

            <label className="altrex-field" style={{ margin: 0 }}>
              <span style={{ fontSize: 12 }}>Phone *</span>
              <input
                type="text"
                className="altrex-input"
                placeholder="Direct mobile"
                style={{ height: 36 }}
                {...register(`contactPersons.${index}.phone`)}
              />
              {errors?.contactPersons?.[index]?.phone && (
                <span className="altrex-field-error">
                  {errors.contactPersons[index].phone.message}
                </span>
              )}
            </label>

            <button
              type="button"
              onClick={() => remove(index)}
              className="altrex-icon-button"
              style={{
                width: 32,
                height: 32,
                minWidth: 32,
                minHeight: 32,
                marginTop: 22,
                color: "var(--altrex-danger-text)",
              }}
              title="Remove contact"
              aria-label="Remove contact"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
