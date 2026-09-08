"use client";

import { cityApi, countryApi, stateApi } from "@/features/masters/api";

type LocationSelectProps = {
  countryId?: string | number | null;
  stateId?: string | number | null;
  cityId?: string | number | null;
  onCountryChange: (id: string) => void;
  onStateChange: (id: string) => void;
  onCityChange: (id: string) => void;
};

type MasterRecord = Record<string, unknown>;

/** Extracts the list payloads returned by the backend's master endpoints. */
function extractRecords(value: unknown): MasterRecord[] {
  if (Array.isArray(value)) return value as MasterRecord[];
  if (!value || typeof value !== "object") return [];

  for (const nested of Object.values(value as MasterRecord)) {
    const records = extractRecords(nested);
    if (records.length) return records;
  }

  return [];
}

function toId(value: unknown) {
  return value == null ? "" : String(value);
}

/** Renders API-backed country, state, and city selectors for address forms. */
export function LocationCascadeSelect({ countryId, stateId, cityId, onCountryChange, onStateChange, onCityChange }: LocationSelectProps) {
  const { data: countriesData, isLoading: areCountriesLoading } = countryApi.useList();
  const { data: statesData, isLoading: areStatesLoading } = stateApi.useList();
  const { data: citiesData, isLoading: areCitiesLoading } = cityApi.useList();
  const currentCountry = toId(countryId);
  const currentState = toId(stateId);
  const currentCity = toId(cityId);
  const countries = extractRecords(countriesData);
  const states = extractRecords(statesData).filter((state) => toId(state.country_id) === currentCountry);
  const cities = extractRecords(citiesData).filter((city) => toId(city.state_id) === currentState);

  return <>
    <label className="altrex-field">
      <span>Country</span>
      <select className="altrex-input altrex-select" value={currentCountry} onChange={(event) => { onCountryChange(event.target.value); onStateChange(""); onCityChange(""); }} disabled={areCountriesLoading}>
        <option value="">{areCountriesLoading ? "Loading countries..." : "Select country..."}</option>
        {countries.map((country) => <option key={toId(country.country_id ?? country.id)} value={toId(country.country_id ?? country.id)}>{String(country.country_name ?? country.name ?? "Unnamed country")}</option>)}
      </select>
    </label>
    <label className="altrex-field">
      <span>State</span>
      <select className="altrex-input altrex-select" value={currentState} onChange={(event) => { onStateChange(event.target.value); onCityChange(""); }} disabled={!currentCountry || areStatesLoading}>
        <option value="">{!currentCountry ? "Select country first..." : areStatesLoading ? "Loading states..." : "Select state..."}</option>
        {states.map((state) => <option key={toId(state.state_id ?? state.id)} value={toId(state.state_id ?? state.id)}>{String(state.state_name ?? state.name ?? "Unnamed state")}</option>)}
      </select>
    </label>
    <label className="altrex-field">
      <span>City</span>
      <select className="altrex-input altrex-select" value={currentCity} onChange={(event) => onCityChange(event.target.value)} disabled={!currentState || areCitiesLoading}>
        <option value="">{!currentState ? "Select state first..." : areCitiesLoading ? "Loading cities..." : "Select city..."}</option>
        {cities.map((city) => <option key={toId(city.city_id ?? city.id)} value={toId(city.city_id ?? city.id)}>{String(city.city_name ?? city.name ?? "Unnamed city")}</option>)}
      </select>
    </label>
  </>;
}
