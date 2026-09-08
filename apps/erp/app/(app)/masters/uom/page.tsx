"use client";

import { uomApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function UomPage() {
  return (
    <MasterListModal
      title="Units of Measure (UOM)"
      subtitle="Manage measurement units, codes, and classification types for inventory."
      eyebrow="Inventory Master"
      idField="unit_id"
      columns={[
        { key: "unit_name", label: "Unit Name" },
        { key: "unit_code", label: "Unit Code" },
        { key: "unit_type", label: "Unit Type" },
      ]}
      fields={[
        { name: "unit_name", label: "Unit Name", required: true, placeholder: "e.g. Kilograms, Box, Meter" },
        { name: "unit_code", label: "Unit Code", required: true, placeholder: "e.g. KG, BOX, MTR" },
        { name: "unit_type", label: "Unit Type", placeholder: "e.g. Weight, Quantity, Length" },
      ]}
      useList={uomApi.useList}
      useCreate={uomApi.useCreate}
      useUpdate={uomApi.useUpdate}
      useDelete={uomApi.useDelete}
    />
  );
}
