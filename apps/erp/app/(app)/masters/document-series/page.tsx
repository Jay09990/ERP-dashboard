"use client";

import { documentSeriesApi, documentTypeApi } from "@/features/masters/api";
import { MasterListModal } from "@/features/masters/components/MasterListModal";

function getRecords(value: any): any[] {
  return Array.isArray(value)
    ? value
    : value?.data ?? value?.document_types ?? value?.types ?? [];
}

export default function DocumentSeriesPage() {
  const { data } = documentTypeApi.useList();
  const documentTypes = getRecords(data).map((type: any) => ({
    label: type.document_type_name ?? type.name ?? "Untitled type",
    value: String(type.doc_type_id ?? type.id),
  }));

  return (
    <MasterListModal
      title="Document Series"
      subtitle="Configure prefixes and running numbers used by the document numbering service."
      eyebrow="Document Numbering"
      idField="sequence_id"
      columns={[
        { key: "series_name", label: "Series Name" },
        { key: "prefix", label: "Prefix" },
        { key: "starting_number", label: "Starting No." },
        { key: "current_number", label: "Current No." },
        { key: "type_name", label: "Document Type" },
      ]}
      fields={[
        { name: "series_name", label: "Series Name", required: true, placeholder: "e.g. SI-2025" },
        { name: "prefix", label: "Prefix", required: true, placeholder: "e.g. SI/" },
        { name: "starting_number", label: "Starting Number", type: "number", required: true, placeholder: "1" },
        { name: "current_number", label: "Current Number", type: "number", placeholder: "Shows next issued number" },
        {
          name: "document_type_id",
          label: "Document Type",
          type: "select",
          required: true,
          options: documentTypes,
        },
      ]}
      useList={documentSeriesApi.useList}
      useCreate={documentSeriesApi.useCreate}
      useUpdate={documentSeriesApi.useUpdate}
      useDelete={documentSeriesApi.useDelete}
    />
  );
}
