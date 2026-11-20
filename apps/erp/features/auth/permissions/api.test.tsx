import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRolePermissions } from "./api";

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

describe("role permission API hook", () => {
  afterEach(() => {
    cleanup();
    getMock.mockReset();
  });

  it("supports both array and wrapped permission responses", async () => {
    const permissions = [
      { permission_name: "items.read", module_name: "items", is_allowed: true },
    ];
    getMock.mockResolvedValue({ permissions });
    const { result } = renderHook(() => useRolePermissions("5"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(permissions));
    expect(getMock).toHaveBeenCalledWith(endpoints.auth.rolePermissions("5"));
  });

  it("skips the request when no role ID is supplied", () => {
    const { result } = renderHook(() => useRolePermissions(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMock).not.toHaveBeenCalled();
  });
});
