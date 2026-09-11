"use client";

import { costCenterApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function CostCentersPage() {
  return (
    <MasterListModal
      title="Cost Centers"
      subtitle="Track cost centers for departmental expense allocation and reporting."
      eyebrow="Financial Master"
      idField="cost_center_id"
      columns={[
        { key: "cost_center_name", label: "Cost Center Name" },
        { key: "cost_center_code", label: "Code" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "cost_center_name", label: "Cost Center Name", required: true, placeholder: "e.g. Marketing" },
        { name: "cost_center_code", label: "Cost Center Code", required: true, placeholder: "e.g. CC-MKT" },
        { name: "description", label: "Description", placeholder: "Optional short description" },
      ]}
      useList={costCenterApi.useList}
      useCreate={costCenterApi.useCreate}
      useUpdate={costCenterApi.useUpdate}
      useDelete={costCenterApi.useDelete}
    />
  );
}
