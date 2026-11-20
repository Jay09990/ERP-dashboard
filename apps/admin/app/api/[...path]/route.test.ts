// @vitest-environment node
import { testApiHandler } from "next-test-api-route-handler";
import { afterEach, describe, expect, it, vi } from "vitest";
import { endpoints } from "@/lib/api/endpoints";
import * as appHandler from "./route";

function declaredEndpointPaths(value: unknown): string[] {
  if (typeof value === "string") {
    return value.startsWith("/api/") ? [value] : [];
  }
  if (typeof value === "function") {
    const path = value(123, "active");
    return typeof path === "string" && path.startsWith("/api/") ? [path] : [];
  }
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(declaredEndpointPaths);
}

describe("Admin API catch-all route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("forwards every declared Admin API endpoint to the backend", async () => {
    vi.stubEnv("BACKEND_URL", "https://backend.example/");
    const backendFetch = vi.fn().mockImplementation(
      async () =>
        new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", backendFetch);
    const paths = [...new Set(declaredEndpointPaths(endpoints))];
    expect(paths.length).toBeGreaterThan(3);
    let activePath: string[] = [];

    await testApiHandler({
      appHandler,
      url: "/api/test",
      paramsPatcher: () => ({ path: activePath }),
      async test({ fetch }) {
        for (const path of paths) {
          activePath = path.slice("/api/".length).split("/");
          const response = await fetch({ method: "GET" });
          expect(
            response.status,
            `${path}; calls=${JSON.stringify(backendFetch.mock.calls)}`,
          ).toBe(200);
          await expect(response.json()).resolves.toEqual({ ok: true });
          expect(backendFetch).toHaveBeenLastCalledWith(
            `https://backend.example${path}`,
            expect.objectContaining({ method: "GET" }),
          );
        }
      },
    });
  });

  it("rejects unsafe paths and does not send them to the backend", async () => {
    vi.stubEnv("BACKEND_URL", "https://backend.example");
    const backendFetch = vi.fn();
    vi.stubGlobal("fetch", backendFetch);

    await testApiHandler({
      appHandler,
      url: "/api/test",
      params: { path: ["%252e%252e", "secret"] },
      async test({ fetch }) {
        const response = await fetch({ method: "GET" });
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
          message: "Invalid API path",
        });
      },
    });
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it("returns an explicit error when backend configuration is missing", async () => {
    vi.stubEnv("BACKEND_URL", "");
    await testApiHandler({
      appHandler,
      url: "/api/admin/companies",
      params: { path: ["admin", "companies"] },
      async test({ fetch }) {
        const response = await fetch({
          method: "GET",
        });
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
          message: "BACKEND_URL is not configured",
        });
      },
    });
  });
});
