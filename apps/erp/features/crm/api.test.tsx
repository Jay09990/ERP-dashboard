import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { crmApi } from "./api";

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

describe("CRM API hooks", () => {
  afterEach(() => {
    cleanup();
    getMock.mockReset();
  });

  it("loads leads from the CRM endpoint", async () => {
    getMock.mockResolvedValue([{ lead_id: 7 }]);
    const { result } = renderHook(() => crmApi.useLeads(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual([{ lead_id: 7 }]));
    expect(getMock).toHaveBeenCalledWith(endpoints.crm.leads);
  });

  it("does not fetch activities without an ID", () => {
    const { result } = renderHook(() => crmApi.useActivities(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMock).not.toHaveBeenCalled();
  });
});
