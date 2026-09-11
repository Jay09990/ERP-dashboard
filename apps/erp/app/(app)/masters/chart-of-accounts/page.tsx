"use client";

import { chartOfAccountsApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function ChartOfAccountsPage() {
  return (
    <MasterListModal
      title="Chart of Accounts"
      subtitle="Maintain ledger accounts used for financial posting and reporting."
      eyebrow="Financial Master"
      idField="account_id"
      columns={[
        { key: "account_name", label: "Account Name" },
        { key: "account_code", label: "Account Code" },
        { key: "account_type", label: "Account Type" },
      ]}
      fields={[
        { name: "account_name", label: "Account Name", required: true, placeholder: "e.g. Cash in Hand" },
        { name: "account_code", label: "Account Code", required: true, placeholder: "e.g. 1001" },
        {
          name: "account_type",
          label: "Account Type",
          type: "select",
          required: true,
          options: [
            { label: "Asset", value: "asset" },
            { label: "Liability", value: "liability" },
            { label: "Income", value: "income" },
            { label: "Expense", value: "expense" },
            { label: "Equity", value: "equity" },
          ],
        },
      ]}
      useList={chartOfAccountsApi.useList}
      useCreate={chartOfAccountsApi.useCreate}
      useUpdate={chartOfAccountsApi.useUpdate}
      useDelete={chartOfAccountsApi.useDelete}
    />
  );
}
