/**
 * Development-only project and procurement fixtures shaped for the ERP screens.
 * IDs link the demo records together; they do not create records in the external API.
 */
import type {
  DailyProgressReport,
  GoodsReceipt,
  Project,
  ProjectBoqItem,
  ProjectCost,
  ProjectDocument,
  ProjectFinancials,
  ProjectMilestone,
  ProjectSite,
  ProjectTask,
  PurchaseRequisition,
  SiteIssue,
} from "../schema";

const demoCustomerId = 101;
const demoProjectId = 1001;
const demoSiteId = 1101;
const demoWarehouseId = 201;
const demoItemIds = { steel: 301, cement: 302, labour: 303 } as const;

export const projectSeed: Project[] = [
  {
    project_id: demoProjectId,
    project_code: "PRJ-2026-001",
    project_name: "Ahmedabad Industrial Plant Installation",
    party_id: demoCustomerId,
    party_name: "Aarav Industrial Systems",
    quotation_id: 401,
    sales_order_id: 501,
    contract_no: "CNT-2026-001",
    customer_po_no: "PO-CUST-2026-001",
    customer_po_date: "2026-09-01",
    project_type: "mechanical",
    project_location: "Ahmedabad",
    site_address: "GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat",
    project_manager_id: 11,
    project_engineer_id: 12,
    start_date: "2026-09-10",
    planned_end_date: "2027-03-31",
    currency_id: 1,
    contract_value: 2500000,
    estimated_cost: 1850000,
    actual_cost: 620000,
    progress_percent: 32,
    description: "Mechanical installation and commissioning for a new production line.",
    terms_conditions: "Payments are due at the agreed project milestones.",
    notes: "Customer requests a weekly progress report.",
    status: "in_progress",
  },
  {
    project_id: 1002,
    project_code: "PRJ-2026-002",
    project_name: "Surat Warehouse Fire Protection Upgrade",
    party_id: 102,
    party_name: "Western Distribution Group",
    quotation_id: 402,
    contract_no: "CNT-2026-002",
    customer_po_no: "PO-CUST-2026-019",
    customer_po_date: "2026-09-25",
    project_type: "installation",
    project_location: "Surat",
    site_address: "Plot 24, Sachin GIDC, Surat, Gujarat",
    project_manager_id: 13,
    project_engineer_id: 14,
    start_date: "2026-10-12",
    planned_end_date: "2027-02-28",
    currency_id: 1,
    contract_value: 980000,
    estimated_cost: 710000,
    actual_cost: 0,
    progress_percent: 0,
    description: "Upgrade warehouse hydrant and sprinkler systems.",
    notes: "Awaiting site handover and approved drawings.",
    status: "planning",
  },
];

export const projectDetailSeed = {
  ...projectSeed[0],
  sites: [
    {
      site_id: demoSiteId,
      site_name: "Vatva Main Factory",
      address_line1: "GIDC Industrial Estate, Vatva",
      city_id: 10,
      state_id: 7,
      country_id: 1,
      pincode: "382445",
      contact_person: "Rajesh Patel",
      contact_phone: "9876500101",
    } satisfies ProjectSite,
  ],
  boqItems: [
    {
      boq_item_id: 1201,
      boq_type: "material",
      item_id: demoItemIds.steel,
      description: "MS structural steel",
      quantity: 500,
      unit_id: 1,
      unit_rate: 85,
      consumed_quantity: 160,
    },
    {
      boq_item_id: 1202,
      boq_type: "material",
      item_id: demoItemIds.cement,
      description: "OPC 53 grade cement",
      quantity: 300,
      unit_id: 2,
      unit_rate: 420,
      consumed_quantity: 80,
    },
    {
      boq_item_id: 1203,
      boq_type: "labour",
      item_id: null,
      description: "Mechanical installation labour",
      quantity: 100,
      unit_id: 3,
      unit_rate: 1200,
      consumed_quantity: 32,
    },
  ] satisfies ProjectBoqItem[],
  costBudget: [
    { category: "material", budget_amount: 1000000, actual_amount: 420000, remarks: "Steel, cement and fittings" },
    { category: "labour", budget_amount: 400000, actual_amount: 120000, remarks: "Installation crew" },
    { category: "equipment", budget_amount: 150000, actual_amount: 80000, remarks: "Crane and lifting equipment" },
    { category: "subcontract", budget_amount: 200000, actual_amount: 0, remarks: "Specialist electrical work" },
    { category: "other", budget_amount: 100000, actual_amount: 0, remarks: "Travel and site expenses" },
  ] satisfies ProjectCost[],
  milestones: [
    { milestone_id: 1301, milestone_name: "Material procurement", due_date: "2026-10-15", payment_percent: 20, payment_amount: 500000, sort_order: 1, status: "in_progress", remarks: "Critical materials arriving in phases." },
    { milestone_id: 1302, milestone_name: "Mechanical installation", due_date: "2027-01-15", payment_percent: 50, payment_amount: 1250000, sort_order: 2, status: "pending", remarks: "Complete installation and internal inspection." },
    { milestone_id: 1303, milestone_name: "Testing and commissioning", due_date: "2027-03-15", payment_percent: 30, payment_amount: 750000, sort_order: 3, status: "pending", remarks: "Final commissioning and handover." },
  ] satisfies ProjectMilestone[],
  tasks: [
    { task_id: 1401, site_id: demoSiteId, task_name: "Receive and inspect structural steel", assigned_to: 12, start_date: "2026-09-15", due_date: "2026-10-08", priority: "high", progress_percent: 80, status: "in_progress", remarks: "Inspect material certificates before installation." },
    { task_id: 1402, site_id: demoSiteId, task_name: "Install equipment support frames", assigned_to: 12, start_date: "2026-10-05", due_date: "2026-10-22", priority: "high", progress_percent: 15, status: "in_progress", remarks: "Coordinate crane access with the customer." },
    { task_id: 1403, site_id: demoSiteId, task_name: "Complete first progress inspection", assigned_to: 11, start_date: "2026-10-20", due_date: "2026-10-21", priority: "medium", progress_percent: 0, status: "pending", remarks: "Invite the customer project representative." },
  ] satisfies ProjectTask[],
  reports: [
    { dpr_id: 1501, site_id: demoSiteId, report_date: "2026-10-01", weather: "Clear", manpower_count: 18, equipment_used: "Mobile crane, welding sets", work_completed: "Installed 8 equipment support frames; completed incoming steel inspection.", material_used: "MS steel 2.4 tonnes, anchor bolts 64 pcs", material_shortage: "None", work_planned_next: "Continue frame installation and alignment.", progress_percent: 32, issues: "Crane access window limited to afternoon.", safety_issues: "No incidents; toolbox talk completed.", client_instructions: "Keep the east access lane clear.", remarks: "Work is on schedule." } satisfies DailyProgressReport,
  ],
  documents: [
    { document_id: 1601, site_id: demoSiteId, document_name: "Approved equipment layout", document_type: "Drawing", file_url: "/demo/project-files/approved-equipment-layout.pdf", description: "Customer approved layout, revision B.", uploaded_at: "2026-09-28T10:30:00+05:30" },
  ] satisfies ProjectDocument[],
};

export const projectFinancialsSeed: ProjectFinancials[] = [
  { project_id: demoProjectId, project_code: "PRJ-2026-001", contract_value: 2500000, estimated_cost: 1850000, actual_cost: 620000, cost_variance: -1230000, billed_amount: 500000, received_amount: 250000, outstanding_amount: 250000, expected_profit: 650000, current_profit: -120000, progress_percent: 32 },
  { project_id: 1002, project_code: "PRJ-2026-002", contract_value: 980000, estimated_cost: 710000, actual_cost: 0, cost_variance: -710000, billed_amount: 0, received_amount: 0, outstanding_amount: 0, expected_profit: 270000, current_profit: 0, progress_percent: 0 },
];

export const procurementSeed = {
  requisitions: [
    { requisition_id: 1701, requisition_no: "REQ-2026-014", project_id: demoProjectId, project_name: projectSeed[0].project_name, requisition_date: "2026-09-29", required_by: "2026-10-07", status: "approved", notes: "Second phase of material for frame installation.", itemsDetails: [{ item_id: demoItemIds.steel, description: "MS structural steel", quantity: 120, unit_id: 1, notes: "Cut lengths per approved drawing." }, { item_id: demoItemIds.cement, description: "OPC 53 grade cement", quantity: 60, unit_id: 2, notes: "Store in covered area." }] },
  ] satisfies PurchaseRequisition[],
  goodsReceipts: [
    { grn_id: 1801, grn_no: "GRN-2026-008", purchase_order_id: 601, warehouse_id: demoWarehouseId, warehouse_name: "Ahmedabad Central Warehouse", grn_date: "2026-09-30", status: "approved", notes: "Received and checked against purchase order.", itemsDetails: [{ purchase_order_item_id: 6101, item_id: demoItemIds.steel, batch_id: null, quantity: 80, unit_id: 1, rate: 82 }, { purchase_order_item_id: 6102, item_id: demoItemIds.cement, batch_id: null, quantity: 40, unit_id: 2, rate: 405 }] },
  ] satisfies GoodsReceipt[],
  siteIssues: [
    { issue_id: 1901, issue_no: "ISS-2026-006", project_id: demoProjectId, project_name: projectSeed[0].project_name, site_id: demoSiteId, warehouse_id: demoWarehouseId, issue_date: "2026-10-01", status: "approved", notes: "Materials issued for support frame installation.", itemsDetails: [{ item_id: demoItemIds.steel, batch_id: null, quantity: 30, unit_id: 1, boq_item_id: 1201 }, { item_id: demoItemIds.cement, batch_id: null, quantity: 20, unit_id: 2, boq_item_id: 1202 }] },
  ] satisfies SiteIssue[],
};
