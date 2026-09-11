"use client";

import { departmentApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function DepartmentsPage() {
  return (
    <MasterListModal
      title="Departments"
      subtitle="Define organizational departments for users, reporting, and HR masters."
      eyebrow="Organization & HR"
      idField="department_id"
      columns={[
        { key: "department_name", label: "Department Name" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "department_name", label: "Department Name", required: true, placeholder: "e.g. Sales, Accounts, Store" },
        { name: "description", label: "Description", placeholder: "Optional short description" },
      ]}
      useList={departmentApi.useList}
      useCreate={departmentApi.useCreate}
      useUpdate={departmentApi.useUpdate}
      useDelete={departmentApi.useDelete}
    />
  );
}
