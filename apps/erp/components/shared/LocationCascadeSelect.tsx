"use client";

type LocationSelectProps = {
  countryId?: string | number | null;
  stateId?: string | number | null;
  cityId?: string | number | null;
  onCountryChange: (id: string) => void;
  onStateChange: (id: string) => void;
  onCityChange: (id: string) => void;
};

// Safe Location dataset (using `fb_` prefix to keep FK constraints intact)
const COUNTRIES = [
  { id: "fb_1", name: "India" },
  { id: "fb_2", name: "United States" },
  { id: "fb_3", name: "United Arab Emirates" },
  { id: "fb_4", name: "United Kingdom" },
  { id: "fb_5", name: "Singapore" },
];

const STATES: Record<string, Array<{ id: string; name: string }>> = {
  "fb_1": [
    { id: "fb_101", name: "Maharashtra" },
    { id: "fb_102", name: "Gujarat" },
    { id: "fb_103", name: "Delhi" },
    { id: "fb_104", name: "Karnataka" },
    { id: "fb_105", name: "Haryana" },
    { id: "fb_106", name: "West Bengal" },
    { id: "fb_107", name: "Tamil Nadu" },
  ],
  "fb_2": [
    { id: "fb_201", name: "California" },
    { id: "fb_202", name: "Texas" },
    { id: "fb_203", name: "New York" },
  ],
  "fb_3": [
    { id: "fb_301", name: "Dubai" },
    { id: "fb_302", name: "Abu Dhabi" },
  ],
};

const CITIES: Record<string, Array<{ id: string; name: string }>> = {
  "fb_101": [
    { id: "fb_1001", name: "Mumbai" },
    { id: "fb_1002", name: "Pune" },
    { id: "fb_1003", name: "Thane" },
    { id: "fb_1004", name: "Nagpur" },
  ],
  "fb_102": [
    { id: "fb_1005", name: "Ahmedabad" },
    { id: "fb_1006", name: "Surat" },
    { id: "fb_1007", name: "Vadodara" },
  ],
  "fb_103": [
    { id: "fb_1008", name: "New Delhi" },
  ],
  "fb_104": [
    { id: "fb_1009", name: "Bengaluru" },
  ],
  "fb_105": [
    { id: "fb_1010", name: "Gurugram" },
    { id: "fb_1011", name: "Faridabad" },
  ],
};

export function LocationCascadeSelect({
  countryId,
  stateId,
  cityId,
  onCountryChange,
  onStateChange,
  onCityChange,
}: LocationSelectProps) {
  const currentCountry = countryId ? String(countryId) : "";
  const currentState = stateId ? String(stateId) : "";
  const currentCity = cityId ? String(cityId) : "";

  const availableStates = currentCountry
    ? STATES[currentCountry] || STATES["fb_1"] || []
    : [];

  const availableCities = currentState
    ? CITIES[currentState] || CITIES["fb_101"] || []
    : [];

  return (
    <>
      <label className="altrex-field">
        <span>Country</span>
        <select
          className="altrex-input altrex-select"
          value={currentCountry}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onStateChange("");
            onCityChange("");
          }}
        >
          <option value="">Select country...</option>
          {COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="altrex-field">
        <span>State</span>
        <select
          className="altrex-input altrex-select"
          value={currentState}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange("");
          }}
          disabled={!currentCountry}
        >
          <option value="">
            {!currentCountry ? "Select country first..." : "Select state..."}
          </option>
          {availableStates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <label className="altrex-field">
        <span>City</span>
        <select
          className="altrex-input altrex-select"
          value={currentCity}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!currentState}
        >
          <option value="">
            {!currentState ? "Select state first..." : "Select city..."}
          </option>
          {availableCities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
