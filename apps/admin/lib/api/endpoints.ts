export const endpoints = {
  admin: {
    register: "/api/admin/register",
    login: "/api/admin/login",
    logout: "/api/admin/logout",
  },

  companies: "/api/admin/companies",
  company: (id: string | number) => `/api/admin/companies/${id}`,
  companyHardDelete: (id: string | number) =>
    `/api/admin/companies/${id}/harddelete`,
  changeCompanyStatus: (companyId: string | number, status: string) =>
    `/api/change_status/${companyId}/${status}`,
} as const;
