import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProfileValues } from "./schema";

export function useCompanyProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // Assuming GET /api/auth/profile returns the profile data
      return apiClient.get<ProfileValues>(endpoints.auth.profile);
    },
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileValues) => {
      return apiClient.put<ProfileValues>(endpoints.auth.profile, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
