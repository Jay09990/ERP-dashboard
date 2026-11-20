import { describe, expect, it } from "vitest";
import { roleSchema } from "./roles/schema";
import { companyLoginSchema } from "./schema";
import {
  passwordChangeSchema,
  userCreateSchema,
  userUpdateSchema,
} from "./users/schema";

describe("authentication and user schemas", () => {
  it("requires login credentials", () => {
    expect(
      companyLoginSchema.safeParse({ login: "admin", password: "pass" })
        .success,
    ).toBe(true);
    expect(
      companyLoginSchema.safeParse({ login: "", password: "pass" }).success,
    ).toBe(false);
  });

  it("requires a role name", () => {
    expect(roleSchema.safeParse({ role_name: "Manager" }).success).toBe(true);
    expect(roleSchema.safeParse({ role_name: "" }).success).toBe(false);
  });

  it("validates create-user email, password, and role", () => {
    const user = {
      firstName: "Ada",
      email: "ada@example.com",
      password: "long-password",
      roleId: "2",
    };
    expect(userCreateSchema.safeParse(user).success).toBe(true);
    expect(userCreateSchema.safeParse({ ...user, email: "bad" }).success).toBe(
      false,
    );
    expect(
      userCreateSchema.safeParse({ ...user, password: "short" }).success,
    ).toBe(false);
    expect(userCreateSchema.safeParse({ ...user, roleId: "" }).success).toBe(
      false,
    );
  });

  it("restricts update status and validates password changes", () => {
    const user = { firstName: "Ada", status: "active", roleId: 2 };
    expect(userUpdateSchema.safeParse(user).success).toBe(true);
    expect(
      userUpdateSchema.safeParse({ ...user, status: "pending" }).success,
    ).toBe(false);
    expect(
      passwordChangeSchema.safeParse({
        current_password: "current",
        new_password: "long-enough",
      }).success,
    ).toBe(true);
    expect(
      passwordChangeSchema.safeParse({
        current_password: "",
        new_password: "short",
      }).success,
    ).toBe(false);
  });
});
