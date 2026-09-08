"use client";

import { currencyApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function CurrenciesPage() {
  return (
    <MasterListModal
      title="Currencies"
      subtitle="Manage transaction currencies and symbols for invoicing and purchasing."
      eyebrow="Financial Master"
      idField="currency_id"
      columns={[
        { key: "currency_name", label: "Currency Name" },
        { key: "currency_code", label: "Currency Code" },
        { key: "symbol", label: "Symbol" },
      ]}
      fields={[
        { name: "currency_name", label: "Currency Name", required: true, placeholder: "e.g. Indian Rupee, US Dollar" },
        { name: "currency_code", label: "Currency Code", required: true, placeholder: "e.g. INR, USD, EUR" },
        { name: "symbol", label: "Symbol", required: true, placeholder: "e.g. ₹, $, €" },
      ]}
      useList={currencyApi.useList}
      useCreate={currencyApi.useCreate}
      useUpdate={currencyApi.useUpdate}
      useDelete={currencyApi.useDelete}
    />
  );
}
