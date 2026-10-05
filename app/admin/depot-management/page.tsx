"use client";

import { AlertTriangle, Bus, Route, Users } from "lucide-react";
import { AppShell, MetricCard, PageHeader, SectionCard, StatusBadge } from "@/components/shell";
import { liveTripStatus } from "@/lib/mock-data";

export default function DepotManagementPage() {
  return (
    <AppShell title="Depot Management" subtitle="Centralized operations control center.">
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Routes" value="18" change="+2 this week" icon={Route} accent="blue" />
        <MetricCard label="Active Buses" value="25" change="+1 today" icon={Bus} accent="green" />
        <MetricCard label="Drivers On Duty" value="42" change="+5%" icon={Users} accent="amber" />
        <MetricCard label="Delayed Trips" value="3" change="-1 vs yesterday" icon={AlertTriangle} accent="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Live Trip Status" subtitle="Current operational route state">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Bus Number</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Departure</th>
                  <th className="px-4 py-3 font-medium">Current State</th>
                </tr>
              </thead>
              <tbody>
                {liveTripStatus.map((trip) => (
                  <tr key={trip.route} className="border-t border-[var(--border)] text-[var(--text-primary)]">
                    <td className="px-4 py-3 font-medium">{trip.route}</td>
                    <td className="px-4 py-3">{trip.busNo}</td>
                    <td className="px-4 py-3">{trip.driver}</td>
                    <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                    <td className="px-4 py-3">{trip.departure}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.currentState}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Fleet Overview" subtitle="Vehicle operational split">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span className="text-[var(--text-secondary)]">Total buses</span>
              <span className="font-semibold text-[var(--text-primary)]">32</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span className="text-[var(--text-secondary)]">Active</span>
              <span className="font-semibold text-[var(--text-primary)]">25</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span className="text-[var(--text-secondary)]">In Service</span>
              <span className="font-semibold text-[var(--text-primary)]">18</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span className="text-[var(--text-secondary)]">Under Maintenance</span>
              <span className="font-semibold text-[var(--text-primary)]">4</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span className="text-[var(--text-secondary)]">Out of Service</span>
              <span className="font-semibold text-[var(--text-primary)]">3</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Operational Visibility" subtitle="Depot condition across key service indicators">
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              Route reliability is stable and network performance remains healthy.
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300">
              Three trips are experiencing delay due to traffic and maintenance readiness.
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-300">
              Fleet dispatch is aligned with planned route coverage and daily allocation.
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Summary" subtitle="Control center highlights">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Total routes</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">18</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Trips completed</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">214</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Vehicle utilization rate</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">78%</div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
