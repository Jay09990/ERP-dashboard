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
  useList: (filters?: Record<string, string>) =>
    useQuery({
      queryKey: ["projects", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.projects.list, filters),
    }),
  useDetail: (id: Id) =>
    useRead(["project", id], endpoints.projects.detail(id)),
  useFinancials: (id: Id) =>
    useRead(["project-financials", id], endpoints.projects.financials(id)),
  useDprList: (id: Id) =>
    useReadList(["project-dpr", id], endpoints.projects.dpr(id)),
  useDocuments: (id: Id) =>
    useReadList(["project-documents", id], endpoints.projects.documents(id)),
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
};

export const procurementApi = {
  useRequisitions: () =>
    useReadList(
      ["procurement", "requisitions"],
      endpoints.procurement.requisitions,
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
  useGrns: () =>
    useReadList(["procurement", "grns"], endpoints.procurement.grns),
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
  useSiteIssues: () =>
    useReadList(
      ["procurement", "site-issues"],
      endpoints.procurement.siteIssues,
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
