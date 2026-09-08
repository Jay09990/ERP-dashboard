import { apiClient } from "@/lib/api/client";
import { createResourceHooks } from "@/lib/api/create-resource-hooks";
import { endpoints } from "@/lib/api/endpoints";
import { useQueryClient } from "@tanstack/react-query";

export function useMasterResource<T, TCreate, TUpdate>(
  key: string,
  endpoint: string,
) {
  const qc = useQueryClient();
  const hooks = createResourceHooks<T, TCreate, TUpdate>(key, endpoint, apiClient, qc);

  return {
    useList: (params?: Record<string, string>) => hooks.useList(params),
    useCreate: () => hooks.useCreate(),
    useUpdate: () => hooks.useUpdate(),
    useDelete: () => hooks.useDelete(),
  };
}

export const uomApi = {
  useList: (p?: any) => useMasterResource("uom", endpoints.masters.uom).useList(p),
  useCreate: () => useMasterResource("uom", endpoints.masters.uom).useCreate(),
  useUpdate: () => useMasterResource("uom", endpoints.masters.uom).useUpdate(),
  useDelete: () => useMasterResource("uom", endpoints.masters.uom).useDelete(),
};

export const taxTypesApi = {
  useList: (p?: any) => useMasterResource("tax-types", endpoints.masters.taxTypes).useList(p),
  useCreate: () => useMasterResource("tax-types", endpoints.masters.taxTypes).useCreate(),
  useUpdate: () => useMasterResource("tax-types", endpoints.masters.taxTypes).useUpdate(),
  useDelete: () => useMasterResource("tax-types", endpoints.masters.taxTypes).useDelete(),
};

export const currencyApi = {
  useList: (p?: any) => useMasterResource("currency", endpoints.masters.currency).useList(p),
  useCreate: () => useMasterResource("currency", endpoints.masters.currency).useCreate(),
  useUpdate: () => useMasterResource("currency", endpoints.masters.currency).useUpdate(),
  useDelete: () => useMasterResource("currency", endpoints.masters.currency).useDelete(),
};

export const paymentTermsApi = {
  useList: (p?: any) => useMasterResource("payment-terms", endpoints.masters.paymentTerms).useList(p),
  useCreate: () => useMasterResource("payment-terms", endpoints.masters.paymentTerms).useCreate(),
  useUpdate: () => useMasterResource("payment-terms", endpoints.masters.paymentTerms).useUpdate(),
  useDelete: () => useMasterResource("payment-terms", endpoints.masters.paymentTerms).useDelete(),
};

export const bankApi = {
  useList: (p?: any) => useMasterResource("banks", endpoints.masters.bank).useList(p),
  useCreate: () => useMasterResource("banks", endpoints.masters.bank).useCreate(),
  useUpdate: () => useMasterResource("banks", endpoints.masters.bank).useUpdate(),
  useDelete: () => useMasterResource("banks", endpoints.masters.bank).useDelete(),
};

// Location masters share the standard CRUD contract; their relationships are
// supplied through the country_id and state_id fields in the page forms.
export const countryApi = {
  useList: (p?: any) => useMasterResource("countries", endpoints.masters.country).useList(p),
  useCreate: () => useMasterResource("countries", endpoints.masters.country).useCreate(),
  useUpdate: () => useMasterResource("countries", endpoints.masters.country).useUpdate(),
  useDelete: () => useMasterResource("countries", endpoints.masters.country).useDelete(),
};

export const stateApi = {
  useList: (p?: any) => useMasterResource("states", endpoints.masters.state).useList(p),
  useCreate: () => useMasterResource("states", endpoints.masters.state).useCreate(),
  useUpdate: () => useMasterResource("states", endpoints.masters.state).useUpdate(),
  useDelete: () => useMasterResource("states", endpoints.masters.state).useDelete(),
};

export const cityApi = {
  useList: (p?: any) => useMasterResource("cities", endpoints.masters.city).useList(p),
  useCreate: () => useMasterResource("cities", endpoints.masters.city).useCreate(),
  useUpdate: () => useMasterResource("cities", endpoints.masters.city).useUpdate(),
  useDelete: () => useMasterResource("cities", endpoints.masters.city).useDelete(),
};
