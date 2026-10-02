"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, Bus, CalendarDays, Fuel, Gauge, Route, Users, Wrench } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AppShell, MetricCard, PageHeader, QuickActionCard, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { busData, driverData, fuelRecords, liveTripStatus, maintenanceRecords, routeData, ScheduleItem, scheduleData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";
import { DashboardPreferences, defaultPreferences, readPreferences } from "@/lib/preferences";

const pieColors = ["#00866a", "#d8e1e7"];

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function DashboardPage() {
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const { records: schedules } = usePersistentCollection("srmss-schedules", scheduleData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);
  const { records: fuel } = usePersistentCollection("srmss-fuel-records", fuelRecords);
  const { records: maintenance } = usePersistentCollection("srmss-maintenance-records", maintenanceRecords);
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);

  useEffect(() => {
    const syncPreferences = () => setPreferences(readPreferences());
    syncPreferences();
    window.addEventListener("srmss-preferences-changed", syncPreferences);
    return () => window.removeEventListener("srmss-preferences-changed", syncPreferences);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 7);
  const upcomingLimit = upcomingDate.toISOString().slice(0, 10);
  const todaysSchedules = schedules.filter((schedule) => schedule.date === today);
  const delayedTrips = todaysSchedules.filter((schedule) => schedule.status === "Delayed");
  const onTimeTrips = todaysSchedules.filter((schedule) => schedule.status === "On Time");
  const activeBuses = buses.filter((bus) => bus.status === "Active" || bus.status === "In Service");
  const onDutyDrivers = drivers.filter((driver) => driver.status === "On Duty");
  const utilization = buses.length ? Math.round((activeBuses.length / buses.length) * 100) : 0;
  const utilizationData = [{ name: "In service", value: utilization }, { name: "Available", value: 100 - utilization }];
  const maintenanceAlerts = maintenance.filter((record) => record.status === "Overdue" || (record.status === "Scheduled" && record.nextServiceDate <= upcomingLimit));

  const scheduleConflicts: { first: ScheduleItem; second: ScheduleItem; resources: string[] }[] = [];
  for (let firstIndex = 0; firstIndex < todaysSchedules.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < todaysSchedules.length; secondIndex += 1) {
      const first = todaysSchedules[firstIndex];
      const second = todaysSchedules[secondIndex];
      const overlaps = toMinutes(first.departureTime) < toMinutes(second.arrivalTime)
        && toMinutes(second.departureTime) < toMinutes(first.arrivalTime);
      if (!overlaps) continue;
      const resources = [
        first.routeName === second.routeName ? "route" : "",
        first.busNo === second.busNo ? "bus" : "",
        first.driver === second.driver ? "driver" : "",
      ].filter(Boolean);
      if (resources.length) scheduleConflicts.push({ first, second, resources });
    }
  }

  const metrics = [
    { label: "Active Routes", value: String(routes.filter((route) => route.status === "Active" || route.status === "Delayed").length), change: "Routes in operation", icon: Route, accent: "blue" as const, href: "/routes" },
    { label: "Active Buses", value: String(activeBuses.length), change: `${buses.length} vehicles in fleet`, icon: Bus, accent: "green" as const, href: "/buses" },
    { label: "Drivers On Duty", value: String(onDutyDrivers.length), change: `${drivers.length} registered drivers`, icon: Users, accent: "amber" as const, href: "/drivers" },
    { label: "Today's Trips", value: String(todaysSchedules.length), change: today, icon: CalendarDays, accent: "blue" as const, href: "/schedules" },
    { label: "Delayed Trips", value: String(delayedTrips.length), change: "Today's timetable", icon: AlertTriangle, accent: "red" as const, href: "/schedules" },
    { label: "On-Time Trips", value: String(onTimeTrips.length), change: "Today's timetable", icon: Gauge, accent: "green" as const, href: "/schedules" },
    { label: "Vehicle Utilization", value: `${utilization}%`, change: `${activeBuses.length} of ${buses.length} in service`, icon: Bus, accent: "amber" as const, href: "/buses" },
    { label: "Maintenance Alerts", value: String(maintenanceAlerts.length), change: "Due or overdue", icon: Wrench, accent: maintenanceAlerts.length ? "red" as const : "green" as const, href: "/fuel-maintenance" },
    { label: "Schedule Conflicts", value: String(scheduleConflicts.length), change: "Today's assignments", icon: AlertTriangle, accent: scheduleConflicts.length ? "red" as const : "green" as const, href: "/schedules" },
  ];

  return (
    <AppShell title="Depot Operations" subtitle="Daily monitoring and coordination · Depot Supervisor / Manager">
      <PageHeader title="Daily Operations" subtitle="Today's service, fleet and staffing position" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ href, ...metric }) => (
          <Link key={metric.label} href={href} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
            <MetricCard {...metric} />
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        {preferences.dashboardWidgets.trips && <SectionCard title="Today's Trips" subtitle={`${todaysSchedules.length} scheduled services`} action={<Link href="/schedules" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">Manage schedules <ArrowRight className="h-4 w-4" /></Link>}>
          <TableCard
            headers={["Route", "Bus", "Driver", "Departure", "Arrival", "Status"]}
            rows={todaysSchedules.map((trip) => (
              <>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.routeName}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.departureTime}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.arrivalTime}</td>
                <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
              </>
            ))}
            emptyTitle="No trips scheduled today"
            emptyDescription="Create or adjust today's dispatches in schedule management."
          />
        </SectionCard>}

        <SectionCard title="Vehicle Utilization" subtitle="Operational vehicles across the fleet">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={utilizationData} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={3} startAngle={90} endAngle={-270}>
                  {utilizationData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index]} />)}
                </Pie>
                <Tooltip formatter={(value) => [`${value ?? 0}%`, "Fleet"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">{utilization}% utilized</div>
            <div className="text-sm text-[var(--text-muted)]">{activeBuses.length} active / {buses.length} vehicles</div>
            <Link href="/buses" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">Check availability <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {preferences.dashboardWidgets.liveStatus && <SectionCard title="Trip Status Monitor" subtitle="Today's dispatch status" action={<Link href="/routes" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">View routes <ArrowRight className="h-4 w-4" /></Link>}>
          <div className="space-y-3">
            {todaysSchedules.length ? todaysSchedules.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-0">
                <div className="min-w-0"><div className="truncate font-medium text-[var(--text-primary)]">{trip.routeName}</div><div className="text-sm text-[var(--text-muted)]">{trip.busNo} · {trip.driver}</div></div>
                <div className="shrink-0 text-right"><StatusBadge status={trip.status} /><div className="mt-1 text-xs text-[var(--text-muted)]">Departs {trip.departureTime}</div></div>
              </div>
            )) : liveTripStatus.slice(0, 2).map((trip) => (
              <div key={trip.route} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-0">
                <div><div className="font-medium text-[var(--text-primary)]">{trip.route}</div><div className="text-sm text-[var(--text-muted)]">{trip.busNo} · {trip.driver}</div></div>
                <StatusBadge status={trip.status} />
              </div>
            ))}
          </div>
        </SectionCard>}

        <SectionCard title="Operational Alerts" subtitle="Maintenance and assignment exceptions">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold text-[var(--text-primary)]">Maintenance</h4><Link href="/fuel-maintenance" className="text-sm font-medium text-[var(--accent)]">View log</Link></div>
              {maintenanceAlerts.length ? maintenanceAlerts.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 text-sm last:border-0"><span className="text-[var(--text-secondary)]">{record.vehicle} · {record.type}</span><StatusBadge status={record.status} /></div>
              )) : <p className="text-sm text-[var(--text-muted)]">No maintenance alerts.</p>}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between"><h4 className="text-sm font-semibold text-[var(--text-primary)]">Schedule conflicts</h4><Link href="/schedules" className="text-sm font-medium text-[var(--accent)]">Review schedules</Link></div>
              {scheduleConflicts.length ? scheduleConflicts.map(({ first, second, resources }) => (
                <div key={`${first.id}-${second.id}`} className="border-b border-[var(--border)] py-2 text-sm last:border-0"><div className="font-medium text-[var(--text-primary)]">{resources.join(", ")} conflict</div><div className="text-[var(--text-muted)]">{first.routeName} / {second.routeName} · {first.departureTime}–{second.arrivalTime}</div></div>
              )) : <p className="text-sm text-[var(--text-muted)]">No overlapping route, bus, or driver assignments today.</p>}
            </div>
          </div>
        </SectionCard>
      </div>

      {preferences.dashboardWidgets.quickActions && <div className="mt-6">
        <PageHeader title="Operations" subtitle="Open a work area" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard title="View routes" href="/routes" icon={Route} description="Review route assignments and map directions." />
          <QuickActionCard title="Modify schedules" href="/schedules" icon={CalendarDays} description="Edit trips and resolve dispatch conflicts." />
          <QuickActionCard title="Assign buses" href="/routes" icon={Bus} description="Change a route's assigned vehicle." />
          <QuickActionCard title="Assign drivers" href="/routes" icon={Users} description="Change a route's assigned driver." />
          <QuickActionCard title="Vehicle availability" href="/buses" icon={Bus} description="Check operational and maintenance status." />
          <QuickActionCard title="Fuel & maintenance" href="/fuel-maintenance" icon={Fuel} description={`${fuel.length} fuel entries · maintenance status`} />
          <QuickActionCard title="Reports & analytics" href="/reports" icon={BarChart3} description="Review service and fleet performance." />
        </div>
      </div>}
    </AppShell>
  );
}
