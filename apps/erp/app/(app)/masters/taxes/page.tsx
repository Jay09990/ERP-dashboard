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
          label: "Tax Rate (%)",
          render: (row: any) => `${row.tax_percentage}%`,
        },
        { key: "tax_type", label: "Tax Type" },
      ]}
      fields={[
        { name: "tax_name", label: "Tax Name", required: true, placeholder: "e.g. GST 18%, IGST 12%, SGST 9%" },
        { name: "tax_percentage", label: "Tax Percentage (%)", type: "number", required: true, placeholder: "18" },
        { name: "tax_type", label: "Tax Type", placeholder: "e.g. GST, IGST, VAT" },
        { name: "applicable_on", label: "Applicable On", placeholder: "e.g. Both Sales & Purchase" },
      ]}
      useList={taxTypesApi.useList}
      useCreate={taxTypesApi.useCreate}
      useUpdate={taxTypesApi.useUpdate}
      useDelete={taxTypesApi.useDelete}
    />
  );
}
