export const endpoints = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",

    profile: "/api/auth/profile",
    users: "/api/auth/users",
    password: "/api/auth/user/password",
    roles: "/api/auth/roles",
    permissions: "/api/auth/permissions",
    rolePermissions: (roleId: string | number) =>
      `/api/auth/roles/${roleId}/permissions`,
    userPermissions: (userId: string | number) =>
      `/api/auth/users/${userId}/permissions`,
  },
  party: {
    customers: "/api/party/customers",
    vendors: "/api/party/vendors",
  },
  items: "/api/items/items",
  quotation: "/api/quotation",
  salesOrder: "/api/sales_order",
  purchaseOrder: "/api/purchase_order",
  proforma: "/api/proforma",
  deliveryChallan: "/api/delivery_challan",
  invoice: "/api/invoice",
  purchaseInvoice: "/api/purchase_invoice",
} as const;
