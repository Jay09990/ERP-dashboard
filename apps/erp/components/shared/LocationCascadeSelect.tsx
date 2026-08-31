"use client";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

type LocationSelectProps = {
  countryId?: string | number | null;
  stateId?: string | number | null;
  cityId?: string | number | null;
  onCountryChange: (id: string) => void;
  onStateChange: (id: string) => void;
  onCityChange: (id: string) => void;
};

export function LocationCascadeSelect({
  countryId,
  stateId,
  cityId,
  onCountryChange,
  onStateChange,
  onCityChange,
}: LocationSelectProps) {
  // Fetch Countries
  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const data = await apiClient.get<{ data: any[] } | any[]>(
        endpoints.masters.country,
      );
      return Array.isArray(data) ? data : (data as any).data || [];
    },
  });

  // Fetch States (dependent on Country)
  const { data: states = [] } = useQuery({
    queryKey: ["states", countryId],
    queryFn: async () => {
      if (!countryId) return [];
      const data = await apiClient.get<{ data: any[] } | any[]>(
        endpoints.masters.state,
        { country_id: countryId },
      );
      return Array.isArray(data) ? data : (data as any).data || [];
    },
    enabled: !!countryId,
  });

  // Fetch Cities (dependent on State)
  const { data: cities = [] } = useQuery({
    queryKey: ["cities", stateId],
    queryFn: async () => {
      if (!stateId) return [];
      const data = await apiClient.get<{ data: any[] } | any[]>(
        endpoints.masters.city,
        { state_id: stateId },
      );
      return Array.isArray(data) ? data : (data as any).data || [];
    },
    enabled: !!stateId,
  });

  return (
    <>
      <label className="altrex-field">
        <span>Country</span>
        <select
          className="altrex-input altrex-select"
          value={countryId ?? ""}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onStateChange("");
            onCityChange("");
          }}
        >
          <option value="">Select country...</option>
          {countries.map((c: any) => (
            <option key={c.id ?? c.country_id} value={c.id ?? c.country_id}>
              {c.name ?? c.country_name}
            </option>
          ))}
        </select>
      </label>

      <label className="altrex-field">
        <span>State</span>
        <select
          className="altrex-input altrex-select"
          value={stateId ?? ""}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange("");
          }}
          disabled={!countryId}
        >
          <option value="">Select state...</option>
          {states.map((s: any) => (
            <option key={s.id ?? s.state_id} value={s.id ?? s.state_id}>
              {s.name ?? s.state_name}
            </option>
          ))}
        </select>
      </label>

      <label className="altrex-field">
        <span>City</span>
        <select
          className="altrex-input altrex-select"
          value={cityId ?? ""}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!stateId}
        >
          <option value="">Select city...</option>
          {cities.map((c: any) => (
            <option key={c.id ?? c.city_id} value={c.id ?? c.city_id}>
              {c.name ?? c.city_name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
