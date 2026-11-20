import { describe, expect, it } from "vitest";
import { itemCategorySchema, itemSchema, itemTypeSchema } from "./schema";

describe("item schemas", () => {
  it("requires a name for each item master", () => {
    expect(
      itemTypeSchema.safeParse({ item_type_name: "Material" }).success,
    ).toBe(true);
    expect(
      itemCategorySchema.safeParse({ category_name: "Hardware" }).success,
    ).toBe(true);
    expect(itemSchema.parse({ item_name: "Bolt" }).status).toBe("active");
    expect(itemSchema.safeParse({ item_name: "" }).success).toBe(false);
  });

  it("accepts string and numeric IDs used by the API", () => {
    expect(
      itemSchema.safeParse({
        item_name: "Bolt",
        unit_id: "3",
        sales_rate: "12.5",
        item_category: null,
      }).success,
    ).toBe(true);
    expect(
      itemCategorySchema.safeParse({
        category_name: "Hardware",
        parent_category_id: null,
      }).success,
    ).toBe(true);
  });
});
