import { describe, expect, it } from "vitest";
import { partySchema } from "./schema";

describe("legacy party schema", () => {
  it("requires both an address and contact person", () => {
    const party = {
      party_name: "Acme",
      party_type: "customer",
      phone: "123",
      email: "hello@acme.test",
      addresses: [
        {
          address_type: "billing",
          address_label: "Office",
          attention_to: "Rae",
          phone: "123",
          address_line1: "Main road",
          city_id: 1,
          state_id: 1,
          country_id: 1,
          pincode: "12345",
        },
      ],
      contactPersons: [{ name: "Rae", email: "rae@acme.test", phone: "123" }],
    };
    expect(partySchema.safeParse(party).success).toBe(true);
    expect(partySchema.safeParse({ ...party, addresses: [] }).success).toBe(
      false,
    );
    expect(
      partySchema.safeParse({ ...party, contactPersons: [] }).success,
    ).toBe(false);
  });
});
