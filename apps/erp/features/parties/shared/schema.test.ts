import { describe, expect, it } from "vitest";
import { customerSchema } from "../customers/schema";
import {
  partyAddressSchema,
  partyContactPersonSchema,
  partySchema,
} from "./schema";

describe("customer and vendor party schemas", () => {
  it("applies defaults for optional party collections and address type", () => {
    const party = partySchema.parse({ party_name: "Acme", phone: "123" });
    expect(party.addresses).toEqual([]);
    expect(party.contactPersons).toEqual([]);
    expect(party.opening_balance).toBe("0");
    expect(
      partyAddressSchema.parse({
        address_label: "Office",
        address_line1: "Main street",
      }).address_type,
    ).toBe("billing");
  });

  it("permits blank optional contact email but rejects malformed nonblank email", () => {
    const contact = { name: "Rae", phone: "123" };
    expect(
      partyContactPersonSchema.safeParse({ ...contact, email: "" }).success,
    ).toBe(true);
    expect(
      partyContactPersonSchema.safeParse({ ...contact, email: "bad" }).success,
    ).toBe(false);
  });

  it("customer schema reuses shared party validation", () => {
    const value = { party_name: "Acme", phone: "123" };
    expect(customerSchema.parse(value)).toMatchObject({ party_name: "Acme" });
  });
});
