export interface Address {
  address_id?: number;
  address_type: "billing" | "shipping" | "both";
  address_label: string;
  attention_to: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city_id: number;
  state_id: number;
  country_id: number;
  pincode: string;
}

export interface ContactPerson {
  person_id?: number;
  name: string;
  email: string;
  phone: string;
}

export interface Party {
  id?: number;
  party_name: string;
  party_type: "customer" | "vendor";
  phone: string;
  email: string;
  gst_no?: string;
  pan_no?: string;
  address?: string;
  is_delete?: boolean;
  status?: "active" | "inactive";
  addresses: Address[];
  contactPersons: ContactPerson[];
}

export type PartyType = "customer" | "vendor";