import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Id = string | number;
type MutationInput = {
  id?: Id;
  childId?: Id;
  body?: unknown;
  status?: string;
};

function needId(id: Id | undefined, field: string): Id {
  if (id === undefined || id === "") {
    throw new Error(`${field} is required`);
  }
  return id;
}

function needStatus(status: string | undefined, field: string): string {
  if (!status) throw new Error(`${field} is required`);
  return status;
}

function useWrite<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
  invalidations: readonly (readonly unknown[])[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(
        invalidations.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
  });
}

function useRead(key: readonly unknown[], endpoint: string, enabled = true) {
  return useQuery({
    queryKey: key,
    queryFn: () => apiClient.get<unknown>(endpoint),
    enabled,
  });
}

function useReadList(
  key: readonly unknown[],
  endpoint: string,
  enabled = true,
) {
  return useQuery({
    queryKey: key,
    queryFn: () => apiClient.get<unknown>(endpoint),
    enabled,
  });
}

const projectInvalidations = [
  ["projects"],
  ["project"],
  ["project-financials"],
  ["project-dpr"],
  ["project-documents"],
] as const;
const procurementInvalidations = [
  ["procurement"],
  ["projects"],
  ["project"],
  ["stock-summary"],
  ["stock-ledger"],
] as const;

export const projectApi = {
  useList: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["projects", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.projects.list, filters),
      enabled,
    }),
  useDetail: (id: Id | null) =>
    useRead(
      ["project", id],
      id == null ? "" : endpoints.projects.detail(id),
      id != null,
    ),
  useFinancials: (id: Id, enabled = true) =>
    useRead(
      ["project-financials", id],
      endpoints.projects.financials(id),
      enabled,
    ),
  useDprList: (id: Id, enabled = true) =>
    useReadList(["project-dpr", id], endpoints.projects.dpr(id), enabled),
  useDocuments: (id: Id, enabled = true) =>
    useReadList(
      ["project-documents", id],
      endpoints.projects.documents(id),
      enabled,
    ),
  useCreate: () =>
    useWrite(
      ({ body }: MutationInput) =>
        apiClient.post(endpoints.projects.list, body),
      projectInvalidations,
    ),
  useCreateFromSalesOrder: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.createFromSalesOrder(needId(id, "Sales order ID")),
          body,
        ),
      projectInvalidations,
    ),
  useUpdate: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.put(
          endpoints.projects.detail(needId(id, "Project ID")),
          body,
        ),
      projectInvalidations,
    ),
  useDelete: () =>
    useWrite(
      ({ id }: MutationInput) =>
        apiClient.delete(endpoints.projects.detail(needId(id, "Project ID"))),
      projectInvalidations,
    ),
  useChangeStatus: () =>
    useWrite(
      ({ id, status }: MutationInput) =>
        apiClient.post(
          endpoints.projects.status(
            needId(id, "Project ID"),
            needStatus(status, "Project status"),
          ),
        ),
      projectInvalidations,
    ),
  useCreateSite: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.sites(needId(id, "Project ID")),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteSite: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.post(
          endpoints.projects.site(
            needId(id, "Project ID"),
            needId(childId, "Site ID"),
          ),
        ),
      projectInvalidations,
    ),
  useCreateBoq: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(endpoints.projects.boq(needId(id, "Project ID")), body),
      projectInvalidations,
    ),
  useUpdateBoq: () =>
    useWrite(
      ({ id, childId, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.boqItem(
            needId(id, "Project ID"),
            needId(childId, "BOQ item ID"),
          ),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteBoq: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.post(
          endpoints.projects.boqItem(
            needId(id, "Project ID"),
            needId(childId, "BOQ item ID"),
          ),
        ),
      projectInvalidations,
    ),
  useCreateMilestone: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.milestones(needId(id, "Project ID")),
          body,
        ),
      projectInvalidations,
    ),
  useUpdateMilestone: () =>
    useWrite(
      ({ id, childId, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.milestone(
            needId(id, "Project ID"),
            needId(childId, "Milestone ID"),
          ),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteMilestone: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.post(
          endpoints.projects.milestone(
            needId(id, "Project ID"),
            needId(childId, "Milestone ID"),
          ),
        ),
      projectInvalidations,
    ),
  useCreateTask: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.tasks(needId(id, "Project ID")),
          body,
        ),
      projectInvalidations,
    ),
  useUpdateTask: () =>
    useWrite(
      ({ id, childId, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.task(
            needId(id, "Project ID"),
            needId(childId, "Task ID"),
          ),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteTask: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.post(
          endpoints.projects.task(
            needId(id, "Project ID"),
            needId(childId, "Task ID"),
          ),
        ),
      projectInvalidations,
    ),
  useCreateDpr: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(endpoints.projects.dpr(needId(id, "Project ID")), body),
      projectInvalidations,
    ),
  useCreateDocument: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(
          endpoints.projects.documents(needId(id, "Project ID")),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteDocument: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.delete(
          endpoints.projects.document(
            needId(id, "Project ID"),
            needId(childId, "Document ID"),
          ),
        ),
      projectInvalidations,
    ),
  useTrades: (enabled = true) =>
    useReadList(["manpower", "trades"], endpoints.manpower.trades, enabled),
  useCreateTrade: () =>
    useWrite(
      ({ body }: MutationInput) =>
        apiClient.post(endpoints.manpower.trades, body),
      projectInvalidations,
    ),
  useManpowerLogs: (id: Id, filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["project-manpower", id, filters],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.manpower.logs(id), filters),
      enabled,
    }),
  useCreateManpowerLog: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(endpoints.manpower.logs(needId(id, "Project ID")), body),
      projectInvalidations,
    ),
  useUpdateManpowerLog: () =>
    useWrite(
      ({ id, childId, body }: MutationInput) =>
        apiClient.put(
          endpoints.manpower.log(
            needId(id, "Project ID"),
            needId(childId, "Manpower log ID"),
          ),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteManpowerLog: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.delete(
          endpoints.manpower.log(
            needId(id, "Project ID"),
            needId(childId, "Manpower log ID"),
          ),
        ),
      projectInvalidations,
    ),
  useEquipmentList: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["equipment", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.equipment.list, filters),
      enabled,
    }),
  useEquipment: (id: Id | null) =>
    useRead(
      ["equipment", id],
      id == null ? "" : endpoints.equipment.detail(id),
      id != null,
    ),
  useCreateEquipment: () =>
    useWrite(
      ({ body }: MutationInput) =>
        apiClient.post(endpoints.equipment.list, body),
      projectInvalidations,
    ),
  useUpdateEquipment: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.put(
          endpoints.equipment.detail(needId(id, "Equipment ID")),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteEquipment: () =>
    useWrite(
      ({ id }: MutationInput) =>
        apiClient.delete(
          endpoints.equipment.detail(needId(id, "Equipment ID")),
        ),
      projectInvalidations,
    ),
  useEquipmentLogs: (
    id: Id,
    filters?: Record<string, string>,
    enabled = true,
  ) =>
    useQuery({
      queryKey: ["project-equipment", id, filters],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.equipment.projectLogs(id), filters),
      enabled,
    }),
  useCreateEquipmentLog: () =>
    useWrite(
      ({ id, body }: MutationInput) =>
        apiClient.post(
          endpoints.equipment.projectLogs(needId(id, "Project ID")),
          body,
        ),
      projectInvalidations,
    ),
  useUpdateEquipmentLog: () =>
    useWrite(
      ({ id, childId, body }: MutationInput) =>
        apiClient.put(
          endpoints.equipment.projectLog(
            needId(id, "Project ID"),
            needId(childId, "Equipment log ID"),
          ),
          body,
        ),
      projectInvalidations,
    ),
  useDeleteEquipmentLog: () =>
    useWrite(
      ({ id, childId }: MutationInput) =>
        apiClient.delete(
          endpoints.equipment.projectLog(
            needId(id, "Project ID"),
            needId(childId, "Equipment log ID"),
          ),
        ),
      projectInvalidations,
    ),
};

export const manpowerApi = {
  useTrades: projectApi.useTrades,
  useCreateTrade: projectApi.useCreateTrade,
  useLogs: projectApi.useManpowerLogs,
  useCreateLog: projectApi.useCreateManpowerLog,
  useUpdateLog: projectApi.useUpdateManpowerLog,
  useDeleteLog: projectApi.useDeleteManpowerLog,
};

export const equipmentApi = {
  useList: projectApi.useEquipmentList,
  useDetail: projectApi.useEquipment,
  useCreate: projectApi.useCreateEquipment,
  useUpdate: projectApi.useUpdateEquipment,
  useDelete: projectApi.useDeleteEquipment,
  useProjectLogs: projectApi.useEquipmentLogs,
  useCreateProjectLog: projectApi.useCreateEquipmentLog,
  useUpdateProjectLog: projectApi.useUpdateEquipmentLog,
  useDeleteProjectLog: projectApi.useDeleteEquipmentLog,
};


export const procurementApi = {
  useRequisitions: (enabled = true) =>
    useReadList(
      ["procurement", "requisitions"],
      endpoints.procurement.requisitions,
      enabled,
    ),
  useRequisition: (id: Id | null) =>
    useRead(
      ["procurement", "requisition", id],
      endpoints.procurement.requisition(id ?? ""),
      id != null,
    ),
  useCreateRequisition: () =>
    useWrite(
      ({ body }: MutationInput) =>
        apiClient.post(endpoints.procurement.requisitions, body),
      procurementInvalidations,
    ),
  useUpdateRequisitionStatus: () =>
    useWrite(
      ({ id, status }: MutationInput) =>
        apiClient.post(
          endpoints.procurement.requisitionStatus(
            needId(id, "Requisition ID"),
            needStatus(status, "Requisition status"),
          ),
        ),
      procurementInvalidations,
    ),
  useGrns: (enabled = true) =>
    useReadList(["procurement", "grns"], endpoints.procurement.grns, enabled),
  useGrn: (id: Id | null) =>
    useRead(
      ["procurement", "grn", id],
      endpoints.procurement.grn(id ?? ""),
      id != null,
    ),
  useCreateGrn: () =>
    useWrite(
      ({ body }: MutationInput) =>
        apiClient.post(endpoints.procurement.grns, body),
      procurementInvalidations,
    ),
  useUpdateGrnStatus: () =>
    useWrite(
      ({ id, status }: MutationInput) =>
        apiClient.post(
          endpoints.procurement.grnStatus(
            needId(id, "GRN ID"),
            needStatus(status, "GRN status"),
          ),
        ),
      procurementInvalidations,
    ),
  useSiteIssues: (enabled = true) =>
    useReadList(
      ["procurement", "site-issues"],
      endpoints.procurement.siteIssues,
      enabled,
    ),
  useSiteIssue: (id: Id | null) =>
    useRead(
      ["procurement", "site-issue", id],
      endpoints.procurement.siteIssue(id ?? ""),
      id != null,
    ),
  useCreateSiteIssue: () =>
    useWrite(
      ({ body }: MutationInput) =>
        apiClient.post(endpoints.procurement.siteIssues, body),
      procurementInvalidations,
    ),
  useUpdateSiteIssueStatus: () =>
    useWrite(
      ({ id, status }: MutationInput) =>
        apiClient.post(
          endpoints.procurement.siteIssueStatus(
            needId(id, "Site issue ID"),
            needStatus(status, "Site issue status"),
          ),
        ),
      procurementInvalidations,
    ),
};
