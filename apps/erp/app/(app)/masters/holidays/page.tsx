"use client";

import { holidayApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

export default function HolidaysPage() {
  return (
    <MasterListModal
      title="Holidays"
      subtitle="Maintain company holiday calendar dates used for attendance and planning."
      eyebrow="Organization & HR"
      idField="holiday_id"
      columns={[
        { key: "holiday_name", label: "Holiday Name" },
        { key: "holiday_date", label: "Date" },
      ]}
      fields={[
        { name: "holiday_name", label: "Holiday Name", required: true, placeholder: "e.g. Republic Day" },
        { name: "holiday_date", label: "Holiday Date", type: "date", required: true },
      ]}
      useList={holidayApi.useList}
      useCreate={holidayApi.useCreate}
      useUpdate={holidayApi.useUpdate}
      useDelete={holidayApi.useDelete}
    />
  );
}
