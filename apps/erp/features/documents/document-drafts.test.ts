import { beforeEach, describe, expect, it } from "vitest";
import {
  type SavedDocumentDraft,
  deleteDocumentDraft,
  getDocumentDrafts,
  saveDocumentDraft,
} from "./document-drafts";

const draft: SavedDocumentDraft = {
  id: "draft-1",
  docType: "quotation",
  title: "Quotation",
  partyName: "Example Customer",
  createdAt: "2026-10-28T10:00:00.000Z",
  updatedAt: "2026-10-28T10:00:00.000Z",
  data: {
    partyId: "7",
    partyName: "Example Customer",
    selectedInvoiceId: "",
    reasonId: "1",
    reasonText: "",
    docDate: "",
    validUntil: "",
    customerPoNo: "",
    customerPoDate: "",
    poNo: "",
    poDate: "",
    notes: "",
    terms: "",
    status: "draft",
    lineItems: [],
  },
};

describe("document draft storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves, updates, filters, and deletes drafts by user scope", () => {
    saveDocumentDraft("company-1:user-1", draft);
    expect(getDocumentDrafts("company-1:user-1", "quotation")).toEqual([draft]);
    expect(getDocumentDrafts("company-2:user-1", "quotation")).toEqual([]);

    const updatedDraft = {
      ...draft,
      updatedAt: "2026-10-28T11:00:00.000Z",
      data: { ...draft.data, notes: "Updated note" },
    };
    saveDocumentDraft("company-1:user-1", updatedDraft);
    expect(getDocumentDrafts("company-1:user-1", "quotation")).toEqual([
      updatedDraft,
    ]);
    expect(
      deleteDocumentDraft("company-1:user-1", "quotation", draft.id),
    ).toEqual([]);
  });

  it("surfaces malformed saved draft data", () => {
    window.localStorage.setItem(
      "altrex:document-drafts:company-1%3Auser-1",
      JSON.stringify([{ id: "broken" }]),
    );

    expect(() => getDocumentDrafts("company-1:user-1", "quotation")).toThrow(
      "Saved document drafts contain invalid data.",
    );
  });
});
