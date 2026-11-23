"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  ClipboardList,
  FileCheck,
  Truck,
  Wrench,
  ArrowRight,
  Plus,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { projectApi, procurementApi } from "@/features/projects/api";
import {
  extractRecords,
  formatINR,
  getDocumentAmount,
} from "@/features/dashboard/utils";

function Metric({
  icon: Icon,
  label,
  value,
  foot,
  tone,
  href,
}: {
  icon: React.ComponentType<{ size?: number }>;
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

function Panel({
  title,
  detail,
  children,
  className = "",
  style,
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section className={`dashboard-panel ${className}`} style={style}>
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

const CLOSED_PROJECT_STATUSES = new Set([
  "cancelled",
  "canceled",
  "closed",
  "completed",
]);

const normalizeStatus = (status: unknown) =>
  String(status ?? "unknown")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .trim();

export function ProjectsOverview() {
  const projectsQuery = projectApi.useList();
  const requisitionsQuery = procurementApi.useRequisitions();
  const grnsQuery = procurementApi.useGrns();
  const siteIssuesQuery = procurementApi.useSiteIssues();

  const projects = useMemo(
    () => extractRecords(projectsQuery.data),
    [projectsQuery.data],
  );
  const requisitions = useMemo(
    () => extractRecords(requisitionsQuery.data),
    [requisitionsQuery.data],
  );
  const grns = useMemo(
    () => extractRecords(grnsQuery.data),
    [grnsQuery.data],
  );
  const siteIssues = useMemo(
    () => extractRecords(siteIssuesQuery.data),
    [siteIssuesQuery.data],
  );

  const activeProjects = useMemo(() => {
    return projects.filter((p) => {
      const status = String(p.status ?? "").toLowerCase();
      return !CLOSED_PROJECT_STATUSES.has(status);
    });
  }, [projects]);

  const avgProgress = useMemo(() => {
    if (!activeProjects.length) return 0;
    const progressSum = activeProjects.reduce((sum, p) => {
      const raw = p.progress_percent ?? p.progress;
      const num = typeof raw === "number" ? raw : Number(raw);
      return sum + (Number.isFinite(num) ? num : 0);
    }, 0);
    return Math.round(progressSum / activeProjects.length);
  }, [activeProjects]);

  const projectStatus = useMemo(() => {
    const counts: Record<string, number> = {
      planning: 0,
      approved: 0,
      "in progress": 0,
      "on hold": 0,
      delayed: 0,
      completed: 0,
    };

    for (const project of projects) {
      const normStatus = normalizeStatus(project.status);
      if (counts[normStatus] !== undefined) {
        counts[normStatus]++;
      }
    }

    return [
      "planning",
      "approved",
      "in progress",
      "on hold",
      "delayed",
      "completed",
    ].map((status) => ({
      name: status.replace(/\b\w/g, (c) => c.toUpperCase()),
      count: counts[status] || 0,
    }));
  }, [projects]);

  const pendingRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      const status = String(r.status ?? "").toLowerCase();
      return (
        status === "pending" ||
        status === "draft" ||
        status === "submitted" ||
        (!["approved", "completed", "closed", "cancelled", "canceled", "rejected"].includes(status) &&
          status !== "")
      );
    });
  }, [requisitions]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const timeA = new Date(String(a.updated_at ?? a.created_at ?? "")).getTime();
        const timeB = new Date(String(b.updated_at ?? b.created_at ?? "")).getTime();
        if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA;
        }
        return 0;
      })
      .slice(0, 5);
  }, [projects]);

  const isLoading =
    projectsQuery.isLoading ||
    requisitionsQuery.isLoading ||
    grnsQuery.isLoading ||
    siteIssuesQuery.isLoading;

  const hasError =
    projectsQuery.isError ||
    requisitionsQuery.isError ||
    grnsQuery.isError ||
    siteIssuesQuery.isError;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            PROJECT OPERATIONS & EXECUTION
          </span>
          <h1>Projects Overview</h1>
          <p>Live tracking of project milestones, procurement, and site execution.</p>
        </div>
        <nav aria-label="Quick actions" className="dashboard-actions">
          <Link
            href="/projects"
            className="altrex-button altrex-button-primary"
          >
            <Plus size={16} />
            New project
          </Link>
          <Link
            href="/procurement/requisitions"
            className="altrex-button altrex-button-secondary"
          >
            <ClipboardList size={16} />
            Requisitions
          </Link>
        </nav>
      </header>

      {hasError && (
        <div className="dashboard-notice">
          Some project module data could not be loaded; available figures are still shown.
        </div>
      )}

      {isLoading && (
        <output
          className="dashboard-notice dashboard-loading-notice"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="altrex-spinner" aria-hidden="true" />
          Loading project operations and procurement data...
        </output>
      )}

      <section className="dashboard-metrics" aria-label="Key project metrics">
        <Metric
          icon={Briefcase}
          label="Total Projects"
          value={String(projects.length)}
          foot="Registered projects"
          tone="violet"
          href="/projects"
        />
        <Metric
          icon={TrendingUp}
          label="Active Projects"
          value={String(activeProjects.length)}
          foot="In delivery & active"
          tone="green"
          href="/projects"
        />
        <Metric
          icon={CheckCircle}
          label="Avg Progress"
          value={`${avgProgress}%`}
          foot="Portfolio completion"
          tone="cyan"
        />
        <Metric
          icon={ClipboardList}
          label="Pending Requisitions"
          value={String(pendingRequisitions.length)}
          foot="Awaiting fulfillment"
          tone="amber"
          href="/procurement/requisitions"
        />
        <Metric
          icon={FileCheck}
          label="GRNs"
          value={String(grns.length)}
          foot="Goods received notes"
          tone="blue"
          href="/procurement/grn"
        />
        <Metric
          icon={Truck}
          label="Site Issues"
          value={String(siteIssues.length)}
          foot="Materials issued to site"
          tone="rose"
          href="/procurement/site-issues"
        />
      </section>

      <section
        className="dashboard-main-grid"
        style={{
          gridTemplateAreas:
            '"chart chart ring" "activity activity links"',
        }}
      >
        <Panel
          title="Project delivery"
          detail={`${activeProjects.length} active · ${avgProgress}% average completion`}
          className="dashboard-money"
          style={{ gridArea: "chart" }}
        >
          <div className="dashboard-chart dashboard-chart-short">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectStatus}
                margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--dashboard-grid)"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fill: "var(--altrex-muted)", fontSize: 10 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Projects"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Average progress"
          detail="Portfolio completion"
          className="dashboard-invoice"
          style={{ gridArea: "ring" }}
        >
          <div className="dashboard-project-summary">
            <div
              className="dashboard-progress-ring"
              style={
                {
                  "--progress": `${avgProgress}%`,
                } as React.CSSProperties
              }
            >
              <b>{avgProgress}%</b>
            </div>
            <span>portfolio progress</span>
          </div>
        </Panel>

        <Panel
          title="Recent projects"
          detail="Latest updated projects"
          className="dashboard-wide dashboard-activity-panel"
          style={{ gridArea: "activity" }}
        >
          {recentProjects.length > 0 ? (
            <div className="dashboard-activity">
              {recentProjects.map((project, idx) => {
                const id = String(project.project_id ?? project.id ?? idx);
                const name = String(
                  project.project_name ?? project.name ?? `Project #${id}`,
                );
                const status = String(project.status ?? "unknown").replace(/_/g, " ");
                const raw = project.progress_percent ?? project.progress;
                const progress = typeof raw === "number" ? raw : Number(raw) || 0;

                return (
                  <Link
                    key={id}
                    href="/projects"
                    className="dashboard-activity-row"
                  >
                    <span className="dashboard-activity-icon">
                      <Briefcase size={16} />
                    </span>
                    <span className="dashboard-activity-name">
                      <b>{name}</b>
                      <small>{status}</small>
                    </span>
                    <strong>{progress}%</strong>
                    <ArrowRight size={14} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Briefcase size={25} />
              <span>No projects available</span>
            </div>
          )}
        </Panel>

        <Panel
          title="Quick links"
          detail="Projects & procurement navigation"
          className="dashboard-network-panel"
          style={{ gridArea: "links" }}
        >
          <div className="dashboard-network">
            <Link href="/projects">
              <Building2 size={17} />
              <span>Projects</span>
              <b>{projects.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/procurement/requisitions">
              <ClipboardList size={17} />
              <span>Requisitions</span>
              <b>{requisitions.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/procurement/grn">
              <FileCheck size={17} />
              <span>GRNs</span>
              <b>{grns.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/procurement/site-issues">
              <Truck size={17} />
              <span>Site Issues</span>
              <b>{siteIssues.length}</b>
              <ArrowRight size={14} />
            </Link>
            <Link href="/projects/equipment">
              <Wrench size={17} />
              <span>Equipment</span>
              <b />
              <ArrowRight size={14} />
            </Link>
          </div>
        </Panel>
      </section>
    </main>
  );
}
