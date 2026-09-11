const masterApiBase = "/api/master";

export const endpoints = {
  auth: {
    login: "/api/auth/login",
    // TODO(unconfirmed): backend has never documented an explicit logout
    // endpoint/method — this path is inferred from the /api/auth/login pattern.
    // Confirm the real path + method with the backend developer.
    logout: "/api/auth/logout",

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
    itemTypes: "/api/items/item-types",
    itemType: (id: string | number) => `/api/items/item-types/${id}`,
    itemCategories: "/api/items/item-category",
    itemCategory: (id: string | number) => `/api/items/item-category/${id}`,
    itemCategoryParents: "/api/items/item-category/parents",
    itemCategorySubcategories: (id: string | number) =>
      `/api/items/item-category/${id}/subcategories`,
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

    // Checklist-complete; payload shape not yet in modules.md — paths follow other document modules.
    creditNote: "/api/credit_note",
    creditNoteDetail: (id: string | number) => `/api/credit_note/${id}`,
    debitNote: "/api/debit_note",
    debitNoteDetail: (id: string | number) => `/api/debit_note/${id}`,
  },
  masters: {
    // Master routes are mounted beneath /api/master by the Express backend.
    country: `${masterApiBase}/country`,
    state: `${masterApiBase}/state`,
    city: `${masterApiBase}/city`,
    currency: `${masterApiBase}/currency`,
    taxTypes: `${masterApiBase}/tax-types`,
    uom: `${masterApiBase}/units`,
    financialYears: `${masterApiBase}/financial-years`,
    paymentTerms: `${masterApiBase}/payment-terms`,
    bank: `${masterApiBase}/bank`,
    crDrReason: `${masterApiBase}/cr-dr-reason`,
    chartOfAccounts: `${masterApiBase}/chart-of-accounts`,
    departments: `${masterApiBase}/departments`,
    branch: `${masterApiBase}/branch`,
    designations: `${masterApiBase}/designations`,
    shift: `${masterApiBase}/shifts`,
    holiday: `${masterApiBase}/holidays`,
    costCenters: `${masterApiBase}/cost-centers`,
    documentType: `${masterApiBase}/document-types`,
    documentSeries: `${masterApiBase}/document-series`,
    itemAttributes: `${masterApiBase}/item_attributes`,
    warehouse: `${masterApiBase}/warehouse_mst`,
    itemImages: `${masterApiBase}/item_images`,
  },
} as const;
