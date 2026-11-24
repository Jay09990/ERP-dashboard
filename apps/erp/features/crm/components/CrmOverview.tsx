"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle,
  Phone,
  Plus,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { crmApi } from "@/features/crm/api";
import { extractRecords, formatINR, toNumber } from "@/features/dashboard/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "#6366f1",
  contacted: "#f59e0b",
  qualified: "#22c55e",
  proposal: "#8b5cf6",
  negotiation: "#06b6d4",
  won: "#16a34a",
  lost: "#ef4444",
};

function Panel({
  title,
  detail,
  children,
  className = "",
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="dashboard-panel-heading">
        <div>
          <h2>{title}</h2>
          {detail && <span>{detail}</span>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  foot,
  tone,
  href,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  foot: string;
  tone: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="dashboard-metric-top">
        <span>{label}</span>
        <i className={`dashboard-icon ${tone}`}>
          <Icon size={17} />
        </i>
      </div>
      <strong>{value}</strong>
      <small>{foot}</small>
    </>
  );
  return href ? (
    <Link className="dashboard-metric dashboard-panel" href={href}>
      {content}
    </Link>
  ) : (
    <div className="dashboard-metric dashboard-panel">{content}</div>
  );
}

export function CrmOverview() {
  const leadsQuery = crmApi.useLeads();
  const followUpsQuery = crmApi.useFollowUps("due");
  const sourcesQuery = crmApi.useLeadSources();
  const industriesQuery = crmApi.useIndustries();

  const isLoading =
    leadsQuery.isLoading ||
    followUpsQuery.isLoading ||
    sourcesQuery.isLoading ||
    industriesQuery.isLoading;

  const hasError =
    leadsQuery.isError ||
    followUpsQuery.isError ||
    sourcesQuery.isError ||
    industriesQuery.isError;

  const leads = useMemo(
    () => extractRecords(leadsQuery.data),
    [leadsQuery.data],
  );

  const followUps = useMemo(
    () => extractRecords(followUpsQuery.data),
    [followUpsQuery.data],
  );

  const leadSources = useMemo(
    () => extractRecords(sourcesQuery.data),
    [sourcesQuery.data],
  );

  const industries = useMemo(
    () => extractRecords(industriesQuery.data),
    [industriesQuery.data],
  );

  const activePipeline = useMemo(() => {
    return leads.filter((lead) => {
      const status = String(lead.status ?? "new").toLowerCase();
      return status !== "lost" && status !== "converted";
    });
  }, [leads]);

  const pipelineValue = useMemo(() => {
    return activePipeline.reduce((sum, lead) => {
      const val = toNumber(lead.estimated_value);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
  }, [activePipeline]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      const rawStatus = String(lead.status ?? "new").toLowerCase();
      counts[rawStatus] = (counts[rawStatus] ?? 0) + 1;
    }
    return Object.entries(counts).map(([status, value]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
      status,
      value,
      color: STATUS_COLORS[status] ?? "#94a3b8",
    }));
  }, [leads]);

  const monthlyData = useMemo(() => {
    const months: { key: string; month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      months.push({ key, month: label, count: 0 });
    }

    for (const lead of leads) {
      const dateStr = String(lead.created_at ?? lead.date ?? "");
      if (!dateStr) continue;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = months.find((m) => m.key === key);
      if (found) {
        found.count += 1;
      }
    }

    return months;
  }, [leads]);

  const recentLeads = useMemo(() => {
    const sorted = [...leads].sort((a, b) => {
      const timeA = a.created_at ? new Date(String(a.created_at)).getTime() : 0;
      const timeB = b.created_at ? new Date(String(b.created_at)).getTime() : 0;
      if (timeA && timeB) return timeB - timeA;
      return (toNumber(b.lead_id) || 0) - (toNumber(a.lead_id) || 0);
    });
    return sorted.slice(0, 5);
  }, [leads]);

  const dueList = useMemo(() => {
    return followUps.slice(0, 5);
  }, [followUps]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">CRM OVERVIEW</span>
          <h1>Customer Relationship Management</h1>
          <p>Live visibility into leads, sales pipeline, and follow-up activities.</p>
        </div>
        <nav aria-label="Quick actions" className="dashboard-actions">
          <Link
            href="/crm/leads"
            className="altrex-button altrex-button-primary"
          >
            <Plus size={16} />
            Leads
          </Link>
        </nav>
      </header>

      {hasError && (
        <div className="dashboard-notice">
          Some CRM data could not be loaded; available figures are still shown.
        </div>
      )}
      {isLoading && (
        <output
          className="dashboard-notice dashboard-loading-notice"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="altrex-spinner" aria-hidden="true" />
          Loading CRM pipeline and metrics...
        </output>
      )}

      <section className="dashboard-metrics" aria-label="Key CRM figures">
        <Metric
          icon={Users}
          label="Total Leads"
          value={isLoading ? "—" : String(leads.length)}
          foot={`${leads.length} recorded`}
          tone="blue"
          href="/crm/leads"
        />
        <Metric
          icon={TrendingUp}
          label="Active Pipeline"
          value={isLoading ? "—" : String(activePipeline.length)}
          foot="In qualification & negotiation"
          tone="cyan"
          href="/crm/leads"
        />
        <Metric
          icon={Activity}
          label="Pipeline Value"
          value={isLoading ? "—" : formatINR(pipelineValue)}
          foot="Estimated total value"
          tone="green"
          href="/crm/leads"
        />
        <Metric
          icon={Calendar}
          label="Due Follow-ups"
          value={isLoading ? "—" : String(followUps.length)}
          foot="Action items pending"
          tone="amber"
          href="/crm/leads"
        />
        <Metric
          icon={Target}
          label="Lead Sources"
          value={isLoading ? "—" : String(leadSources.length)}
          foot="Active acquisition channels"
          tone="violet"
          href="/crm/leads"
        />
        <Metric
          icon={CheckCircle}
          label="Industries"
          value={isLoading ? "—" : String(industries.length)}
          foot="Target verticals"
          tone="rose"
          href="/crm/leads"
        />
      </section>

      <section className="dashboard-main-grid">
        <Panel
          title="Monthly lead acquisition"
          detail="New leads · last 6 months"
          className="dashboard-money"
        >
          <div className="dashboard-chart dashboard-chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 8, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--dashboard-grid)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--altrex-border)",
                    background: "var(--altrex-surface)",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Leads"
                  stroke="#6366f1"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Lead status breakdown"
          detail="Current pipeline distribution"
          className="dashboard-invoice"
        >
          {statusData.length ? (
            <>
              <div className="dashboard-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="68%"
                      outerRadius="90%"
                      paddingAngle={4}
                      stroke="none"
                    >
                      {statusData.map((item) => (
                        <Cell key={item.status} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dashboard-donut-center">
                  <strong>{leads.length}</strong>
                  <span>leads</span>
                </div>
              </div>
              <div className="dashboard-status-list">
                {statusData.map((item) => (
                  <div key={item.status}>
                    <span>
                      <i
                        className="legend-dot"
                        style={{ background: item.color }}
                      />
                      {item.name}
                    </span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="dashboard-empty">
              <Activity size={25} />
              <span>No leads recorded yet</span>
            </div>
          )}
        </Panel>

        <Panel
          title="Recent leads"
          detail="Latest additions to pipeline"
          className="dashboard-projects"
        >
          {recentLeads.length ? (
            <div className="dashboard-activity">
              {recentLeads.map((lead, idx) => {
                const leadName = String(
                  lead.company_name ||
                    lead.contact_name ||
                    `Lead #${lead.lead_id ?? idx + 1}`,
                );
                const status = String(lead.status ?? "new");
                const val = toNumber(lead.estimated_value);
                return (
                  <Link
                    key={String(lead.lead_id ?? idx)}
                    href="/crm/leads"
                    className="dashboard-activity-row"
                  >
                    <span className="dashboard-activity-icon">
                      <Users size={16} />
                    </span>
                    <span className="dashboard-activity-name">
                      <b>{leadName}</b>
                      <small>{status}</small>
                    </span>
                    <strong>{val > 0 ? formatINR(val) : "—"}</strong>
                    <ArrowRight size={14} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              <CheckCircle size={25} />
              <span>No leads available</span>
            </div>
          )}
        </Panel>

        <Panel
          title="Due follow-ups"
          detail="Pending scheduled actions"
          className="dashboard-stock"
        >
          {dueList.length ? (
            <div className="dashboard-activity">
              {dueList.map((item, idx) => {
                const noteOrType = String(
                  item.notes ||
                    item.note ||
                    item.activity_type ||
                    item.subject ||
                    "Follow-up",
                );
                const leadName = String(
                  item.company_name ||
                    item.contact_name ||
                    item.lead_name ||
                    "Lead",
                );
                const rawDate =
                  item.next_follow_up_date ||
                  item.due_date ||
                  item.activity_date;
                const dueDate = rawDate
                  ? new Date(String(rawDate)).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Due";

                return (
                  <Link
                    key={String(item.activity_id ?? item.lead_id ?? idx)}
                    href="/crm/leads"
                    className="dashboard-activity-row"
                  >
                    <span className="dashboard-activity-icon">
                      <Phone size={16} />
                    </span>
                    <span className="dashboard-activity-name">
                      <b>{noteOrType}</b>
                      <small>{leadName}</small>
                    </span>
                    <strong>{dueDate}</strong>
                    <ArrowRight size={14} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              <CheckCircle size={25} />
              <span>No pending follow-ups</span>
            </div>
          )}
        </Panel>

        <Panel
          title="Quick links"
          detail="CRM shortcuts"
          className="dashboard-network-panel"
        >
          <div className="dashboard-network">
            <Link href="/crm/leads">
              <Users size={17} />
              <span>Leads</span>
              <b>{leads.length}</b>
              <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>
      </section>
    </main>
  );
}
