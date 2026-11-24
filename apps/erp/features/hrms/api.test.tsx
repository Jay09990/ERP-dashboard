import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hrmsApi } from "./api";

const { getMock, postMock, putMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  putMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: { get: getMock, post: postMock, put: putMock, delete: deleteMock },
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
    postMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
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

  it("loads work locations", async () => {
    const locations = [{ location_id: 1, location_name: "Head Office" }];
    getMock.mockResolvedValue(locations);
    const { result } = renderHook(() => hrmsApi.useWorkLocations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(locations));
    expect(getMock).toHaveBeenCalledWith(endpoints.hrms.workLocations);
  });

  it("loads leave requests with filters", async () => {
    const requests = [{ leave_id: 1, reason: "Vacation" }];
    getMock.mockResolvedValue(requests);
    const filters = { status: "pending" };
    const { result } = renderHook(() => hrmsApi.useLeaveRequests(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(requests));
    expect(getMock).toHaveBeenCalledWith(endpoints.hrms.leaveRequests, filters);
  });

  it("loads payroll runs", async () => {
    const payroll = [{ payroll_id: 1, year: 2026, month: 10 }];
    getMock.mockResolvedValue(payroll);
    const { result } = renderHook(() => hrmsApi.usePayrollRuns(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(payroll));
    expect(getMock).toHaveBeenCalledWith(endpoints.hrms.payroll);
  });
});
