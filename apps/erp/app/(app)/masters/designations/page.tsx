"use client";

import { designationApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function DesignationsPage() {
  return (
    <MasterListModal
      title="Designations"
      subtitle="Manage job titles and designations used when assigning employees and users."
      eyebrow="Organization & HR"
      idField="designation_id"
      columns={[
        { key: "designation_name", label: "Designation" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "designation_name", label: "Designation Name", required: true, placeholder: "e.g. Manager, Executive" },
        { name: "description", label: "Description", placeholder: "Optional short description" },
      ]}
      useList={designationApi.useList}
      useCreate={designationApi.useCreate}
      useUpdate={designationApi.useUpdate}
      useDelete={designationApi.useDelete}
    />
  );
}
