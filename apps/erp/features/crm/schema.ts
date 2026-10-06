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
