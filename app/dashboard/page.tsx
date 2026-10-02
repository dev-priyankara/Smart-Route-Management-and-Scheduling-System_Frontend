"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bus, CalendarDays, Fuel, Gauge, Route, Users, Wrench } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell, MetricCard, PageHeader, PrimaryButton, QuickActionCard, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { todaysTrips, fleetUtilization, liveTripStatus, summaryKpis } from "@/lib/mock-data";
import { DashboardPreferences, defaultPreferences, readPreferences } from "@/lib/preferences";

const pieColors = ["#146CFA", "#00AEEF", "#cbd5e1"];

export default function DashboardPage() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);

  useEffect(() => {
    const syncPreferences = () => setPreferences(readPreferences());
    syncPreferences();
    window.addEventListener("srmss-preferences-changed", syncPreferences);
    return () => window.removeEventListener("srmss-preferences-changed", syncPreferences);
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="Overview of current depot operations.">
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Routes" value={String(summaryKpis.totalRoutes)} change="+3 this week" icon={Route} accent="blue" />
        <MetricCard label="Active Buses" value={String(summaryKpis.activeBuses)} change="+2 today" icon={Bus} accent="green" />
        <MetricCard label="Drivers On Duty" value={String(summaryKpis.driversOnDuty)} change="+5%" icon={Users} accent="amber" />
        <MetricCard label="On-Time Rate" value="92.4%" change="+1.8%" icon={Gauge} accent="blue" />
      </div>

      <div className={`grid gap-6 ${preferences.dashboardWidgets.trips ? "xl:grid-cols-[1.65fr_0.95fr]" : ""}`}>
        {preferences.dashboardWidgets.trips && <SectionCard title="Today's Trips" subtitle="Live route dispatch positions" action={<PrimaryButton>Filter</PrimaryButton>}>
          <TableCard
            headers={["Route", "Bus No.", "Driver", "Status", "Departure", "Arrival"]}
            rows={todaysTrips.map((trip) => (
              <>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.route}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.departure}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.arrival}</td>
              </>
            ))}
            emptyTitle="No trips scheduled"
            emptyDescription="No trips available today."
          />
        </SectionCard>}

        <SectionCard title="Vehicle Utilization" subtitle="Fleet capacity usage">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={fleetUtilization} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={4} startAngle={90} endAngle={-270}>
                  {fleetUtilization.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value ?? 0}%`, "Utilization"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">78% utilized</div>
            <div className="text-sm text-[var(--text-muted)]">25 / 32 buses</div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {preferences.dashboardWidgets.liveStatus && <SectionCard title="Live Trip Status" subtitle="Current route movement">
          <div className="space-y-4">
            {liveTripStatus.map((trip) => (
              <div key={trip.route} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-4 py-3">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{trip.route}</div>
                  <div className="text-sm text-[var(--text-muted)]">{trip.busNo} · {trip.driver}</div>
                </div>
                <div className="text-right">
                  <div className="mb-1"><StatusBadge status={trip.status} /></div>
                  <div className="text-xs text-[var(--text-muted)]">{trip.currentState}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>}

        <SectionCard title="Operational Summary" subtitle="Depot control center snapshot">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Active routes</div>
              <div className="mt-2 text-3xl font-bold text-[var(--text-primary)]">18</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Active buses</div>
              <div className="mt-2 text-3xl font-bold text-[var(--text-primary)]">25</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Drivers on duty</div>
              <div className="mt-2 text-3xl font-bold text-[var(--text-primary)]">42</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Delayed trips</div>
              <div className="mt-2 text-3xl font-bold text-[var(--text-primary)]">3</div>
            </div>
          </div>
        </SectionCard>
      </div>

      {preferences.dashboardWidgets.quickActions && <div className="mt-6">
        <PageHeader title="Quick Actions" subtitle="Operational tasks" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard title="Add Route" href="/routes?action=create" icon={Route} description="Create a new depot route and assign a driver and bus." />
          <QuickActionCard title="Create Schedule" href="/schedules?action=create" icon={CalendarDays} description="Schedule trips for daily, weekly, or monthly dispatch windows." />
          <QuickActionCard title="Add Vehicle" href="/buses?action=create" icon={Bus} description="Register a new bus and track its current service status." />
          <QuickActionCard title="Add Driver" href="/drivers?action=create" icon={Users} description="Assign driver rosters and planned route coverage." />
          <QuickActionCard title="Log Fuel" href="/fuel-maintenance?action=fuel" icon={Fuel} description="Capture fuel usage and cost details for each route." />
          <QuickActionCard title="Record Maintenance" href="/fuel-maintenance?action=maintenance" icon={Wrench} description="Track routine and corrective maintenance work." />
        </div>
      </div>}
    </AppShell>
  );
}
