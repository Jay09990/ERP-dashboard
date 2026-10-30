import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "./src";

function jsonResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  } as Response;
}

describe("API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("adds query parameters, credentials, and JSON headers to GET requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ id: 1 }]));
    vi.stubGlobal("fetch", fetchMock);
    const client = createApiClient();

    await expect(
      client.get("/api/items", { page: 2, active: true, ignored: undefined }),
    ).resolves.toEqual([{ id: 1 }]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/items?page=2&active=true",
      expect.objectContaining({
        credentials: "include",
        headers: { "content-type": "application/json" },
      }),
    );
  });

  it("serializes mutation bodies and exposes structured API errors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 2 }))
      .mockResolvedValueOnce(jsonResponse({ message: "Not allowed" }, 403));
    vi.stubGlobal("fetch", fetchMock);
    const client = createApiClient();

    await expect(
      client.post("/api/items", { item_name: "Bolt" }),
    ).resolves.toEqual({
      id: 2,
    });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ item_name: "Bolt" }),
    });
    await expect(client.delete("/api/items/2")).rejects.toMatchObject({
      status: 403,
      message: "Not allowed",
      details: { message: "Not allowed" },
    });
  });
});
