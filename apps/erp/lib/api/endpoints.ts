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
  manpower: {
    trades: "/api/manpower/trades",
    logs: (projectId: string | number) => `/api/manpower/${projectId}/logs`,
    log: (projectId: string | number, logId: string | number) =>
      `/api/manpower/${projectId}/logs/${logId}`,
  },
  equipment: {
    list: "/api/equipment",
    detail: (id: string | number) => `/api/equipment/${id}`,
    projectLogs: (projectId: string | number) =>
      `/api/equipment/project/${projectId}/logs`,
    projectLog: (projectId: string | number, logId: string | number) =>
      `/api/equipment/project/${projectId}/logs/${logId}`,
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
    enquiries: "/api/enquiry",
    enquiry: (id: string | number) => `/api/enquiry/${id}`,
    enquiryStatus: (id: string | number, status: string) =>
      `/api/enquiry/${id}/status/${status}`,
    enquiryLinkQuotation: (
      id: string | number,
      quotationId: string | number,
    ) => `/api/enquiry/${id}/link-quotation/${quotationId}`,
    enquiryActivities: (id: string | number) =>
      `/api/enquiry/${id}/activities`,
    enquiryDocuments: (id: string | number) =>
      `/api/enquiry/${id}/documents`,
    enquiryDocument: (id: string | number, docId: string | number) =>
      `/api/enquiry/${id}/documents/${docId}`,
  },
  hrms: {
    // Settings & Work locations
    settings: "/api/hrms/settings",
    workLocations: "/api/hrms/work-locations",
    workLocation: (id: string | number) => `/api/hrms/work-locations/${id}`,

    // Salary configuration
    salaryComponents: "/api/hrms/salary-components",
    salaryStructures: "/api/hrms/salary-structures",
    salaryStructure: (id: string | number) =>
      `/api/hrms/salary-structures/${id}`,
    statutoryRules: "/api/hrms/statutory-rules",
    statutoryRule: (id: string | number) => `/api/hrms/statutory-rules/${id}`,

    // Leave configuration
    leaveTypes: "/api/hrms/leave-types",
    leaveType: (id: string | number) => `/api/hrms/leave-types/${id}`,

    // Employees
    employees: "/api/hrms/employees",
    employee: (id: string | number) => `/api/hrms/employees/${id}`,
    employeeSalary: (employeeId: string | number) =>
      `/api/hrms/employees/${employeeId}/salary`,
    employeeDocuments: (employeeId: string | number) =>
      `/api/hrms/employees/${employeeId}/documents`,
    document: (documentId: string | number) =>
      `/api/hrms/documents/${documentId}`,
    verifyDocument: (documentId: string | number) =>
      `/api/hrms/documents/${documentId}/verify`,

    // Employee Self-service
    me: "/api/hrms/me",
    meAttendance: "/api/hrms/me/attendance",
    meLeave: "/api/hrms/me/leave",
    mePayslips: "/api/hrms/me/payslips",
    notifications: "/api/hrms/notifications",
    notificationsRead: "/api/hrms/notifications/read",

    // Tasks (Onboarding, Offboarding, General)
    tasks: "/api/hrms/tasks",
    task: (id: string | number) => `/api/hrms/tasks/${id}`,
    onboardingTasks: "/api/hrms/tasks",
    onboardingTask: (id: string | number) => `/api/hrms/tasks/${id}`,

    // Project assignments
    assignments: "/api/hrms/assignments",
    assignment: (id: string | number) => `/api/hrms/assignments/${id}`,
    assignmentClose: (id: string | number) =>
      `/api/hrms/assignments/${id}/close`,
    projectAssignments: "/api/hrms/assignments",
    projectAssignmentClose: (id: string | number) =>
      `/api/hrms/assignments/${id}/close`,

    // Attendance
    attendance: "/api/hrms/attendance",
    attendanceMark: "/api/hrms/attendance/mark",
    attendanceSummary: "/api/hrms/attendance/summary",
    attendanceReprocess: "/api/hrms/attendance/reprocess",
    attendanceAlerts: "/api/hrms/attendance/summary",

    // Overtime
    overtime: "/api/hrms/overtime",
    overtimeReview: (id: string | number) =>
      `/api/hrms/overtime/${id}/review`,
    overtimeRequests: "/api/hrms/overtime",
    overtimeRequestReview: (id: string | number) =>
      `/api/hrms/overtime/${id}/review`,

    // Leave requests & balances
    leaveRequests: "/api/hrms/leave-requests",
    leaveRequest: (id: string | number) => `/api/hrms/leave-requests/${id}`,
    leaveRequestDecision: (id: string | number) =>
      `/api/hrms/leave-requests/${id}/decision`,
    leaveRequestCancel: (id: string | number) =>
      `/api/hrms/leave-requests/${id}/cancel`,
    leaveBalances: "/api/hrms/leave-balances",
    leaveBalance: (employeeId: string | number) =>
      `/api/hrms/leave-balances/${employeeId}`,
    leaveLedger: (employeeId: string | number) =>
      `/api/hrms/leave-balances/${employeeId}/ledger`,
    leaveBalanceAdjust: "/api/hrms/leave-balances/adjust",

    // Project labour & timesheets
    projectLabourAttendance: (projectId: string | number) =>
      `/api/hrms/projects/${projectId}/labour-attendance`,
    projectLabourCost: (projectId: string | number) =>
      `/api/hrms/projects/${projectId}/labour-cost`,
    timesheets: "/api/hrms/timesheets",
    timesheetReview: (id: string | number) =>
      `/api/hrms/timesheets/${id}/review`,
    projectTimesheets: "/api/hrms/timesheets",
    projectTimesheetReview: (id: string | number) =>
      `/api/hrms/timesheets/${id}/review`,

    // Rosters & Deductions
    rosters: "/api/hrms/rosters",
    deductionRules: "/api/hrms/deduction-rules",
    deductionRule: (id: string | number) => `/api/hrms/deduction-rules/${id}`,

    // Payroll
    payroll: "/api/hrms/payroll",
    payrollDetail: (id: string | number) => `/api/hrms/payroll/${id}`,
    payrollApprove: (id: string | number) =>
      `/api/hrms/payroll/${id}/approve`,
    payrollDelete: (id: string | number) =>
      `/api/hrms/payroll/${id}/delete`,
    payrollBankAdvice: (id: string | number) =>
      `/api/hrms/payroll/${id}/bank-advice`,
    payrollPayAll: (id: string | number) =>
      `/api/hrms/payroll/${id}/pay-all`,
    payslip: (itemId: string | number) => `/api/hrms/payslips/${itemId}`,
    payslipPdf: (itemId: string | number) =>
      `/api/hrms/payslips/${itemId}/pdf`,
    payslipPayment: (itemId: string | number) =>
      `/api/hrms/payslips/${itemId}/payments`,
    paymentReverse: (paymentId: string | number) =>
      `/api/hrms/payments/${paymentId}/reverse`,

    // Payroll adjustments & loans
    payrollAdjustments: "/api/hrms/payroll-adjustments",
    loans: "/api/hrms/loans",

    // Exits & settlements
    exits: "/api/hrms/exits",
    exitReview: (id: string | number) => `/api/hrms/exits/${id}/review`,
    exitSettlementRecompute: (id: string | number) =>
      `/api/hrms/exits/${id}/settlement/recompute`,
    exitSettlementFinalize: (id: string | number) =>
      `/api/hrms/exits/${id}/settlement/finalize`,
    exitCancel: (id: string | number) => `/api/hrms/exits/${id}/cancel`,

    // Analytics & automation
    analytics: "/api/hrms/analytics",
    automationRuns: "/api/hrms/automation/runs",
    automationRun: "/api/hrms/automation/run",
  },
} as const;

