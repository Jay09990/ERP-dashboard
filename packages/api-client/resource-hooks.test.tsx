import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type ApiClient, createResourceHooks } from "./src";

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("shared resource API hooks", () => {
  afterEach(cleanup);

  it("maps list and detail queries to GET requests", async () => {
    const apiClient = {
      get: vi.fn().mockResolvedValue([{ id: 8 }]),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient;
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const resource = createResourceHooks(
      "items",
      "/api/items",
      apiClient,
      queryClient,
    );
    const wrapper = createWrapper(queryClient);

    const list = renderHook(() => resource.useList({ status: "active" }), {
      wrapper,
    });
    await waitFor(() => expect(list.result.current.data).toEqual([{ id: 8 }]));
    expect(apiClient.get).toHaveBeenCalledWith("/api/items", {
      status: "active",
    });

    list.unmount();
    const detail = renderHook(() => resource.useDetail("8"), { wrapper });
    await waitFor(() =>
      expect(detail.result.current.data).toEqual([{ id: 8 }]),
    );
    expect(apiClient.get).toHaveBeenLastCalledWith("/api/items/8");
    detail.unmount();
    queryClient.clear();
  });

  it("maps create, update, and delete mutations to their respective HTTP methods", async () => {
    const apiClient = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({ id: 8 }),
      put: vi.fn().mockResolvedValue({ id: 8 }),
      delete: vi.fn().mockResolvedValue({ ok: true }),
    } as unknown as ApiClient;
    const queryClient = new QueryClient();
    const resource = createResourceHooks(
      "items",
      "/api/items",
      apiClient,
      queryClient,
    );
    const { result } = renderHook(
      () => ({
        create: resource.useCreate(),
        update: resource.useUpdate(),
        remove: resource.useDelete(),
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await result.current.create.mutateAsync({ item_name: "Bolt" });
    await result.current.update.mutateAsync({
      id: "8",
      body: { item_name: "Nut" },
    });
    await result.current.remove.mutateAsync("8");

    expect(apiClient.post).toHaveBeenCalledWith("/api/items", {
      item_name: "Bolt",
    });
    expect(apiClient.put).toHaveBeenCalledWith("/api/items/8", {
      item_name: "Nut",
    });
    expect(apiClient.delete).toHaveBeenCalledWith("/api/items/8");
    queryClient.clear();
  });
});
