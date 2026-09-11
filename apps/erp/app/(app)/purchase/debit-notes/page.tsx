"use client";

import { debitNoteApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function DebitNotesPage() {
  return (
    <DocumentList
      docType="debit_note"
      title="Debit Notes"
      subtitle="Record vendor debit notes for purchase returns, shortages, and invoice corrections."
      eyebrow="Procurement Module"
      useList={debitNoteApi.useList}
      useCreate={debitNoteApi.useCreate}
      useUpdate={debitNoteApi.useUpdate}
      useDelete={debitNoteApi.useDelete}
    />
  );
}
