import { describe, expect, it } from "vitest";
import { profileSchema } from "./schema";

describe("company profile schema", () => {
  it("accepts optional empty email and nullable references", () => {
    expect(
      profileSchema.safeParse({
        company_name: "Acme",
        email: "",
        city_id: null,
        opening_balance: 0,
      }).success,
    ).toBe(true);
  });

  it("requires company name and validates non-empty email", () => {
    expect(profileSchema.safeParse({ company_name: "" }).success).toBe(false);
    expect(
      profileSchema.safeParse({ company_name: "Acme", email: "invalid" })
        .success,
    ).toBe(false);
  });
});
