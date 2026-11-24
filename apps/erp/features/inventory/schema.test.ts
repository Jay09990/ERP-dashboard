import { describe, expect, it } from "vitest";
import {
  batchSchema,
  stockAdjustmentSchema,
  stockTransferSchema,
  warehouseSchema,
} from "./schema";

describe("inventory schemas", () => {
  it("defaults warehouse and batch statuses", () => {
    expect(warehouseSchema.parse({ warehouse_name: "Main" }).status).toBe(
      "active",
    );
    expect(batchSchema.parse({ item_id: "1", batch_no: "B-01" }).status).toBe(
      "active",
    );
  });

  it("requires at least one valid transfer line", () => {
    const transfer = {
      transfer_date: "2026-05-01",
      from_warehouse_id: 1,
      to_warehouse_id: 2,
      itemsDetails: [{ item_id: 3, quantity: 2 }],
    };
    expect(stockTransferSchema.parse(transfer).status).toBe("draft");
    expect(
      stockTransferSchema.safeParse({ ...transfer, itemsDetails: [] }).success,
    ).toBe(false);
    expect(
      stockTransferSchema.safeParse({
        ...transfer,
        itemsDetails: [{ item_id: 3, quantity: 0 }],
      }).success,
    ).toBe(false);
  });

  it("requires adjustment date, warehouse, and lines", () => {
    const adjustment = {
      adjustment_date: "2026-05-01",
      warehouse_id: "1",
      itemsDetails: [{ item_id: "2", quantity: 1 }],
    };
    expect(stockAdjustmentSchema.safeParse(adjustment).success).toBe(true);
    expect(
      stockAdjustmentSchema.safeParse({ ...adjustment, warehouse_id: "" })
        .success,
    ).toBe(false);
  });
});
