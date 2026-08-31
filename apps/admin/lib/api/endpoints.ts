export const endpoints = {
  admin: {
    register: "/api/admin/register",
    login: "/api/admin/login",
    // TODO(unconfirmed): backend has never documented an explicit logout
    // endpoint/method — this path is inferred from the /api/admin/login pattern.
    // Confirm the real path + method with the backend developer.
    logout: "/api/admin/logout",
    me: "/api/admin/me",
  },

  companies: "/api/admin/companies",
  company: (id: string | number) => `/api/admin/companies/${id}`,
  companyHardDelete: (id: string | number) =>
    `/api/admin/companies/${id}/harddelete`,
  changeCompanyStatus: (companyId: string | number, status: string) =>
    `/api/change_status/${companyId}/${status}`,
} as const;
