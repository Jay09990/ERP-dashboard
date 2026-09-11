"use client";

import { financialYearApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function FinancialYearsPage() {
  return (
    <MasterListModal
      title="Financial Years"
      subtitle="Define accounting periods and mark the active financial year for transactions."
      eyebrow="Financial Master"
      idField="financial_year_id"
      columns={[
        { key: "year_name", label: "Year Name" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        {
          key: "is_active",
          label: "Status",
          render: (row: any) =>
            row.is_active === true || row.is_active === 1 || row.is_active === "1" || row.is_active === "true"
              ? "Active"
              : "Inactive",
        },
      ]}
      fields={[
        { name: "year_name", label: "Year Name", required: true, placeholder: "e.g. FY 2025-26" },
        { name: "start_date", label: "Start Date", type: "date", required: true },
        { name: "end_date", label: "End Date", type: "date", required: true },
        {
          name: "is_active",
          label: "Active Status",
          type: "select",
          required: true,
          options: [
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ],
        },
      ]}
      useList={financialYearApi.useList}
      useCreate={financialYearApi.useCreate}
      useUpdate={financialYearApi.useUpdate}
      useDelete={financialYearApi.useDelete}
    />
  );
}
