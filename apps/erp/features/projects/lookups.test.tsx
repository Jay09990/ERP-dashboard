import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProjectHeaderLookups } from "./lookups";

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

describe("project reference lookups", () => {
  afterEach(() => {
    cleanup();
    getMock.mockReset();
  });

  it("normalizes customer records into select options", async () => {
    getMock.mockResolvedValue({
      data: { customers: [{ party_id: 12, party_name: "Acme" }] },
    });
    const { result } = renderHook(() => useProjectHeaderLookups(false), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.options.party_id).toEqual([
        { value: "12", label: "Acme (#12)" },
      ]),
    );
    expect(getMock).toHaveBeenCalledWith(endpoints.party.customers, undefined);
  });

  it("reports invalid backend lookup shapes as errors", async () => {
    getMock.mockResolvedValue({ unexpected: [{ key: "missing-id" }] });
    const { result } = renderHook(() => useProjectHeaderLookups(false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.error?.message).toContain("customers");
  });
});
