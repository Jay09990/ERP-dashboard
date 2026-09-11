"use client";

import { shiftApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function ShiftsPage() {
  return (
    <MasterListModal
      title="Shifts"
      subtitle="Configure working shifts with start and end times for attendance and scheduling."
      eyebrow="Organization & HR"
      idField="shift_id"
      columns={[
        { key: "shift_name", label: "Shift Name" },
        { key: "start_time", label: "Start Time" },
        { key: "end_time", label: "End Time" },
      ]}
      fields={[
        { name: "shift_name", label: "Shift Name", required: true, placeholder: "e.g. General, Night" },
        { name: "start_time", label: "Start Time", required: true, placeholder: "e.g. 09:00" },
        { name: "end_time", label: "End Time", required: true, placeholder: "e.g. 18:00" },
      ]}
      useList={shiftApi.useList}
      useCreate={shiftApi.useCreate}
      useUpdate={shiftApi.useUpdate}
      useDelete={shiftApi.useDelete}
    />
  );
}
