import type {
  DocumentFormDraft,
  DocumentType,
} from "./components/DocumentForm";

const documentTypes: DocumentType[] = [
  "quotation",
  "sales_order",
  "proforma",
  "delivery_challan",
  "sales_invoice",
  "purchase_order",
  "purchase_invoice",
  "credit_note",
  "debit_note",
];

export type SavedDocumentDraft = {
  id: string;
  docType: DocumentType;
  title: string;
  partyName: string;
  data: DocumentFormDraft;
  createdAt: string;
  updatedAt: string;
};

function isDocumentType(value: unknown): value is DocumentType {
  return (
    typeof value === "string" && documentTypes.includes(value as DocumentType)
  );
}

function isDocumentFormLineItem(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.item_id === "string" &&
    typeof line.description === "string" &&
    typeof line.quantity === "number" &&
    typeof line.hsn_code === "string" &&
    typeof line.unit_id === "string" &&
    typeof line.unit_rate === "number" &&
    (line.discount_type === "percent" || line.discount_type === "flat") &&
    typeof line.discount_value === "number" &&
    Array.isArray(line.selected_taxes) &&
    line.selected_taxes.every((taxId) => typeof taxId === "number")
  );
}

function storageKey(scope: string) {
  return `altrex:document-drafts:${encodeURIComponent(scope)}`;
}

function isSavedDocumentDraft(value: unknown): value is SavedDocumentDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  if (
    typeof draft.id !== "string" ||
    typeof draft.title !== "string" ||
    typeof draft.partyName !== "string" ||
    typeof draft.createdAt !== "string" ||
    typeof draft.updatedAt !== "string" ||
    !isDocumentType(draft.docType) ||
    !draft.data ||
    typeof draft.data !== "object"
  ) {
    return false;
  }
  const data = draft.data as Record<string, unknown>;
  return (
    typeof data.partyId === "string" &&
    typeof data.partyName === "string" &&
    typeof data.selectedInvoiceId === "string" &&
    typeof data.reasonId === "string" &&
    typeof data.reasonText === "string" &&
    typeof data.docDate === "string" &&
    typeof data.validUntil === "string" &&
    typeof data.customerPoNo === "string" &&
    typeof data.customerPoDate === "string" &&
    typeof data.poNo === "string" &&
    typeof data.poDate === "string" &&
    typeof data.notes === "string" &&
    typeof data.terms === "string" &&
    ["draft", "approved", "sent", "cancelled"].includes(
      data.status as string,
    ) &&
    Array.isArray(data.lineItems) &&
    data.lineItems.every(isDocumentFormLineItem)
  );
}

function writeAllDrafts(scope: string, drafts: SavedDocumentDraft[]) {
  if (typeof window === "undefined") {
    throw new Error("Document drafts can only be saved in a browser.");
  }
  window.localStorage.setItem(storageKey(scope), JSON.stringify(drafts));
}

function readAllDrafts(scope: string): SavedDocumentDraft[] {
  if (typeof window === "undefined") return [];
  const serialized = window.localStorage.getItem(storageKey(scope));
  if (!serialized) return [];

  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved document drafts have an invalid format.");
  }
  if (!parsed.every(isSavedDocumentDraft)) {
    throw new Error("Saved document drafts contain invalid data.");
  }
  return parsed;
}

export function getDocumentDrafts(
  scope: string,
  docType: DocumentType,
): SavedDocumentDraft[] {
  return readAllDrafts(scope)
    .filter((draft) => draft.docType === docType)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveDocumentDraft(
  scope: string,
  draft: SavedDocumentDraft,
): SavedDocumentDraft[] {
  const drafts = readAllDrafts(scope);
  const index = drafts.findIndex((entry) => entry.id === draft.id);
  if (index === -1) {
    drafts.push(draft);
  } else {
    drafts[index] = draft;
  }
  writeAllDrafts(scope, drafts);
  return getDocumentDrafts(scope, draft.docType);
}

export function deleteDocumentDraft(
  scope: string,
  docType: DocumentType,
  draftId: string,
): SavedDocumentDraft[] {
  const drafts = readAllDrafts(scope).filter((draft) => draft.id !== draftId);
  writeAllDrafts(scope, drafts);
  return getDocumentDrafts(scope, docType);
}

export function createDocumentDraftId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
