export const endpoints = {
  auth: {
    login: "/api/auth/login",
    // TODO(unconfirmed): backend has never documented an explicit logout
    // endpoint/method — this path is inferred from the /api/auth/login pattern.
    // Confirm the real path + method with the backend developer.
    logout: "/api/auth/logout",
    me: "/api/auth/me",

    profile: "/api/auth/profile",
    users: "/api/auth/users",
    user: (id: string | number) => `/api/auth/users/${id}`,
    password: "/api/auth/user/password",

    roles: "/api/auth/roles",
    role: (id: string | number) => `/api/auth/roles/${id}`,

    permissions: "/api/auth/permissions",
    rolePermissions: (roleId: string | number) =>
      `/api/auth/roles/${roleId}/permissions`,
    userPermissions: (userId: string | number) =>
      `/api/auth/users/${userId}/permissions`,
  },
  party: {
    customers: "/api/party/customers",
    customer: (id: string | number) => `/api/party/customers/${id}`,
    vendors: "/api/party/vendors",
    vendor: (id: string | number) => `/api/party/vendors/${id}`,
  },
  items: {
    items: "/api/items/items",
    item: (id: string | number) => `/api/items/items/${id}`,
  },
  documents: {
    quotation: "/api/quotation",
    quotationDetail: (id: string | number) => `/api/quotation/${id}`,

    salesOrder: "/api/sales_order",
    salesOrderDetail: (id: string | number) => `/api/sales_order/${id}`,

    purchaseOrder: "/api/purchase_order",
    purchaseOrderDetail: (id: string | number) => `/api/purchase_order/${id}`,

    proforma: "/api/proforma",
    proformaDetail: (id: string | number) => `/api/proforma/${id}`,

    deliveryChallan: "/api/delivery_challan",
    deliveryChallanDetail: (id: string | number) =>
      `/api/delivery_challan/${id}`,

    invoice: "/api/invoice",
    invoiceDetail: (id: string | number) => `/api/invoice/${id}`,
    invoiceItem: (invoiceId: string | number, itemId: string | number) =>
      `/api/invoice/${invoiceId}/${itemId}`,
    invoiceStatus: (invoiceId: string | number, status: string) =>
      `/api/invoice/${invoiceId}/${status}`,

    purchaseInvoice: "/api/purchase_invoice",
    purchaseInvoiceDetail: (id: string | number) =>
      `/api/purchase_invoice/${id}`,
  },
  masters: {
    country: "/api/country_mst",
    state: "/api/state_mst",
    city: "/api/city_mst",
    currency: "/api/currency_mst",
    taxTypes: "/api/tax_types",
    uom: "/api/units_of_measure",
    financialYears: "/api/financial_years",
    paymentTerms: "/api/payment_terms",
    bank: "/api/bank_mst",
    crDrReason: "/api/cr_dr_reason_mst",
    chartOfAccounts: "/api/chart_of_accounts",
    departments: "/api/departments",
    branch: "/api/branch_mst",
    designations: "/api/designations",
    shift: "/api/shift_master",
    holiday: "/api/holiday_master",
    costCenters: "/api/cost_centers",
    documentType: "/api/document_type",
    documentSeries: "/api/document_series",
    itemType: "/api/item_type",
    itemCategories: "/api/item_categories",
    itemAttributes: "/api/item_attributes",
    warehouse: "/api/warehouse_mst",
    itemImages: "/api/item_images",
  },
} as const;
