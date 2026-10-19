export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "lost"
  | "converted";

export interface Lead {
  lead_id?: number;
  company_name: string;
  contact_name: string;
  designation?: string;
  phone?: string;
  email?: string;
  website?: string;
  gst_no?: string;
  industry_id?: number | null;
  lead_source_id?: number | null;
  referred_by?: string;
  rating?: "cold" | "warm" | "hot" | string;
  estimated_value?: number;
  next_follow_up_date?: string;
  status: LeadStatus;
  notes?: string;
  party_id?: number | null;
}

export interface LeadActivity {
  activity_id?: number;
  activity_type: string;
  activity_date: string;
  subject: string;
  outcome?: string;
  next_follow_up_date?: string;
}

export interface NamedCrmRecord {
  id?: number;
  lead_source_id?: number;
  industry_id?: number;
  source_name?: string;
  industry_name?: string;
}

export type EnquiryStatus =
  | "new"
  | "under_review"
  | "site_visit"
  | "estimating"
  | "quoted"
  | "negotiation"
  | "won"
  | "lost"
  | "on_hold"
  | "no_bid"
  | "cancelled";

export interface Enquiry {
  enquiry_id?: number;
  id?: number;
  lead_id?: number | null;
  party_id?: number | null;
  enquiry_date: string;
  enquiry_title: string;
  project_type?: string;
  customer_ref_no?: string;
  plant_name?: string;
  project_location?: string;
  site_address?: string;
  scope_of_work?: string;
  is_tender?: boolean;
  tender_no?: string;
  submission_due_date?: string;
  prebid_meeting_date?: string;
  emd_amount?: number;
  site_visit_required?: boolean;
  site_visit_date?: string;
  expected_start_date?: string;
  expected_end_date?: string;
  currency_id?: number | null;
  estimated_value?: number;
  priority?: "low" | "medium" | "high" | string;
  assigned_to?: number | null;
  estimator_id?: number | null;
  next_follow_up_date?: string;
  notes?: string;
  status?: EnquiryStatus | string;
  lost_reason?: string;
  competitor_name?: string;
}

export interface EnquiryActivity {
  activity_id?: number;
  id?: number;
  activity_type: string;
  activity_date: string;
  subject: string;
  outcome?: string;
  next_follow_up_date?: string;
}

export interface EnquiryDocument {
  document_id?: number;
  id?: number;
  document_type: string;
  document_name: string;
  file_url: string;
  remarks?: string;
}

