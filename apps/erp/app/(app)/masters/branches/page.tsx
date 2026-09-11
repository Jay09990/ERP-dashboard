"use client";

import { branchApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function BranchesPage() {
  return (
    <MasterListModal
      title="Branches"
      subtitle="Manage company branches and office locations used across HR and operations."
      eyebrow="Organization & HR"
      idField="branch_id"
      columns={[
        { key: "branch_name", label: "Branch Name" },
        { key: "branch_code", label: "Branch Code" },
        { key: "address", label: "Address" },
      ]}
      fields={[
        { name: "branch_name", label: "Branch Name", required: true, placeholder: "e.g. Ahmedabad HO" },
        { name: "branch_code", label: "Branch Code", required: true, placeholder: "e.g. AMD-HO" },
        { name: "address", label: "Address", placeholder: "e.g. SG Highway, Ahmedabad" },
      ]}
      useList={branchApi.useList}
      useCreate={branchApi.useCreate}
      useUpdate={branchApi.useUpdate}
      useDelete={branchApi.useDelete}
    />
  );
}
