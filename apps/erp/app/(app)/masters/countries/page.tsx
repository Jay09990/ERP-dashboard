"use client";

import { countryApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

/** Provides the country records used by all address forms. */
export default function CountriesPage() {
  return <MasterListModal title="Countries" subtitle="Manage countries available in company and party addresses." eyebrow="Location Master" idField="country_id" columns={[{ key: "country_name", label: "Country Name" }]} fields={[{ name: "country_name", label: "Country Name", required: true, placeholder: "e.g. India" }]} useList={countryApi.useList} useCreate={countryApi.useCreate} useUpdate={countryApi.useUpdate} useDelete={countryApi.useDelete} />;
}
