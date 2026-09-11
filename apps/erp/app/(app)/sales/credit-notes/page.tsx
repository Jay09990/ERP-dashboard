"use client";

import { creditNoteApi } from "@/features/documents/api";
import { DocumentList } from "@/features/documents/components/DocumentList";

export default function CreditNotesPage() {
  return (
    <DocumentList
      docType="credit_note"
      title="Credit Notes"
      subtitle="Issue customer credit notes for returns, rate differences, and invoice adjustments."
      eyebrow="Sales Module"
      useList={creditNoteApi.useList}
      useCreate={creditNoteApi.useCreate}
      useUpdate={creditNoteApi.useUpdate}
      useDelete={creditNoteApi.useDelete}
    />
  );
}
