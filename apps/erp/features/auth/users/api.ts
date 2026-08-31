import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PasswordChangeValues,
  User,
  UserCreateValues,
  UserUpdateValues,
} from "./schema";

export const userHooks = createResourceHooks<
  User,
  UserCreateValues,
  UserUpdateValues
>(
  "users",
  endpoints.auth.users,
  apiClient,
  null as any, // queryClient is passed at call site for custom factory usage if needed, or we just export the hooks directly if we have a pattern. Wait, the factory expects queryClient. Let's write them explicitly or use a wrapper.
);

export function useUsers(params?: Record<string, string>) {
  const qc = useQueryClient();
  return createResourceHooks<User, UserCreateValues, UserUpdateValues>(
    "users",
    endpoints.auth.users,
    apiClient,
    qc,
  ).useList(params);
}

export function useCreateUser() {
  const qc = useQueryClient();
  return createResourceHooks<User, UserCreateValues, UserUpdateValues>(
    "users",
    endpoints.auth.users,
    apiClient,
    qc,
  ).useCreate();
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return createResourceHooks<User, UserCreateValues, UserUpdateValues>(
    "users",
    endpoints.auth.users,
    apiClient,
    qc,
  ).useUpdate();
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return createResourceHooks<User, UserCreateValues, UserUpdateValues>(
    "users",
    endpoints.auth.users,
    apiClient,
    qc,
  ).useDelete();
}

export function useChangePassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PasswordChangeValues) => {
      return apiClient.put<{ message: string }>(endpoints.auth.password, data);
    },
    onSuccess: () => {
      // Optional: invalidations if needed
    },
  });
}
