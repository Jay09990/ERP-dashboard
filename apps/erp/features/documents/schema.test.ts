import { describe, expect, it } from "vitest";
import { documentLineItemSchema, salesDocumentSchema } from "./schema";

describe("sales document schemas", () => {
  it("defaults discount, taxes, and document status", () => {
    const result = documentLineItemSchema.parse({
      item_id: 4,
      quantity: 2,
      unit_rate: 50,
    });
    expect(result).toMatchObject({
      discount_percent: 0,
      discount_flat: 0,
      tax_ids: [],
    });
    expect(
      salesDocumentSchema.parse({
        party_id: 1,
        document_date: "2026-05-01",
        itemsDetails: [result],
      }).status,
    ).toBe("draft");
  });

  it("rejects invalid quantities, rates, and empty documents", () => {
    expect(
      documentLineItemSchema.safeParse({
        item_id: 1,
        quantity: 0,
        unit_rate: 10,
      }).success,
    ).toBe(false);
    expect(
      documentLineItemSchema.safeParse({
        item_id: 1,
        quantity: 1,
        unit_rate: -1,
      }).success,
    ).toBe(false);
    expect(
      salesDocumentSchema.safeParse({
        party_id: 1,
        document_date: "2026-05-01",
        itemsDetails: [],
      }).success,
    ).toBe(false);
  });
});
