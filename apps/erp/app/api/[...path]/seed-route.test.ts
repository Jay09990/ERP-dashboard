// @vitest-environment node
import { testApiHandler } from "next-test-api-route-handler";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/seed-mode", () => ({ seedModeEnabled: true }));

import { erpSeed } from "@/mocks/seed";
import * as appHandler from "./route";

describe("ERP API catch-all route in seed mode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serves configured local reference data without contacting the backend", async () => {
    const backendFetch = vi.fn();
    vi.stubGlobal("fetch", backendFetch);

    await testApiHandler({
      appHandler,
      url: "/api/master/units",
      params: { path: ["master", "units"] },
      async test({ fetch }) {
        const response = await fetch({
          method: "GET",
        });
        expect(response.status).toBe(200);
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(Array.isArray(await response.json())).toBe(true);
      },
    });

    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("rejects all non-login writes as read-only", async () => {
    const backendFetch = vi.fn();
    vi.stubGlobal("fetch", backendFetch);

    await testApiHandler({
      appHandler,
      url: "/api/items/items",
      params: { path: ["items", "items"] },
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify({ item_name: "New item" }),
        });
        expect(response.status).toBe(405);
        await expect(response.json()).resolves.toMatchObject({
          message: expect.stringContaining("read-only"),
        });
      },
    });

    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("returns demo login credentials for a known user", async () => {
    await testApiHandler({
      appHandler,
      url: "/api/auth/login",
      params: { path: ["auth", "login"] },
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify({ login: "admin@example.com" }),
          headers: { "content-type": "application/json" },
        });
        expect(response.status).toBe(200);
        const payload = await response.json();
        expect(payload.token).toMatch(/^[^.]+\.[^.]+\.seed-mode$/);
        expect(payload.user).toMatchObject({
          email: erpSeed.auth.users[0].email,
          companyId: 1,
        });
      },
    });
  });
});
