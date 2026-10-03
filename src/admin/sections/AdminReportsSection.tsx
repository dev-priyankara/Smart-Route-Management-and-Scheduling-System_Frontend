"use client";

import { Download, FileText, Users, Wrench } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard } from "@/components/shell";
import type { AdminSectionProps } from "../types";

type Props = Pick<
  AdminSectionProps,
  "routes" | "routePerformanceData" | "fleetStatusData" | "showToast"
>;

export function AdminReportsSection({ routes, routePerformanceData, fleetStatusData, showToast }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate reports, view analytics, and export system data"
        action={
          <PrimaryButton onClick={() => showToast("Report generation initiated")}>
            <Download className="mr-1.5 h-4 w-4" /> Generate Report
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Routes</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.length}</div>
          <div className="text-xs text-emerald-600 mt-1">Active service corridors</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Distance</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.reduce((sum, r) => sum + r.distance, 0)} km</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Network coverage</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Monthly Fuel Cost</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">LKR 98,780</div>
          <div className="text-xs text-emerald-600 mt-1">-5.2% vs last month</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">System Uptime</div>
          <div className="text-3xl font-bold text-emerald-600">99.8%</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Last 30 days</div>
        </div>
      </div>

      <SectionCard title="Route Performance Analysis" subtitle="Performance metrics across all routes">
        <div className="space-y-3">
          {routePerformanceData.map((route) => (
            <div key={route.name} className="flex items-center gap-4">
              <div className="w-48 text-sm font-medium text-[var(--text-primary)]">{route.name}</div>
              <div className="flex-1">
                <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500" style={{ width: `${route.value}%` }} />
                </div>
              </div>
              <div className="w-16 text-right font-bold text-[var(--text-primary)]">{route.value}%</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Export Data" subtitle="Download reports and data exports">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Fleet Report", detail: "PDF export of all fleet data", icon: Download, toast: "Fleet report exported to PDF" },
              { label: "Schedule Report", detail: "CSV export of schedules", icon: FileText, toast: "Schedule report exported to CSV" },
              { label: "Driver Report", detail: "Excel export of driver data", icon: Users, toast: "Driver report exported to Excel" },
              { label: "Maintenance Report", detail: "PDF export of maintenance logs", icon: Wrench, toast: "Maintenance report exported to PDF" },
            ].map(({ label, detail, icon: Icon, toast }) => (
              <button key={label} type="button" onClick={() => showToast(toast)} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 text-left transition hover:bg-[var(--panel)]">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{detail}</div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Analytics Dashboard" subtitle="Visual analytics and insights">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Fleet Utilization Distribution</div>
            {fleetStatusData.map((item) => {
              const max = Math.max(...fleetStatusData.map((f) => f.value), 1);
              const pct = (item.value / max) * 100;
              return (
                <div key={item.name} className="flex items-center gap-3 mb-2">
                  <div className={`h-4 w-4 rounded ${item.color}`} />
                  <div className="w-32 text-xs text-[var(--text-secondary)]">{item.name}</div>
                  <div className="flex-1">
                    <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--panel)] border border-[var(--border)]">
                      <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="w-12 text-right font-bold text-[var(--text-primary)] text-sm">{item.value}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
