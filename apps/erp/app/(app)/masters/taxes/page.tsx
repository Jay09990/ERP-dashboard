"use client";

import { taxTypesApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function TaxTypesPage() {
  return (
    <MasterListModal
      title="Tax Rates & Types"
      subtitle="Configure GST tax slabs, rates, and tax application rules."
      eyebrow="Financial Master"
      idField="tax_id"
      columns={[
        { key: "tax_name", label: "Tax Name" },
        {
          key: "tax_percentage",
          label: "Value",
          render: (row: any) =>
            row.tax_type === "fixed" ? row.tax_percentage : `${row.tax_percentage}%`,
        },
        { key: "tax_type", label: "Tax Type" },
      ]}
      fields={[
        { name: "tax_name", label: "Tax Name", required: true, placeholder: "e.g. GST 18%, IGST 12%, SGST 9%" },
        {
          name: "tax_type",
          label: "Tax Type",
          type: "select",
          required: true,
          options: [
            { label: "Fixed Amount", value: "fixed" },
            { label: "Percentage", value: "percentage" },
          ],
        },
        {
          name: "tax_percentage",
          label: "Tax Percentage (%)",
          type: "number",
          required: true,
          getLabel: (formData) =>
            formData.tax_type === "fixed" ? "Tax Amount" : "Tax Percentage (%)",
          getPlaceholder: (formData) =>
            formData.tax_type === "fixed" ? "e.g. 100" : "e.g. 18",
        },
        {
          name: "applicable_on",
          label: "Applicable On",
          type: "select",
          required: true,
          options: [
            { label: "Sales", value: "sales" },
            { label: "Purchase", value: "purchase" },
            { label: "Both Sales & Purchase", value: "both" },
          ],
        },
      ]}
      useList={taxTypesApi.useList}
      useCreate={taxTypesApi.useCreate}
      useUpdate={taxTypesApi.useUpdate}
      useDelete={taxTypesApi.useDelete}
    />
  );
}
