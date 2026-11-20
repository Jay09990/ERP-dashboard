import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Lead, LeadActivity } from "./schema";

function useCrmMutation<TInput>(
  mutationFn: (input: TInput) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["crm"] }),
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
      ]);
    },
  });
}

export const crmApi = {
  useLeads: (enabled = true) =>
    useQuery({
      queryKey: ["leads"],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.leads),
      enabled,
    }),
  useLeadSources: (enabled = true) =>
    useQuery({
      queryKey: ["crm", "lead-sources"],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.leadSources),
      enabled,
    }),
  useIndustries: (enabled = true) =>
    useQuery({
      queryKey: ["crm", "industries"],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.industries),
      enabled,
    }),
  useFollowUps: (scope: string, enabled = true) =>
    useQuery({
      queryKey: ["crm", "follow-ups", scope],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.followUps, { scope }),
      enabled,
    }),
  useActivities: (id: number | null, enabled = true) =>
    useQuery({
      queryKey: ["crm", "activities", id],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.crm.leadActivities(id as number)),
      enabled: id != null && enabled,
    }),
  useCreateLead: () =>
    useCrmMutation((body: Partial<Lead>) =>
      apiClient.post(endpoints.crm.leads, body),
    ),
  useUpdateLead: () =>
    useCrmMutation(({ id, body }: { id: number; body: Partial<Lead> }) =>
      apiClient.put(endpoints.crm.lead(id), body),
    ),
  useDeleteLead: () =>
    useCrmMutation((id: number) => apiClient.delete(endpoints.crm.lead(id))),
  useChangeLeadStatus: () =>
    useCrmMutation(
      ({ id, status, body }: { id: number; status: string; body?: unknown }) =>
        apiClient.post(endpoints.crm.leadStatus(id, status), body),
    ),
  useConvertLead: () =>
    useCrmMutation((id: number) =>
      apiClient.post(endpoints.crm.leadConvert(id), {}),
    ),
  useCreateActivity: () =>
    useCrmMutation(
      ({ id, body }: { id: number; body: Partial<LeadActivity> }) =>
        apiClient.post(endpoints.crm.leadActivities(id), body),
    ),
  useCreateLeadSource: () =>
    useCrmMutation((body: { source_name: string }) =>
      apiClient.post(endpoints.crm.leadSources, body),
    ),
  useCreateIndustry: () =>
    useCrmMutation((body: { industry_name: string }) =>
      apiClient.post(endpoints.crm.industries, body),
    ),
  useEnquiries: (filters?: Record<string, string>, enabled = true) =>
    useQuery({
      queryKey: ["enquiries", filters],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.enquiries, filters),
      enabled,
    }),
  useEnquiry: (id: number | string | null, enabled = true) =>
    useQuery({
      queryKey: ["enquiry", id],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.enquiry(id as number)),
      enabled: id != null && enabled,
    }),
  useCreateEnquiry: () =>
    useCrmMutation((body: unknown) =>
      apiClient.post(endpoints.crm.enquiries, body),
    ),
  useUpdateEnquiry: () =>
    useCrmMutation(({ id, body }: { id: number | string; body: unknown }) =>
      apiClient.put(endpoints.crm.enquiry(id), body),
    ),
  useDeleteEnquiry: () =>
    useCrmMutation((id: number | string) =>
      apiClient.delete(endpoints.crm.enquiry(id)),
    ),
  useChangeEnquiryStatus: () =>
    useCrmMutation(
      ({
        id,
        status,
        body,
      }: { id: number | string; status: string; body?: unknown }) =>
        apiClient.post(endpoints.crm.enquiryStatus(id, status), body),
    ),
  useLinkQuotation: () =>
    useCrmMutation(
      ({
        id,
        quotationId,
      }: { id: number | string; quotationId: number | string }) =>
        apiClient.post(
          endpoints.crm.enquiryLinkQuotation(id, quotationId),
          {},
        ),
    ),
  useEnquiryActivities: (id: number | string | null, enabled = true) =>
    useQuery({
      queryKey: ["enquiry-activities", id],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.crm.enquiryActivities(id as number)),
      enabled: id != null && enabled,
    }),
  useCreateEnquiryActivity: () =>
    useCrmMutation(
      ({ id, body }: { id: number | string; body: unknown }) =>
        apiClient.post(endpoints.crm.enquiryActivities(id), body),
    ),
  useEnquiryDocuments: (id: number | string | null, enabled = true) =>
    useQuery({
      queryKey: ["enquiry-documents", id],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.crm.enquiryDocuments(id as number)),
      enabled: id != null && enabled,
    }),
  useCreateEnquiryDocument: () =>
    useCrmMutation(
      ({ id, body }: { id: number | string; body: unknown }) =>
        apiClient.post(endpoints.crm.enquiryDocuments(id), body),
    ),
  useDeleteEnquiryDocument: () =>
    useCrmMutation(
      ({ id, docId }: { id: number | string; docId: number | string }) =>
        apiClient.delete(endpoints.crm.enquiryDocument(id, docId)),
    ),
};

export const enquiryApi = {
  useList: crmApi.useEnquiries,
  useDetail: crmApi.useEnquiry,
  useCreate: crmApi.useCreateEnquiry,
  useUpdate: crmApi.useUpdateEnquiry,
  useDelete: crmApi.useDeleteEnquiry,
  useChangeStatus: crmApi.useChangeEnquiryStatus,
  useLinkQuotation: crmApi.useLinkQuotation,
  useActivities: crmApi.useEnquiryActivities,
  useCreateActivity: crmApi.useCreateEnquiryActivity,
  useDocuments: crmApi.useEnquiryDocuments,
  useCreateDocument: crmApi.useCreateEnquiryDocument,
  useDeleteDocument: crmApi.useDeleteEnquiryDocument,
};

