"use client";

import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarRange,
  Clock,
  Coins,
  CreditCard,
  Database,
  FileCode,
  GitFork,
  Globe,
  Hash,
  HelpCircle,
  Landmark,
  Map,
  MapPin,
  Network,
  Percent,
  Ruler,
  Target,
} from "lucide-react";
import Link from "next/link";

const metricSummary = [
  {
    label: "Organization & HR",
    count: 5,
    foot: "5 masters",
    tone: "blue",
    icon: Network,
  },
  {
    label: "Financial & Banking",
    count: 6,
    foot: "6 masters",
    tone: "green",
    icon: Coins,
  },
  {
    label: "Tax & Measurement",
    count: 3,
    foot: "3 masters",
    tone: "amber",
    icon: Percent,
  },
  {
    label: "Locations",
    count: 3,
    foot: "3 masters",
    tone: "cyan",
    icon: Globe,
  },
  {
    label: "Document Numbering",
    count: 2,
    foot: "2 masters",
    tone: "violet",
    icon: Hash,
  },
];

const masterGroups = [
  {
    id: "org-hr",
    title: "Organization & HR",
    detail: "Branches, departments, designations, shifts and holidays",
    items: [
      { label: "Branches", href: "/masters/branches", icon: GitFork },
      { label: "Departments", href: "/masters/departments", icon: Network },
      { label: "Designations", href: "/masters/designations", icon: Briefcase },
      { label: "Shifts", href: "/masters/shifts", icon: Clock },
      { label: "Holidays", href: "/masters/holidays", icon: CalendarDays },
    ],
  },
  {
    id: "finance-banking",
    title: "Financial & Banking",
    detail: "Financial years, currencies, banks, payment terms and accounts",
    items: [
      {
        label: "Financial Years",
        href: "/masters/financial-years",
        icon: CalendarRange,
      },
      { label: "Currencies", href: "/masters/currencies", icon: Coins },
      { label: "Bank Master", href: "/masters/banks", icon: Landmark },
      {
        label: "Payment Terms",
        href: "/masters/payment-terms",
        icon: CreditCard,
      },
      { label: "Cost Centers", href: "/masters/cost-centers", icon: Target },
      {
        label: "Chart of Accounts",
        href: "/masters/chart-of-accounts",
        icon: BookOpen,
      },
    ],
  },
  {
    id: "tax-measurement",
    title: "Tax & Measurement",
    detail: "Tax rates, units of measurement and reason codes",
    items: [
      { label: "Tax Types", href: "/masters/taxes", icon: Percent },
      { label: "Units of Measure (UOM)", href: "/masters/uom", icon: Ruler },
      {
        label: "Cr / Dr Reasons",
        href: "/masters/cr-dr-reasons",
        icon: HelpCircle,
      },
    ],
  },
  {
    id: "locations",
    title: "Locations",
    detail: "Geographical master hierarchy for addresses and shipping",
    items: [
      { label: "Countries", href: "/masters/countries", icon: Globe },
      { label: "States", href: "/masters/states", icon: Map },
      { label: "Cities", href: "/masters/cities", icon: MapPin },
    ],
  },
  {
    id: "series-numbering",
    title: "Document Numbering",
    detail: "Voucher prefixes, sequential numbering and numbering series",
    items: [
      {
        label: "Document Types",
        href: "/masters/document-types",
        icon: FileCode,
      },
      {
        label: "Document Series",
        href: "/masters/document-series",
        icon: Hash,
      },
    ],
  },
];

export function MastersOverview() {
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">MASTER DATA</span>
          <h1>Masters Overview</h1>
          <p>Central reference data powering all modules across the ERP.</p>
        </div>
      </header>

      <section className="dashboard-metrics" aria-label="Master categories summary">
        {metricSummary.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="dashboard-metric dashboard-panel">
              <div className="dashboard-metric-top">
                <span>{metric.label}</span>
                <i className={`dashboard-icon ${metric.tone}`}>
                  <Icon size={17} />
                </i>
              </div>
              <strong>{metric.count}</strong>
              <small>{metric.foot}</small>
            </div>
          );
        })}
      </section>

      <section className="dashboard-main-grid">
        {masterGroups.map((group) => (
          <section key={group.id} className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>{group.title}</h2>
                {group.detail && <span>{group.detail}</span>}
              </div>
            </div>
            <div className="dashboard-network">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Icon size={17} />
                    <span>{item.label}</span>
                    <ArrowRight size={14} />
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
