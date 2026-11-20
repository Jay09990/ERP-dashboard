import { describe, expect, it } from "vitest";
import {
  adminLoginSchema,
  adminRegisterSchema,
  companyRegisterSchema,
} from "./schema";

describe("admin authentication schemas", () => {
  it("validates administrator credentials", () => {
    expect(
      adminLoginSchema.safeParse({ login: "admin", password: "pass" }).success,
    ).toBe(true);
    expect(
      adminRegisterSchema.safeParse({
        full_name: "Ada Lovelace",
        email: "ada@example.com",
        password: "pass",
      }).success,
    ).toBe(true);
  });

  it("normalizes GSTIN and checks company registration fields", () => {
    const validRegistration = {
      companyName: "Acme Industries",
      companyCode: "ACME1",
      gstNo: "22AAAAA0000A1Z5",
      address: "12 Main Road, Industrial Area",
      phone: "9876543210",
      companyEmail: "office@acme.test",
      subscriptionPlanId: 1,
      superAdminFirstName: "Ada",
      superAdminLastName: "Lovelace",
      superAdminEmail: "ada@acme.test",
      superAdminPhone: "9876543210",
      superAdminPassword: "Secure1!",
      confirmPassword: "Secure1!",
      db_name: "acme_erp",
    };
    const result = companyRegisterSchema.safeParse({
      ...validRegistration,
      gstNo: validRegistration.gstNo.toLowerCase(),
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.gstNo).toBe("22AAAAA0000A1Z5");
    expect(
      companyRegisterSchema.safeParse({
        ...validRegistration,
        confirmPassword: "different",
      }).success,
    ).toBe(false);
  });
});
