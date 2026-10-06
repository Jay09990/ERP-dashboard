const masterApiBase = "/api/master";

export const endpoints = {
  auth: {
    login: "/api/auth/login",

    // audit_logs: placeholder — backend endpoint not yet documented.
    // Activity Log task (Phase 10) needs this; blocked until backend exposes it.
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
  inventory: {
    warehouse: "/api/inventory/warehouse",
    warehouseDetail: (id: string | number) => `/api/inventory/warehouse/${id}`,
    batch: "/api/inventory/batch",
    batchDetail: (id: string | number) => `/api/inventory/batch/${id}`,
    stockSummary: "/api/inventory/stock/summary",
    stockLedger: "/api/inventory/stock/ledger",
    transfer: "/api/inventory/transfer",
    transferDetail: (id: string | number) => `/api/inventory/transfer/${id}`,
    transferStatus: (id: string | number, status: string) =>
      `/api/inventory/transfer/${id}/${status}`,
    adjustment: "/api/inventory/adjustment",
    adjustmentDetail: (id: string | number) =>
      `/api/inventory/adjustment/${id}`,
    adjustmentStatus: (id: string | number, status: string) =>
      `/api/inventory/adjustment/${id}/${status}`,
  },
  projects: {
    list: "/api/project",
    detail: (id: string | number) => `/api/project/${id}`,
    createFromSalesOrder: (salesOrderId: string | number) =>
      `/api/project/from-sales-order/${salesOrderId}`,
    status: (id: string | number, status: string) =>
      `/api/project/${id}/status/${status}`,
    financials: (id: string | number) => `/api/project/${id}/financials`,
    sites: (id: string | number) => `/api/project/${id}/sites`,
    site: (id: string | number, siteId: string | number) =>
      `/api/project/${id}/sites/${siteId}`,
    boq: (id: string | number) => `/api/project/${id}/boq`,
    boqItem: (id: string | number, boqId: string | number) =>
      `/api/project/${id}/boq/${boqId}`,
    milestones: (id: string | number) => `/api/project/${id}/milestones`,
    milestone: (id: string | number, milestoneId: string | number) =>
      `/api/project/${id}/milestones/${milestoneId}`,
    tasks: (id: string | number) => `/api/project/${id}/tasks`,
    task: (id: string | number, taskId: string | number) =>
      `/api/project/${id}/tasks/${taskId}`,
    dpr: (id: string | number) => `/api/projects/${id}/dpr`,
    documents: (id: string | number) => `/api/projects/${id}/documents`,
    document: (id: string | number, documentId: string | number) =>
      `/api/projects/${id}/documents/${documentId}`,
  },
  procurement: {
    requisitions: "/api/procurement/requisition",
    requisition: (id: string | number) => `/api/procurement/requisition/${id}`,
    requisitionStatus: (id: string | number, status: string) =>
      `/api/procurement/requisition/${id}/${status}`,
    grns: "/api/procurement/grn",
    grn: (id: string | number) => `/api/procurement/grn/${id}`,
    grnStatus: (id: string | number, status: string) =>
      `/api/procurement/grn/${id}/${status}`,
    siteIssues: "/api/procurement/site-issue",
    siteIssue: (id: string | number) => `/api/procurement/site-issue/${id}`,
    siteIssueStatus: (id: string | number, status: string) =>
      `/api/procurement/site-issue/${id}/${status}`,
  },
  crm: {
    leads: "/api/lead",
    lead: (id: string | number) => `/api/lead/${id}`,
    leadStatus: (id: string | number, status: string) =>
      `/api/lead/${id}/status/${status}`,
    leadConvert: (id: string | number) => `/api/lead/${id}/convert`,
    leadActivities: (id: string | number) => `/api/lead/${id}/activities`,
    leadSources: "/api/crm/lead_sources",
    industries: "/api/crm/industries",
    followUps: "/api/crm/follow-ups",
  },
} as const;
