import { PartyFormValues, PartyAddressFormValues, PartyContactPersonFormValues } from "./schema";

export type PartyType = "customer" | "vendor";

export interface PartyAddress extends PartyAddressFormValues {
  id?: string | number;
  country_name?: string;
  state_name?: string;
  city_name?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface PartyContactPerson extends PartyContactPersonFormValues {
  id?: string | number;
  designation?: string;
}

export interface PartyRecord {
  id: string | number;
  party_id?: string | number;
  party_type?: PartyType;
  party_name: string;
  phone: string;
  email?: string;
  gst_no?: string;
  pan_no?: string;
  website?: string;
  contact_name?: string;
  notes?: string;
  opening_balance?: string | number;
  currency_id?: string | number;
  currency_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  addresses?: PartyAddress[];
  contactPersons?: PartyContactPerson[];
  tbl_party_addresses?: PartyAddress[];
  tbl_party_contact_person?: PartyContactPerson[];
}
