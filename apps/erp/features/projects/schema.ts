export type ProjectStatus =
  | "planning"
  | "approved"
  | "in_progress"
  | "on_hold"
  | "delayed"
  | "completed"
  | "closed"
  | "cancelled";

export interface Project {
  project_id?: number;
  id?: number;
  project_code?: string;
  project_name: string;
  party_id?: number | null;
  party_name?: string;
  quotation_id?: number | null;
  sales_order_id?: number | null;
  contract_no?: string;
  customer_po_no?: string;
  customer_po_date?: string;
  project_type?: string;
  project_location?: string;
  site_address?: string;
  project_manager_id?: number | null;
  project_engineer_id?: number | null;
  start_date?: string;
  planned_end_date?: string;
  actual_end_date?: string | null;
  currency_id?: number | null;
  contract_value?: number;
  estimated_cost?: number;
  actual_cost?: number;
  progress_percent?: number;
  description?: string;
  terms_conditions?: string;
  notes?: string;
  status: ProjectStatus | string;
}

export interface ProjectSite {
  site_id?: number;
  id?: number;
  site_name: string;
  address_line1?: string;
  city_id?: number | null;
  state_id?: number | null;
  country_id?: number | null;
  pincode?: string;
  contact_person?: string;
  contact_phone?: string;
}

export interface ProjectBoqItem {
  boq_item_id?: number;
  id?: number;
  boq_type: "material" | "service" | "labour" | string;
  item_id?: number | null;
  description: string;
  quantity: number;
  unit_id?: number | null;
  unit_rate: number;
  consumed_quantity?: number;
}

export interface ProjectCost {
  project_cost_id?: number;
  id?: number;
  category:
    | "material"
    | "labour"
    | "equipment"
    | "subcontract"
    | "other"
    | string;
  budget_amount: number;
  actual_amount?: number;
  remarks?: string;
}

export interface ProjectMilestone {
  milestone_id?: number;
  id?: number;
  milestone_name: string;
  due_date?: string;
  completion_date?: string | null;
  payment_percent?: number;
  payment_amount?: number;
  sort_order?: number;
  status?: "pending" | "in_progress" | "completed" | "invoiced" | string;
  remarks?: string;
}

export interface ProjectTask {
  task_id?: number;
  id?: number;
  site_id?: number | null;
  task_name: string;
  assigned_to?: number | null;
  start_date?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high" | string;
  progress_percent?: number;
  status?: "pending" | "in_progress" | "completed" | string;
  remarks?: string;
}

export interface DailyProgressReport {
  dpr_id?: number;
  id?: number;
  site_id?: number | null;
  report_date: string;
  weather?: string;
  manpower_count?: number;
  equipment_used?: string;
  work_completed?: string;
  material_used?: string;
  material_shortage?: string;
  work_planned_next?: string;
  progress_percent?: number;
  issues?: string;
  safety_issues?: string;
  client_instructions?: string;
  remarks?: string;
}

export interface ProjectDocument {
  document_id?: number;
  id?: number;
  site_id?: number | null;
  document_name?: string;
  document_type?: string;
  file_url?: string;
  description?: string;
  uploaded_at?: string;
}

export interface ProjectFinancials {
  project_id: number;
  project_code?: string;
  contract_value?: number;
  estimated_cost?: number;
  actual_cost?: number;
  cost_variance?: number;
  billed_amount?: number;
  received_amount?: number;
  outstanding_amount?: number;
  expected_profit?: number;
  current_profit?: number;
  progress_percent?: number;
}

export interface RequisitionItem {
  item_id: number;
  description?: string;
  quantity: number;
  unit_id?: number | null;
  notes?: string;
}

export interface PurchaseRequisition {
  requisition_id?: number;
  id?: number;
  requisition_no?: string;
  project_id?: number;
  project_name?: string;
  requisition_date?: string;
  required_by?: string;
  status?: string;
  notes?: string;
  itemsDetails?: RequisitionItem[];
}

export interface GrnItem {
  purchase_order_item_id?: number | null;
  item_id: number;
  batch_id?: number | null;
  quantity: number;
  unit_id?: number | null;
  rate?: number;
}

export interface GoodsReceipt {
  grn_id?: number;
  id?: number;
  grn_no?: string;
  purchase_order_id?: number;
  warehouse_id?: number;
  warehouse_name?: string;
  grn_date?: string;
  status?: string;
  notes?: string;
  itemsDetails?: GrnItem[];
}

export interface SiteIssueItem {
  item_id: number;
  batch_id?: number | null;
  quantity: number;
  unit_id?: number | null;
  boq_item_id?: number | null;
}

export interface SiteIssue {
  issue_id?: number;
  id?: number;
  issue_no?: string;
  project_id?: number;
  project_name?: string;
  site_id?: number;
  warehouse_id?: number;
  issue_date?: string;
  status?: string;
  notes?: string;
  itemsDetails?: SiteIssueItem[];
}
