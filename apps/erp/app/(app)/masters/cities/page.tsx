"use client";

import { cityApi, stateApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

function getRecords(value: any): any[] { return Array.isArray(value) ? value : value?.data ?? value?.states ?? value?.cities ?? []; }

/** Provides city records, each assigned to a state. */
export default function CitiesPage() {
  const { data } = stateApi.useList();
  const states = getRecords(data).map((state: any) => ({ label: state.state_name ?? state.name, value: String(state.state_id ?? state.id) }));
  return <MasterListModal title="Cities" subtitle="Manage cities and associate each city with a state." eyebrow="Location Master" idField="city_id" columns={[{ key: "city_name", label: "City Name" }, { key: "state_name", label: "State" }]} fields={[{ name: "city_name", label: "City Name", required: true, placeholder: "e.g. Mumbai" }, { name: "state_id", label: "State", type: "select", required: true, options: states }]} useList={cityApi.useList} useCreate={cityApi.useCreate} useUpdate={cityApi.useUpdate} useDelete={cityApi.useDelete} />;
}
