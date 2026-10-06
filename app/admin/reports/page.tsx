"use client";

import { Download, FileText } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shell";
import { busData, driverData, routeData, scheduleData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const routePerformanceData = [
  { name: "Colombo - Kandy", value: 92 },
  { name: "Galle - Matara", value: 88 },
  { name: "Kandy - Matale", value: 84 },
  { name: "Negombo - Colombo", value: 90 },
  { name: "Kurunegala - Puttalam", value: 79 },
];

export default function ReportsPage() {
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: schedules } = usePersistentCollection("srmss-schedules", scheduleData);

  const activeBuses = buses.filter(b => b.status === "Active" || b.status === "In Service");
  const completedTrips = schedules.filter(s => s.status === "Completed");
  const onTimeTrips = schedules.filter(s => s.status === "On Time");
  const totalTrips = schedules.length;
  const onTimeRate = totalTrips ? Math.round(((completedTrips.length + onTimeTrips.length) / totalTrips) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports &amp; Analytics" subtitle="View performance metrics and export reports"
        action={
          <button type="button" onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Routes", value: routes.length, sub: "Service corridors" },
          { label: "Network Distance", value: `${routes.reduce((s, r) => s + r.distance, 0)} km`, sub: "Total coverage" },
          { label: "On-Time Rate", value: `${onTimeRate}%`, sub: "Trip punctuality" },
          { label: "System Uptime", value: "99.8%", sub: "Last 30 days" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Route Performance" subtitle="On-time completion rate by corridor">
        <div className="space-y-3">
          {routePerformanceData.map(r => (
            <div key={r.name} className="flex items-center gap-4">
              <div className="w-44 text-sm font-medium text-[var(--text-primary)]">{r.name}</div>
              <div className="flex-1"><div className="h-5 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all" style={{ width: `${r.value}%` }} /></div></div>
              <div className="w-12 text-right font-bold text-[var(--text-primary)]">{r.value}%</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Export Data" subtitle="Download reports in various formats">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Fleet Report", detail: "PDF export of all fleet data" },
              { label: "Schedule Report", detail: "CSV export of timetables" },
              { label: "Driver Report", detail: "Excel of driver roster" },
              { label: "Maintenance Report", detail: "PDF of service logs" },
            ].map(({ label, detail }) => (
              <button key={label} type="button" className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 text-left transition hover:bg-[var(--panel)]">
                <FileText className="h-5 w-5 text-[var(--accent)] shrink-0" />
                <div><div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div><div className="text-xs text-[var(--text-muted)]">{detail}</div></div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Fleet Status Distribution">
          <div className="space-y-3">
            {[
              { label: "Active / In Service", value: activeBuses.length, total: buses.length, color: "bg-emerald-500" },
              { label: "Under Maintenance", value: buses.filter(b => b.status === "Under Maintenance").length, total: buses.length, color: "bg-amber-500" },
              { label: "Out of Service", value: buses.filter(b => b.status === "Out of Service").length, total: buses.length, color: "bg-rose-500" },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${color} shrink-0`} />
                <div className="flex-1 text-sm text-[var(--text-secondary)]">{label}</div>
                <div className="w-full max-w-[120px]"><div className="h-3 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]"><div className={`h-full rounded-full ${color}`} style={{ width: total ? `${(value / total) * 100}%` : "0%" }} /></div></div>
                <div className="w-6 text-right font-bold text-sm text-[var(--text-primary)]">{value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
