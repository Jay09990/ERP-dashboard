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
  useLeads: () =>
    useQuery({
      queryKey: ["leads"],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.leads),
    }),
  useLeadSources: () =>
    useQuery({
      queryKey: ["crm", "lead-sources"],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.leadSources),
    }),
  useIndustries: () =>
    useQuery({
      queryKey: ["crm", "industries"],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.industries),
    }),
  useFollowUps: (scope: string) =>
    useQuery({
      queryKey: ["crm", "follow-ups", scope],
      queryFn: () => apiClient.get<unknown>(endpoints.crm.followUps, { scope }),
    }),
  useActivities: (id: number | null) =>
    useQuery({
      queryKey: ["crm", "activities", id],
      queryFn: () =>
        apiClient.get<unknown>(endpoints.crm.leadActivities(id as number)),
      enabled: id != null,
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
};
