import { describe, expect, it } from "vitest";
import {
  citySchema,
  currencySchema,
  paymentTermSchema,
  stateSchema,
  taxTypeSchema,
  uomSchema,
} from "./schema";

describe("master data schemas", () => {
  it("validates unit and tax type values", () => {
    expect(
      uomSchema.safeParse({ unit_name: "Piece", unit_code: "pc" }).success,
    ).toBe(true);
    expect(
      taxTypeSchema.safeParse({
        tax_name: "GST",
        tax_percentage: "18",
        tax_type: "percentage",
        applicable_on: "sales",
      }).success,
    ).toBe(true);
    expect(
      taxTypeSchema.safeParse({
        tax_name: "GST",
        tax_percentage: "18",
        tax_type: "unknown",
      }).success,
    ).toBe(false);
  });

  it("accepts supported currency and location references", () => {
    expect(
      currencySchema.safeParse({
        currency_name: "Indian Rupee",
        currency_code: "INR",
        symbol: "₹",
      }).success,
    ).toBe(true);
    expect(
      paymentTermSchema.safeParse({ term_name: "Net 30", due_days: "30" })
        .success,
    ).toBe(true);
    expect(
      stateSchema.safeParse({ state_name: "Gujarat", country_id: "IN" })
        .success,
    ).toBe(true);
    expect(
      citySchema.safeParse({ city_name: "Surat", state_id: 1 }).success,
    ).toBe(true);
  });
});
