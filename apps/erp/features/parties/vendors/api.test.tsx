import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVendors } from "./api";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: getMock, post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("vendor API hooks", () => {
  afterEach(() => {
    cleanup();
    getMock.mockReset();
  });

  it("extracts vendors from nested backend responses", async () => {
    const vendors = [{ party_id: 14, party_name: "Parts Supplier" }];
    getMock.mockResolvedValue({ data: { vendors } });
    const params = { status: "active" };
    const { result } = renderHook(() => useVendors(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(vendors));
    expect(getMock).toHaveBeenCalledWith(endpoints.party.vendors, params);
  });
});
