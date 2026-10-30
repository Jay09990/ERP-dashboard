import { describe, expect, it } from "vitest";
import {
  extractRecords,
  formatDisplayDate,
  formatINR,
  getDocumentAmount,
  getDocumentDate,
  getDocumentId,
  isActiveQuotation,
  isInCurrentMonth,
  isPendingDelivery,
  toNumber,
} from "./utils";

describe("dashboard utilities", () => {
  it("extracts nested record arrays and protects against cyclic objects", () => {
    expect(extractRecords({ data: { rows: [{ id: 1 }] } })).toEqual([
      { id: 1 },
    ]);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(extractRecords(cyclic)).toEqual([]);
  });

  it("normalizes numeric values and prefers server totals", () => {
    expect(toNumber("1,234.50")).toBe(1234.5);
    expect(toNumber("not-a-number")).toBe(0);
    expect(getDocumentAmount({ grand_total: "400", amount: 25 })).toBe(400);
  });

  it("finds document date and ID across supported document shapes", () => {
    expect(getDocumentDate({ sales_order_date: "2026-01-02" })).toBe(
      "2026-01-02",
    );
    expect(getDocumentId({ purchase_order_id: 17 })).toBe("17");
    expect(getDocumentId({})).toBe("");
  });

  it("checks month and operational statuses", () => {
    const now = new Date("2026-06-15T12:00:00");
    expect(isInCurrentMonth("2026-06-01", now)).toBe(true);
    expect(isInCurrentMonth("bad-date", now)).toBe(false);
    expect(isActiveQuotation({ status: "sent" })).toBe(true);
    expect(isActiveQuotation({ status: "CANCELLED" })).toBe(false);
    expect(isPendingDelivery({ status: "in_transit" })).toBe(true);
    expect(isPendingDelivery({ status: "delivered" })).toBe(false);
  });

  it("formats INR and falls back for missing or invalid dates", () => {
    expect(formatINR(1234.5)).toContain("1,234.50");
    expect(formatDisplayDate(null)).toBe("—");
    expect(formatDisplayDate("invalid")).toBe("—");
  });
});
