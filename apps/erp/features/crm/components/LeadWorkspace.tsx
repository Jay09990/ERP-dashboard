"use client";

import { permissions } from "@/config/permissions";
import { crmApi } from "@/features/crm/api";
import type { Lead, LeadActivity, NamedCrmRecord } from "@/features/crm/schema";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { sessionHasPermission } from "@/lib/auth/permissions";
import { useSessionStore } from "@/stores/session-store";
import { Button } from "@altrex/ui";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

type FormField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "select"
    | "date"
    | "datetime-local"
    | "email"
    | "url"
    | "textarea";
  valueType?: "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
};
type Tab = "leads" | "follow-ups" | "sources" | "industries";

const leadFields: FormField[] = [
  { name: "company_name", label: "Company name", required: true },
  { name: "contact_name", label: "Contact person", required: true },
  { name: "designation", label: "Job title" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
  { name: "website", label: "Website", type: "url" },
  { name: "gst_no", label: "GST number" },
  {
    name: "industry_id",
    label: "Industry",
    type: "select",
    valueType: "number",
    placeholder: "Select industry",
  },
  {
    name: "lead_source_id",
    label: "Lead source",
    type: "select",
    valueType: "number",
    placeholder: "Select lead source",
  },
  { name: "referred_by", label: "Referred by" },
  { name: "address_line1", label: "Address" },
  { name: "address_line2", label: "Address line 2" },
  {
    name: "city_id",
    label: "City",
    type: "select",
    valueType: "number",
    placeholder: "Select city",
  },
  {
    name: "state_id",
    label: "State",
    type: "select",
    valueType: "number",
    placeholder: "Select state",
  },
  {
    name: "country_id",
    label: "Country",
    type: "select",
    valueType: "number",
    placeholder: "Select country",
  },
  { name: "pincode", label: "Postal code" },
  {
    name: "assigned_to",
    label: "Assigned user",
    type: "select",
    valueType: "number",
    placeholder: "Select user",
  },
  {
    name: "rating",
    label: "Lead rating",
    type: "select",
    placeholder: "Select rating",
    options: [
      { value: "cold", label: "Cold" },
      { value: "warm", label: "Warm" },
      { value: "hot", label: "Hot" },
    ],
  },
  { name: "estimated_value", label: "Estimated value", type: "number" },
  { name: "next_follow_up_date", label: "Next follow-up", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

const activityFields: FormField[] = [
  { name: "activity_type", label: "Activity type", required: true },
  {
    name: "activity_date",
    label: "When",
    type: "datetime-local",
    required: true,
  },
  { name: "subject", label: "Subject", required: true },
  { name: "outcome", label: "What happened", type: "textarea" },
  { name: "next_follow_up_date", label: "Next follow-up", type: "date" },
];

function records<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];
  const object = data as Record<string, unknown>;
  const normalizeKey = (key: string) =>
    key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  for (const key of [
    "data",
    "leads",
    "lead",
    "records",
    "rows",
    "followUps",
    "follow_ups",
    "activities",
    "lead_sources",
    "lead_source",
    "industries",
    "industry",
    "users",
    "cities",
    "city",
    "states",
    "state",
    "countries",
    "country",
    "result",
  ]) {
    const matchedKey = Object.keys(object).find(
      (recordKey) => normalizeKey(recordKey) === normalizeKey(key),
    );
    if (!matchedKey) continue;
    if (Array.isArray(object[matchedKey])) return object[matchedKey] as T[];
    if (object[matchedKey] && typeof object[matchedKey] === "object") {
      const nested = records<T>(object[matchedKey]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function recordValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  const normalizedKeys = new Set(
    keys.map((key) => key.replace(/[^a-z0-9]/gi, "").toLowerCase()),
  );
  const matchingKey = Object.keys(record).find((key) =>
    normalizedKeys.has(key.replace(/[^a-z0-9]/gi, "").toLowerCase()),
  );
  return matchingKey ? record[matchingKey] : undefined;
}

function referenceOptions(
  data: unknown,
  idKeys: string[],
  labelKeys: string[],
) {
  return records<Record<string, unknown>>(data).flatMap((record) => {
    const id = recordValue(record, idKeys);
    if ((typeof id !== "number" && typeof id !== "string") || !String(id)) {
      return [];
    }
    const label = recordValue(record, labelKeys);
    const firstName = recordValue(record, ["first_name", "firstName"]);
    const lastName = recordValue(record, ["last_name", "lastName"]);
    const fullName = [firstName, lastName]
      .filter(
        (name): name is string =>
          typeof name === "string" && name.trim().length > 0,
      )
      .join(" ");
    return [
      {
        value: String(id),
        label:
          (typeof label === "number" || typeof label === "string") && label
            ? String(label)
            : fullName || `#${String(id)}`,
      },
    ];
  });
}

function FormDialog({
  title,
  fields,
  initial,
  pending,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: FormField[];
  initial?: Record<string, unknown>;
  pending: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        initial?.[field.name] == null ? "" : String(initial[field.name]),
      ]),
    ),
  );
  const [error, setError] = useState("");
  return (
    <div
      className="altrex-dialog-backdrop crm-lead-dialog-backdrop"
      onMouseDown={onClose}
    >
      <dialog
        open
        className="altrex-dialog altrex-dialog-lg crm-lead-dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="altrex-dialog-header">
          <h2 className="altrex-dialog-title">{title}</h2>
          <button
            className="altrex-icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <form
          className="crm-lead-form"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const payload: Record<string, unknown> = {};
              for (const field of fields) {
                const value = values[field.name]?.trim() ?? "";
                if (field.required && !value)
                  throw new Error(`${field.label} is required.`);
                if (!value) continue;
                if (field.type === "number" || field.valueType === "number") {
                  const number = Number(value);
                  if (!Number.isFinite(number))
                    throw new Error(`${field.label} must be a number.`);
                  payload[field.name] = number;
                } else payload[field.name] = value;
              }
              onSubmit(payload);
            } catch (cause) {
              setError(
                cause instanceof Error ? cause.message : "Check the form.",
              );
            }
          }}
        >
          <div className="altrex-dialog-body crm-lead-form-grid">
            {fields.map((field) => (
              <label
                className="altrex-field"
                key={field.name}
                htmlFor={`crm-${field.name}`}
                style={{
                  gridColumn: field.type === "textarea" ? "1 / -1" : undefined,
                }}
              >
                <span>
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                {field.type === "textarea" ? (
                  <textarea
                    id={`crm-${field.name}`}
                    className="altrex-input"
                    rows={3}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                ) : field.type === "select" ? (
                  <select
                    id={`crm-${field.name}`}
                    className="altrex-input"
                    required={field.required}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      {field.placeholder ?? "Select an option"}
                    </option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`crm-${field.name}`}
                    className="altrex-input"
                    type={field.type ?? "text"}
                    required={field.required}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
            {error && (
              <p className="crm-lead-form-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <footer className="altrex-dialog-footer">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}

const dateTimeFormatShort = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
});
const dateTimeFormatFull = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function friendlyDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return value.includes("T")
    ? dateTimeFormatFull.format(date)
    : dateTimeFormatShort.format(date);
}

const LEAD_STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ["contacted", "qualified", "lost"],
  contacted: ["qualified", "lost"],
  qualified: ["contacted", "lost"],
  lost: ["new"],
  converted: [],
};

function titleCase(value: string | undefined) {
  return (value ?? "—")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CrmError({ error }: { error: unknown }) {
  if (!error) return null;
  const value = error as {
    message?: unknown;
    response?: { data?: { message?: unknown } };
  };
  const message = value.response?.data?.message ?? value.message;
  return (
    <div role="alert" className="altrex-table-state-error">
      {typeof message === "string"
        ? message
        : "The request failed. Please try again."}
    </div>
  );
}

export function LeadWorkspace() {
  const session = useSessionStore((state) => state.session);
  const hasPermission = useCallback(
    (permission: string) =>
      !session ||
      sessionHasPermission(session.permissions, permission, session.isSuperAdmin),
    [session],
  );
  const [tab, setTab] = useState<Tab>("leads");
  const [dialog, setDialog] = useState<
    "lead" | "activity" | "source" | "industry" | null
  >(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [activeLead, setActiveLead] = useState<number | null>(null);
  const [followUpScope, setFollowUpScope] = useState("due");
  const usersQuery = useQuery({
    queryKey: ["crm", "lead-reference", "users"],
    queryFn: () => apiClient.get<unknown>(endpoints.auth.users),
    enabled: dialog === "lead",
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      referenceOptions(data, ["user_id", "id"], [
        "full_name",
        "fullName",
        "name",
      ]),
  });
  const citiesQuery = useQuery({
    queryKey: ["crm", "lead-reference", "cities"],
    queryFn: () => apiClient.get<unknown>(endpoints.masters.city),
    enabled: dialog === "lead",
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      referenceOptions(data, ["city_id", "id"], ["city_name", "name"]),
  });
  const statesQuery = useQuery({
    queryKey: ["crm", "lead-reference", "states"],
    queryFn: () => apiClient.get<unknown>(endpoints.masters.state),
    enabled: dialog === "lead",
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      referenceOptions(data, ["state_id", "id"], ["state_name", "name"]),
  });
  const countriesQuery = useQuery({
    queryKey: ["crm", "lead-reference", "countries"],
    queryFn: () => apiClient.get<unknown>(endpoints.masters.country),
    enabled: dialog === "lead",
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      referenceOptions(data, ["country_id", "id"], ["country_name", "name"]),
  });
  const leadsQuery = crmApi.useLeads(hasPermission(permissions.leadsRead));
  const sourcesQuery = crmApi.useLeadSources(
    hasPermission(permissions.leadSourcesRead),
  );
  const industriesQuery = crmApi.useIndustries(
    hasPermission(permissions.industriesRead),
  );
  const followUpsQuery = crmApi.useFollowUps(
    followUpScope,
    hasPermission(permissions.followUpsRead),
  );
  const activitiesQuery = crmApi.useActivities(
    activeLead,
    hasPermission(permissions.leadActivitiesRead),
  );
  const createLead = crmApi.useCreateLead();
  const updateLead = crmApi.useUpdateLead();
  const deleteLead = crmApi.useDeleteLead();
  const changeStatus = crmApi.useChangeLeadStatus();
  const convertLead = crmApi.useConvertLead();
  const createActivity = crmApi.useCreateActivity();
  const createSource = crmApi.useCreateLeadSource();
  const createIndustry = crmApi.useCreateIndustry();
  const leads = useMemo(
    () => records<Lead>(leadsQuery.data),
    [leadsQuery.data],
  );
  const followUps = useMemo(
    () => records<Lead>(followUpsQuery.data),
    [followUpsQuery.data],
  );
  const activities = useMemo(
    () => records<LeadActivity>(activitiesQuery.data),
    [activitiesQuery.data],
  );
  const sources = useMemo(
    () => records<NamedCrmRecord>(sourcesQuery.data),
    [sourcesQuery.data],
  );
  const industries = useMemo(
    () => records<NamedCrmRecord>(industriesQuery.data),
    [industriesQuery.data],
  );
  const close = () => {
    setDialog(null);
    setEditing(null);
  };
  const submit = (values: Record<string, unknown>) => {
    if (dialog === "lead") {
      if (editing?.lead_id)
        updateLead.mutate(
          { id: editing.lead_id, body: values as Partial<Lead> },
          { onSuccess: close },
        );
      else
        createLead.mutate({ ...values, status: "new" } as Partial<Lead>, {
          onSuccess: close,
        });
    } else if (dialog === "activity" && activeLead != null)
      createActivity.mutate(
        { id: activeLead, body: values as Partial<LeadActivity> },
        { onSuccess: close },
      );
    else if (dialog === "source")
      createSource.mutate(values as { source_name: string }, {
        onSuccess: close,
      });
    else if (dialog === "industry")
      createIndustry.mutate(values as { industry_name: string }, {
        onSuccess: close,
      });
  };
  const busy =
    createLead.isPending ||
    updateLead.isPending ||
    createActivity.isPending ||
    createSource.isPending ||
    createIndustry.isPending;
  const error =
    leadsQuery.error ||
    followUpsQuery.error ||
    sourcesQuery.error ||
    industriesQuery.error ||
    usersQuery.error ||
    citiesQuery.error ||
    statesQuery.error ||
    countriesQuery.error ||
    createLead.error ||
    updateLead.error ||
    deleteLead.error ||
    changeStatus.error ||
    convertLead.error ||
    createActivity.error ||
    createSource.error ||
    createIndustry.error;
  const leadOptions: Record<string, { value: string; label: string }[]> = {
    industry_id: referenceOptions(
      industries,
      ["industry_id", "id"],
      ["industry_name", "name"],
    ),
    lead_source_id: referenceOptions(
      sources,
      ["lead_source_id", "id"],
      ["source_name", "name"],
    ),
    city_id: citiesQuery.data ?? [],
    state_id: statesQuery.data ?? [],
    country_id: countriesQuery.data ?? [],
    assigned_to: usersQuery.data ?? [],
  };
  const emptyOptionLabels: Record<string, string> = {
    industry_id: !hasPermission(permissions.industriesRead)
      ? "Industry list access is required"
      : industriesQuery.isError
        ? "Unable to load industries"
      : industriesQuery.isLoading
        ? "Loading industries..."
        : "No industries available",
    lead_source_id: !hasPermission(permissions.leadSourcesRead)
      ? "Lead source list access is required"
      : sourcesQuery.isError
        ? "Unable to load lead sources"
      : sourcesQuery.isLoading
        ? "Loading lead sources..."
        : "No lead sources available",
    city_id: citiesQuery.isError
      ? "Unable to load cities"
      : citiesQuery.isLoading
        ? "Loading cities..."
        : "No cities available",
    state_id: statesQuery.isError
      ? "Unable to load states"
      : statesQuery.isLoading
        ? "Loading states..."
        : "No states available",
    country_id: countriesQuery.isError
      ? "Unable to load countries"
      : countriesQuery.isLoading
        ? "Loading countries..."
        : "No countries available",
    assigned_to: usersQuery.isError
      ? "Unable to load users"
      : usersQuery.isLoading
        ? "Loading users..."
        : "No users available",
  };
  const formFields =
    dialog === "lead"
      ? leadFields.map((field) => {
          const options = field.options ?? leadOptions[field.name];
          if (!options) return field;
          const currentValue = editing?.[field.name as keyof Lead];
          const currentOption =
            currentValue == null
              ? null
              : { value: String(currentValue), label: `#${currentValue}` };
          return {
            ...field,
            placeholder:
              options.length === 0
                ? (emptyOptionLabels[field.name] ?? field.placeholder)
                : field.placeholder,
            options:
              currentOption &&
              !options.some((option) => option.value === currentOption.value)
                ? [...options, currentOption]
                : options,
          };
        })
      : dialog === "activity"
        ? activityFields
        : [
            {
              name: dialog === "source" ? "source_name" : "industry_name",
              label: dialog === "source" ? "Source name" : "Industry name",
              required: true,
            },
          ];
  const visibleRecords =
    tab === "leads"
      ? leads
      : tab === "follow-ups"
        ? followUps
        : tab === "sources"
          ? sources
          : industries;
  const tabs = useMemo(
    () =>
      (["leads", "follow-ups", "sources", "industries"] as Tab[]).filter(
        (value) =>
          hasPermission(
            value === "leads"
              ? permissions.leadsRead
              : value === "follow-ups"
                ? permissions.followUpsRead
                : value === "sources"
                  ? permissions.leadSourcesRead
                  : permissions.industriesRead,
          ),
      ),
    [hasPermission],
  );

  if (!hasPermission(permissions.leadsRead)) {
    return (
      <div role="alert" className="altrex-table-state-error">
        You do not have permission to view leads.
      </div>
    );
  }

  return (
    <div>
      <div className="altrex-page-header">
        <div>
          <span className="altrex-eyebrow">Customer relationships</span>
          <h1>Leads</h1>
          <p>Track prospects, conversations, and follow-up commitments.</p>
        </div>
        {tab === "leads" && hasPermission(permissions.leadsCreate) && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialog(
                tab === "leads"
                  ? "lead"
                  : tab === "sources"
                    ? "source"
                    : "industry",
              );
            }}
          >
            {tab === "leads"
              ? "Add lead"
              : tab === "sources"
                ? "Add source"
                : "Add industry"}
          </Button>
        )}
        {tab === "sources" && hasPermission(permissions.leadSourcesCreate) && (
          <Button onClick={() => setDialog("source")}>Add source</Button>
        )}
        {tab === "industries" &&
          hasPermission(permissions.industriesCreate) && (
            <Button onClick={() => setDialog("industry")}>Add industry</Button>
          )}
      </div>
      <CrmError error={error} />
      <nav
        aria-label="CRM sections"
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {tabs.map((value) => (
          <Button
            key={value}
            variant={tab === value ? "default" : "outline"}
            onClick={() => setTab(value)}
          >
            {titleCase(value)}
          </Button>
        ))}
      </nav>
      {tab === "follow-ups" && (
        <label
          className="altrex-field"
          style={{ maxWidth: 260, marginBottom: 14 }}
        >
          <span>Show follow-ups</span>
          <select
            className="altrex-input"
            value={followUpScope}
            onChange={(event) => setFollowUpScope(event.target.value)}
          >
            <option value="due">Overdue and today</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="upcoming">Coming up</option>
          </select>
        </label>
      )}
      <section className="altrex-card altrex-table-wrap">
        <table className="altrex-table">
          <thead>
            <tr>
              {tab === "leads" ? (
                <>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Phone / Email</th>
                  <th>Next follow-up</th>
                  <th>Potential value</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) : tab === "follow-ups" ? (
                <>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Follow-up date</th>
                  <th>Status</th>
                </>
              ) : (
                <>
                  <th>Name</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === "leads" &&
              leads.map((lead, index) => {
                const id = lead.lead_id ?? index;
                const allowedTransitions =
                  LEAD_STATUS_TRANSITIONS[lead.status] ?? [];
                return (
                  <tr key={id}>
                    <td>
                      <strong>{lead.company_name}</strong>
                      {lead.industry_id ? (
                        <small style={{ display: "block" }}>
                          Industry #{lead.industry_id}
                        </small>
                      ) : null}
                    </td>
                    <td>
                      {lead.contact_name}
                      {lead.designation ? (
                        <small style={{ display: "block" }}>
                          {lead.designation}
                        </small>
                      ) : null}
                    </td>
                    <td>
                      {lead.phone ?? "—"}
                      <small style={{ display: "block" }}>
                        {lead.email ?? "—"}
                      </small>
                    </td>
                    <td>{friendlyDate(lead.next_follow_up_date)}</td>
                    <td>
                      {lead.estimated_value == null
                        ? "—"
                        : new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(lead.estimated_value)}
                    </td>
                    <td>{titleCase(lead.status)}</td>
                    <td>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {lead.lead_id != null &&
                          hasPermission(permissions.leadActivitiesRead) && (
                            <Button
                              variant="outline"
                              onClick={() =>
                                setActiveLead(lead.lead_id ?? null)
                              }
                            >
                              Activities
                            </Button>
                          )}
                        {hasPermission(permissions.leadsUpdate) && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditing(lead);
                              setDialog("lead");
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {hasPermission(permissions.leadsStatusUpdate) && (
                          <select
                            aria-label={`Change ${lead.company_name} status`}
                            className="altrex-input"
                            value=""
                            onChange={(event) => {
                              const status = event.target.value;
                              if (!status || !lead.lead_id) return;
                              const body =
                                status === "lost"
                                  ? {
                                      lost_reason:
                                        window.prompt(
                                          "Why was this lead lost?",
                                        ) ?? "",
                                    }
                                  : undefined;
                              if (status !== "lost" || body?.lost_reason)
                                changeStatus.mutate({
                                  id: lead.lead_id,
                                  status,
                                  body,
                                });
                            }}
                          >
                            <option value="">Change status</option>
                            {allowedTransitions.map((status) => (
                              <option key={status} value={status}>
                                {titleCase(status)}
                              </option>
                            ))}
                          </select>
                        )}
                        {lead.status === "qualified" &&
                          hasPermission(permissions.leadsConvert) && (
                            <Button
                              onClick={() => {
                                if (
                                  lead.lead_id &&
                                  window.confirm(
                                    `Convert ${lead.company_name} into a customer?`,
                                  )
                                )
                                  convertLead.mutate(lead.lead_id);
                              }}
                            >
                              Convert
                            </Button>
                          )}
                        {hasPermission(permissions.leadsDelete) && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              if (
                                lead.lead_id &&
                                window.confirm(`Remove ${lead.company_name}?`)
                              )
                                deleteLead.mutate(lead.lead_id);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            {tab === "follow-ups" &&
              followUps.map((lead, index) => (
                <tr key={lead.lead_id ?? index}>
                  <td>{lead.company_name}</td>
                  <td>{lead.contact_name}</td>
                  <td>{friendlyDate(lead.next_follow_up_date)}</td>
                  <td>{titleCase(lead.status)}</td>
                </tr>
              ))}
            {(tab === "sources" || tab === "industries") &&
              (visibleRecords as NamedCrmRecord[]).map((item, index) => (
                <tr
                  key={
                    item.id ?? item.lead_source_id ?? item.industry_id ?? index
                  }
                >
                  <td>{item.source_name ?? item.industry_name ?? "—"}</td>
                </tr>
              ))}
            {!visibleRecords.length && (
              <tr>
                <td
                  colSpan={tab === "leads" ? 7 : tab === "follow-ups" ? 4 : 1}
                  style={{ textAlign: "center", padding: 28 }}
                >
                  No {tab} to show.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      {activeLead != null && (
        <section className="altrex-card" style={{ marginTop: 16 }}>
          <div className="altrex-page-header">
            <div>
              <h2>Lead activities</h2>
              <p>Conversation history and agreed next steps.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {hasPermission(permissions.leadActivitiesCreate) && (
                <Button onClick={() => setDialog("activity")}>
                  Log activity
                </Button>
              )}
              <Button variant="outline" onClick={() => setActiveLead(null)}>
                Close
              </Button>
            </div>
          </div>
          <CrmError error={activitiesQuery.error} />
          <div className="altrex-table-wrap">
            <table className="altrex-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Outcome</th>
                  <th>Next follow-up</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity, index) => (
                  <tr key={activity.activity_id ?? index}>
                    <td>{friendlyDate(activity.activity_date)}</td>
                    <td>{titleCase(activity.activity_type)}</td>
                    <td>{activity.subject}</td>
                    <td>{activity.outcome ?? "—"}</td>
                    <td>{friendlyDate(activity.next_follow_up_date)}</td>
                  </tr>
                ))}
                {!activities.length && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: 20 }}
                    >
                      No activity has been recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {dialog && (
        <FormDialog
          title={
            dialog === "lead"
              ? editing
                ? "Update lead"
                : "Add lead"
              : dialog === "activity"
                ? "Log lead activity"
                : dialog === "source"
                  ? "Add lead source"
                  : "Add industry"
          }
          fields={formFields}
          initial={editing as unknown as Record<string, unknown> | undefined}
          pending={busy}
          onClose={close}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
