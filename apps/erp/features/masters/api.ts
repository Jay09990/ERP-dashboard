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

export const branchApi = {
  useList: (p?: any) => useMasterResource("branches", endpoints.masters.branch).useList(p),
  useCreate: () => useMasterResource("branches", endpoints.masters.branch).useCreate(),
  useUpdate: () => useMasterResource("branches", endpoints.masters.branch).useUpdate(),
  useDelete: () => useMasterResource("branches", endpoints.masters.branch).useDelete(),
};

export const departmentApi = {
  useList: (p?: any) => useMasterResource("departments", endpoints.masters.departments).useList(p),
  useCreate: () => useMasterResource("departments", endpoints.masters.departments).useCreate(),
  useUpdate: () => useMasterResource("departments", endpoints.masters.departments).useUpdate(),
  useDelete: () => useMasterResource("departments", endpoints.masters.departments).useDelete(),
};

export const designationApi = {
  useList: (p?: any) => useMasterResource("designations", endpoints.masters.designations).useList(p),
  useCreate: () => useMasterResource("designations", endpoints.masters.designations).useCreate(),
  useUpdate: () => useMasterResource("designations", endpoints.masters.designations).useUpdate(),
  useDelete: () => useMasterResource("designations", endpoints.masters.designations).useDelete(),
};

export const shiftApi = {
  useList: (p?: any) => useMasterResource("shifts", endpoints.masters.shift).useList(p),
  useCreate: () => useMasterResource("shifts", endpoints.masters.shift).useCreate(),
  useUpdate: () => useMasterResource("shifts", endpoints.masters.shift).useUpdate(),
  useDelete: () => useMasterResource("shifts", endpoints.masters.shift).useDelete(),
};

export const holidayApi = {
  useList: (p?: any) => useMasterResource("holidays", endpoints.masters.holiday).useList(p),
  useCreate: () => useMasterResource("holidays", endpoints.masters.holiday).useCreate(),
  useUpdate: () => useMasterResource("holidays", endpoints.masters.holiday).useUpdate(),
  useDelete: () => useMasterResource("holidays", endpoints.masters.holiday).useDelete(),
};

export const financialYearApi = {
  useList: (p?: any) => useMasterResource("financial-years", endpoints.masters.financialYears).useList(p),
  useCreate: () => useMasterResource("financial-years", endpoints.masters.financialYears).useCreate(),
  useUpdate: () => useMasterResource("financial-years", endpoints.masters.financialYears).useUpdate(),
  useDelete: () => useMasterResource("financial-years", endpoints.masters.financialYears).useDelete(),
};

export const costCenterApi = {
  useList: (p?: any) => useMasterResource("cost-centers", endpoints.masters.costCenters).useList(p),
  useCreate: () => useMasterResource("cost-centers", endpoints.masters.costCenters).useCreate(),
  useUpdate: () => useMasterResource("cost-centers", endpoints.masters.costCenters).useUpdate(),
  useDelete: () => useMasterResource("cost-centers", endpoints.masters.costCenters).useDelete(),
};

export const chartOfAccountsApi = {
  useList: (p?: any) => useMasterResource("chart-of-accounts", endpoints.masters.chartOfAccounts).useList(p),
  useCreate: () => useMasterResource("chart-of-accounts", endpoints.masters.chartOfAccounts).useCreate(),
  useUpdate: () => useMasterResource("chart-of-accounts", endpoints.masters.chartOfAccounts).useUpdate(),
  useDelete: () => useMasterResource("chart-of-accounts", endpoints.masters.chartOfAccounts).useDelete(),
};

export const crDrReasonApi = {
  useList: (p?: any) => useMasterResource("cr-dr-reasons", endpoints.masters.crDrReason).useList(p),
  useCreate: () => useMasterResource("cr-dr-reasons", endpoints.masters.crDrReason).useCreate(),
  useUpdate: () => useMasterResource("cr-dr-reasons", endpoints.masters.crDrReason).useUpdate(),
  useDelete: () => useMasterResource("cr-dr-reasons", endpoints.masters.crDrReason).useDelete(),
};

export const documentTypeApi = {
  useList: (p?: any) => useMasterResource("document-types", endpoints.masters.documentType).useList(p),
  useCreate: () => useMasterResource("document-types", endpoints.masters.documentType).useCreate(),
  useUpdate: () => useMasterResource("document-types", endpoints.masters.documentType).useUpdate(),
  useDelete: () => useMasterResource("document-types", endpoints.masters.documentType).useDelete(),
};

export const documentSeriesApi = {
  useList: (p?: any) => useMasterResource("document-series", endpoints.masters.documentSeries).useList(p),
  useCreate: () => useMasterResource("document-series", endpoints.masters.documentSeries).useCreate(),
  useUpdate: () => useMasterResource("document-series", endpoints.masters.documentSeries).useUpdate(),
  useDelete: () => useMasterResource("document-series", endpoints.masters.documentSeries).useDelete(),
};
