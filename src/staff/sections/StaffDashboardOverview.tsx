"use client";

import { Activity } from "lucide-react";
import { MetricCard } from "@/components/shell";

interface Metric {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "blue" | "green" | "amber" | "red";
  onClick: () => void;
}

interface Props {
  metrics: Metric[];
  sectionsNav: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  currentSection: string;
  navigateSection: (sec: string) => void;
}

export function StaffDashboardOverview({ metrics, sectionsNav, currentSection, navigateSection }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--sidebar-bg)] via-[var(--panel)] to-[var(--soft)] p-5 text-[var(--text-primary)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            <Activity className="h-4 w-4" /> OPERATIONAL STAFF DASHBOARD
          </div>
          <h2 className="text-xl font-bold">Day-to-Day Data Entry and Operational Updates</h2>
          <p className="text-sm text-[var(--text-secondary)]">Manage route details, schedule information, trip status updates, fuel and maintenance records.</p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} onClick={metric.onClick} className="cursor-pointer transition hover:scale-[1.02]" role="button" tabIndex={0}>
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Function Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
        {sectionsNav.map((sec) => {
          const Icon = sec.icon;
          const isActive = currentSection === sec.id;
          return (
            <button key={sec.id} type="button" onClick={() => navigateSection(sec.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${isActive ? "bg-[var(--accent)] text-white shadow-sm" : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-secondary)] hover:bg-[var(--soft)] hover:text-[var(--text-primary)]"}`}
            >
              <Icon className="h-4 w-4" />
              {sec.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
