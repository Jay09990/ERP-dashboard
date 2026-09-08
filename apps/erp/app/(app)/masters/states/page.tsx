"use client";

import { countryApi, stateApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

function getRecords(value: any): any[] { return Array.isArray(value) ? value : value?.data ?? value?.states ?? value?.countries ?? []; }

/** Provides state records, each assigned to a country. */
export default function StatesPage() {
  const { data } = countryApi.useList();
  const countries = getRecords(data).map((country: any) => ({ label: country.country_name ?? country.name, value: String(country.country_id ?? country.id) }));
  return <MasterListModal title="States" subtitle="Manage states and associate each state with a country." eyebrow="Location Master" idField="state_id" columns={[{ key: "state_name", label: "State Name" }, { key: "country_name", label: "Country" }]} fields={[{ name: "state_name", label: "State Name", required: true, placeholder: "e.g. Maharashtra" }, { name: "country_id", label: "Country", type: "select", required: true, options: countries }]} useList={stateApi.useList} useCreate={stateApi.useCreate} useUpdate={stateApi.useUpdate} useDelete={stateApi.useDelete} />;
}
