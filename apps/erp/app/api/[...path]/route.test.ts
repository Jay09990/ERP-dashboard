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
    const path = value(123, 456, "approved");
    return typeof path === "string" && path.startsWith("/api/") ? [path] : [];
  }
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(declaredEndpointPaths);
}

describe("ERP API catch-all route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("forwards every declared ERP API endpoint to the backend", async () => {
    vi.stubEnv("BACKEND_URL", "https://backend.example/");
    vi.stubEnv("NEXT_PUBLIC_ERP_SEED_MODE", "false");
    const backendFetch = vi.fn().mockImplementation(
      async () =>
        new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", backendFetch);
    const paths = [...new Set(declaredEndpointPaths(endpoints))];
    expect(paths.length).toBeGreaterThan(50);
    let activePath: string[] = [];

    await testApiHandler({
      appHandler,
      url: "/api/test",
      paramsPatcher: () => ({ path: activePath }),
      async test({ fetch }) {
        for (const path of paths) {
          activePath = path.slice("/api/".length).split("/");
          const response = await fetch({ method: "GET" });
          expect(response.status, path).toBe(200);
          await expect(response.json()).resolves.toEqual([]);
          expect(backendFetch).toHaveBeenLastCalledWith(
            `https://backend.example${path}`,
            expect.objectContaining({ method: "GET" }),
          );
        }
      },
    });
  });

  it.each(["GET", "POST", "PUT", "DELETE"] as const)(
    "handles %s requests through the proxy",
    async (method) => {
      vi.stubEnv("BACKEND_URL", "https://backend.example");
      vi.stubEnv("NEXT_PUBLIC_ERP_SEED_MODE", "false");
      const backendFetch = vi.fn().mockResolvedValue(
        new Response("accepted", {
          status: 202,
          headers: { "content-type": "text/plain" },
        }),
      );
      vi.stubGlobal("fetch", backendFetch);
      const body = method === "GET" ? undefined : JSON.stringify({ value: 7 });

      await testApiHandler({
        appHandler,
        url: "/api/items/7?active=true",
        params: { path: ["items", "7"] },
        async test({ fetch }) {
          const response = await fetch({
            method,
            ...(body ? { body, headers: { "content-type": "application/json" } } : {}),
          });
          expect(response.status).toBe(202);
          expect(response.headers.get("content-type")).toBe("text/plain");
          await expect(response.text()).resolves.toBe("accepted");
        },
      });

      expect(backendFetch).toHaveBeenCalledWith(
        "https://backend.example/api/items/7?active=true",
        expect.objectContaining({
          method,
          body,
        }),
      );
    },
  );

  it.each([
    ["parent traversal", ["..", "secret"]],
    ["encoded traversal", ["%252e%252e", "secret"]],
    ["encoded slash", ["%252f", "secret"]],
    ["malformed encoding", ["%E0%A4%A"]],
    ["empty path", []],
  ])("rejects unsafe %s paths", async (_description, path) => {
    vi.stubEnv("BACKEND_URL", "https://backend.example");
    const backendFetch = vi.fn();
    vi.stubGlobal("fetch", backendFetch);

    await testApiHandler({
      appHandler,
      url: "/api/test",
      params: { path },
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

  it("reports missing backend configuration and unavailable backend errors", async () => {
    vi.stubEnv("BACKEND_URL", "");
    await testApiHandler({
      appHandler,
      url: "/api/items",
      params: { path: ["items"] },
      async test({ fetch }) {
        const response = await fetch({ method: "GET" });
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
          message: "BACKEND_URL is not configured",
        });
      },
    });

    vi.stubEnv("BACKEND_URL", "https://backend.example");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await testApiHandler({
      appHandler,
      url: "/api/items",
      params: { path: ["items"] },
      async test({ fetch }) {
        const response = await fetch({ method: "GET" });
        expect(response.status).toBe(502);
        await expect(response.json()).resolves.toEqual({
          message: "Backend API is unavailable",
        });
      },
    });
  });
});
