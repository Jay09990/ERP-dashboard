import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hrmsApi } from "./api";

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

describe("HRMS API hooks", () => {
  afterEach(() => {
    cleanup();
    getMock.mockReset();
  });

  it("loads employees with supplied filters", async () => {
    const employees = [{ employeeId: 3, firstName: "Ada" }];
    getMock.mockResolvedValue(employees);
    const filters = { status: "active" };
    const { result } = renderHook(() => hrmsApi.useEmployees(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(employees));
    expect(getMock).toHaveBeenCalledWith(endpoints.hrms.employees, filters);
  });

  it("disables employee detail requests when no ID is selected", () => {
    const { result } = renderHook(() => hrmsApi.useEmployee(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getMock).not.toHaveBeenCalled();
  });
});
