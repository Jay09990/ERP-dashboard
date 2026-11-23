import { endpoints } from "@/lib/api/endpoints";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { equipmentApi } from "./api";
import { extractRecord, extractRecords } from "./components/ProjectUi";

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@altrex/ui", () => ({ Button: () => null }));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("equipment API", () => {
  afterEach(() => {
    cleanup();
    getMock.mockReset();
    postMock.mockReset();
  });

  it("refreshes the equipment list after creating a record", async () => {
    getMock
      .mockResolvedValueOnce({
        success: true,
        Equipment: [{ equipment_id: 1, equipment_name: "Forklift" }],
      })
      .mockResolvedValueOnce({
        success: true,
        Equipment: [
          { equipment_id: 1, equipment_name: "Forklift" },
          { equipment_id: 2, equipment_name: "Generator" },
        ],
      });
    postMock.mockResolvedValue({ equipment_id: 2 });

    const { result } = renderHook(
      () => ({
        equipment: equipmentApi.useList(),
        create: equipmentApi.useCreate(),
      }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(extractRecords(result.current.equipment.data)).toHaveLength(1),
    );

    await act(async () => {
      await result.current.create.mutateAsync({
        body: { equipment_name: "Generator" },
      });
    });

    await waitFor(() =>
      expect(extractRecords(result.current.equipment.data)).toHaveLength(2),
    );
    expect(getMock).toHaveBeenCalledTimes(2);
    expect(getMock).toHaveBeenCalledWith(endpoints.equipment.list, undefined);
  });

  it("refreshes project equipment logs after creating a log", async () => {
    let requestCount = 0;
    getMock.mockImplementation(async () => {
      requestCount += 1;
      return requestCount === 1
        ? []
        : [{ equipment_log_id: 3, equipment_id: 1, hours_used: 2 }];
    });
    postMock.mockResolvedValue({ success: true });

    const { result } = renderHook(
      () => ({
        logs: equipmentApi.useProjectLogs(1),
        createLog: equipmentApi.useCreateProjectLog(),
      }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.createLog.mutateAsync({
        id: 1,
        body: {
          equipment_id: 1,
          log_date: "2026-11-23",
          hours_used: 2,
          rate_per_hour: 100,
        },
      });
    });

    await waitFor(() => expect(result.current.logs.data).toHaveLength(1));
    expect(getMock).toHaveBeenCalledTimes(2);
  });
});

describe("project API records", () => {
  it("extracts projects from the backend list response envelope", () => {
    const project = {
      project_id: 1,
      project_name: "Ahmedabad Factory Expansion",
    };

    expect(
      extractRecords({
        message: "Project Fetch Successfully",
        Projects: [project],
      }),
    ).toEqual([project]);
  });

  it("unwraps the project detail response envelope", () => {
    const project = {
      project_id: 1,
      project_name: "Ahmedabad Factory Expansion",
    };

    expect(
      extractRecord({
        message: "Project Fetch Successfully",
        Projects: [project],
      }),
    ).toEqual(project);
  });

  it("extracts child log arrays from capitalized response keys", () => {
    const log = { equipment_log_id: 12, hours_used: 8 };

    expect(extractRecords({ EquipmentLogs: [log] })).toEqual([log]);
  });
});
