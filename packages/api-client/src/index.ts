import {
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type ApiClient = {
  get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...init.headers },
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message:
        typeof payload === "object" && payload && "message" in payload
          ? String(payload.message)
          : "Request failed",
      details: payload,
    };
    throw error;
  }

  return payload as T;
}

export function createApiClient(): ApiClient {
  return {
    get: <T>(
      path: string,
      params?: Record<string, string | number | boolean | undefined>,
    ) => {
      const url = new URL(path, window.location.origin);
      for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
      return request<T>(url.pathname + url.search);
    },
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  };
}

export type ResourceHooks<T, TCreate, TUpdate> = {
  useList: (
    params?: Record<string, string | number | boolean | undefined>,
  ) => UseQueryResult<T[], ApiError>;
  useDetail: (id: string) => UseQueryResult<T, ApiError>;
  useCreate: () => UseMutationResult<T, ApiError, TCreate>;
  useUpdate: () => UseMutationResult<
    T,
    ApiError,
    { id: string; body: TUpdate }
  >;
  useDelete: () => UseMutationResult<T, ApiError, string>;
};

export function createResourceHooks<T, TCreate, TUpdate>(
  resourceKey: string,
  endpoint: string,
  apiClient: ApiClient,
  queryClient: QueryClient,
): ResourceHooks<T, TCreate, TUpdate> {
  return {
    useList: (params) =>
      useQuery({
        queryKey: [resourceKey, "list", params],
        queryFn: () => apiClient.get<T[]>(endpoint, params),
      }),
    useDetail: (id) =>
      useQuery({
        queryKey: [resourceKey, id],
        queryFn: () => apiClient.get<T>(`${endpoint}/${id}`),
      }),
    useCreate: () =>
      useMutation({
        mutationFn: (body: TCreate) => apiClient.post<T>(endpoint, body),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: [resourceKey] }),
      }),
    useUpdate: () =>
      useMutation({
        mutationFn: ({ id, body }) =>
          apiClient.put<T>(`${endpoint}/${id}`, body),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: [resourceKey] }),
      }),
    useDelete: () =>
      useMutation({
        mutationFn: (id) => apiClient.delete<T>(`${endpoint}/${id}`),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: [resourceKey] }),
      }),
  };
}
