"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity, AlertTriangle, BarChart3, Bus, CalendarDays, CheckCircle,
  CheckCircle2, Clock, Eye, Fuel, Gauge, History, MapPin, Route,
  ShieldCheck, UserCog, Users, Wrench,
} from "lucide-react";
import { MetricCard, SectionCard, StatusBadge } from "@/components/shell";
import { busData, driverData, fuelRecords, maintenanceRecords, routeData, scheduleData, supervisorConflictsData, supervisorExceptionsData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

// Quick-access section cards shown on overview
const SECTIONS = [
  { href: "/admin/users",       label: "User Management",     icon: UserCog,      desc: "Manage accounts, roles and permissions",       color: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400" },
  { href: "/admin/depots",      label: "Depot Management",    icon: MapPin,       desc: "Manage depot locations and staff",             color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
  { href: "/admin/control",     label: "Control Board",       icon: Activity,     desc: "Live dispatch, trips and emergency ops",       color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" },
  { href: "/admin/fleet",       label: "Vehicle Fleet",       icon: Bus,          desc: "Add, edit and monitor all buses",              color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
  { href: "/admin/drivers",     label: "Driver Roster",       icon: Users,        desc: "Driver records, licenses and insurance",       color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" },
  { href: "/admin/routes",      label: "Route Network",       icon: Route,        desc: "Create and manage service corridors",          color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400" },
  { href: "/admin/schedules",   label: "Timetable",           icon: CalendarDays, desc: "Schedule, modify and view all trips",          color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400" },
  { href: "/admin/fuel",        label: "Fuel Records",        icon: Fuel,         desc: "Track and manage fuel consumption",            color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400" },
  { href: "/admin/maintenance", label: "Maintenance",         icon: Wrench,       desc: "Vehicle service and maintenance logs",         color: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" },
  { href: "/admin/conflicts",   label: "Conflict Center",     icon: AlertTriangle, desc: "Schedule conflicts requiring resolution",     color: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400" },
  { href: "/admin/exceptions",  label: "Exceptions & Issues", icon: Wrench,       desc: "Operational exceptions and resolutions",       color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
  { href: "/admin/reports",     label: "Reports & Analytics", icon: BarChart3,    desc: "Performance, fuel and route statistics",       color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
];

export default function AdminOverviewPage() {
  const { records: schedules } = usePersistentCollection("srmss-schedules", scheduleData);
  const { records: routes }    = usePersistentCollection("srmss-routes",    routeData);
  const { records: buses }     = usePersistentCollection("srmss-buses",     busData);
  const { records: drivers }   = usePersistentCollection("srmss-drivers",   driverData);
  const { records: conflicts } = usePersistentCollection("srmss-conflicts", supervisorConflictsData);
  const { records: exceptions }= usePersistentCollection("srmss-exceptions",supervisorExceptionsData);
  const { records: fuel }      = usePersistentCollection("srmss-fuel-records", fuelRecords);
  const { records: maintenance }=usePersistentCollection("srmss-maintenance",maintenanceRecords);

  const todayStr = new Date().toISOString().slice(0, 10);

  const todaysSchedules   = useMemo(() => schedules.filter(s => s.date === todayStr), [schedules, todayStr]);
  const activeBuses       = useMemo(() => buses.filter(b => b.status === "Active" || b.status === "In Service"), [buses]);
  const onDutyDrivers     = useMemo(() => drivers.filter(d => d.status === "On Duty"), [drivers]);
  const openExceptions    = useMemo(() => exceptions.filter(e => e.status !== "Resolved"), [exceptions]);
  const unresolvedConflicts = useMemo(() => conflicts.filter(c => c.status === "Unresolved"), [conflicts]);
  const dispatchedTrips   = useMemo(() => todaysSchedules.filter(s => s.status === "On Time" || s.status === "Completed"), [todaysSchedules]);
  const tripsInProgress   = useMemo(() => todaysSchedules.filter(s => s.status === "On Time"), [todaysSchedules]);
  const delayedTrips      = useMemo(() => todaysSchedules.filter(s => s.status === "Delayed"), [todaysSchedules]);
  const completedTrips    = useMemo(() => schedules.filter(s => s.status === "Completed"), [schedules]);
  const busesUnderMaint   = useMemo(() => buses.filter(b => b.status === "Under Maintenance" || b.status === "Out of Service"), [buses]);

  const fleetUtilRate  = buses.length   ? Math.round((activeBuses.length  / buses.length)   * 100) : 0;
  const driverDutyRate = drivers.length ? Math.round((onDutyDrivers.length/ drivers.length) * 100) : 0;
  const dispatchRate   = todaysSchedules.length ? Math.round((dispatchedTrips.length / todaysSchedules.length) * 100) : 0;
  const onTimeRate     = dispatchedTrips.length ? Math.round((tripsInProgress.length  / dispatchedTrips.length)  * 100) : 0;

  const summaryMetrics = [
    { label: "Scheduled Today",  value: String(todaysSchedules.length), change: "Today's timetable",       icon: CalendarDays, accent: "blue"  as const },
    { label: "Dispatched",       value: String(dispatchedTrips.length), change: `${dispatchRate}% rate`,   icon: CheckCircle2, accent: "green" as const },
    { label: "In Progress",      value: String(tripsInProgress.length), change: "En route now",            icon: Route,        accent: "blue"  as const },
    { label: "Delayed Trips",    value: String(delayedTrips.length),    change: delayedTrips.length ? "Needs action" : "All on time", icon: Clock, accent: delayedTrips.length > 0 ? "amber" as const : "green" as const },
    { label: "Active Fleet",     value: String(activeBuses.length),     change: `${fleetUtilRate}% util`,  icon: Bus,          accent: "green" as const },
    { label: "On-Duty Drivers",  value: String(onDutyDrivers.length),   change: `${driverDutyRate}% cov`,  icon: Users,        accent: "blue"  as const },
    { label: "Open Exceptions",  value: String(openExceptions.length),  change: `${unresolvedConflicts.length} conflicts`, icon: AlertTriangle, accent: openExceptions.length > 0 ? "red" as const : "green" as const },
    { label: "On-Time Rate",     value: `${onTimeRate}%`,               change: "Punctuality index",       icon: Gauge,        accent: onTimeRate >= 85 ? "green" as const : onTimeRate >= 65 ? "amber" as const : "red" as const },
  ];

  const routePerfData = [
    { name: "Colombo – Kandy",       value: 92 },
    { name: "Galle – Matara",        value: 88 },
    { name: "Kandy – Matale",        value: 84 },
    { name: "Negombo – Colombo",     value: 90 },
    { name: "Kurunegala – Puttalam", value: 79 },
  ];

  return (
    <div className="space-y-8">

      {/* ── Admin Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--sidebar-bg)] via-[#0d2a46] to-[var(--sidebar-bg)] p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
              <ShieldCheck className="h-4 w-4" /> ADMINISTRATOR CONTROL PANEL
            </div>
            <h2 className="text-2xl font-bold">Complete System Overview &amp; Management</h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Full visibility across routes, fleet, schedules, drivers, fuel, maintenance and all depot operations.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[`${routes.length} Routes`, `${buses.length} Buses`, `${drivers.length} Drivers`].map(tag => (
                <span key={tag} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href="/admin/users"
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700 transition">
              <UserCog className="h-4 w-4" /> Manage Users
            </Link>
            <Link href="/admin/control"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur-sm">
              <Activity className="h-4 w-4" /> Control Board
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Current Time", value: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: new Date().toLocaleDateString("en-US", { weekday: "long" }), value: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Active Routes", value: `${routes.filter(r => r.status === "Active").length} of ${routes.length}`, icon: Route, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Active Fleet", value: `${activeBuses.length} of ${buses.length} buses`, icon: Bus, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-[var(--text-muted)] truncate">{label}</div>
              <div className="font-bold text-[var(--text-primary)] truncate">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryMetrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* ── Row 1: Fleet / Drivers / Route Performance ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Fleet Status" subtitle={`${buses.length} total vehicles`}>
          <div className="space-y-3">
            {[
              { label: "Active / In Service", count: activeBuses.length, total: buses.length, color: "bg-emerald-500" },
              { label: "Under Maintenance",   count: buses.filter(b => b.status === "Under Maintenance").length, total: buses.length, color: "bg-amber-500" },
              { label: "Out of Service",      count: buses.filter(b => b.status === "Out of Service").length,    total: buses.length, color: "bg-rose-500" },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  <span>{label}</span>
                  <span className="font-bold text-[var(--text-primary)]">{count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--soft)]">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <div className="text-3xl font-bold text-[var(--text-primary)]">{fleetUtilRate}%</div>
              <div className="text-xs text-[var(--text-muted)]">Fleet Utilization Rate</div>
            </div>
          </div>
          <Link href="/admin/fleet" className="mt-4 block w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2 text-center text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
            Manage Fleet →
          </Link>
        </SectionCard>

        <SectionCard title="Driver Roster" subtitle={`${drivers.length} total drivers`}>
          <div className="space-y-3">
            {[
              { label: "On Duty",   count: onDutyDrivers.length,                           color: "bg-blue-500",    text: "text-blue-600" },
              { label: "Available", count: drivers.filter(d => d.status === "Available").length, color: "bg-emerald-500", text: "text-emerald-600" },
              { label: "Off Duty",  count: drivers.filter(d => d.status === "Off Duty").length,  color: "bg-slate-400",  text: "text-slate-500" },
            ].map(({ label, count, color, text }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`h-3 w-3 rounded-full ${color}`} />
                  <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                </div>
                <span className={`text-lg font-bold ${text}`}>{count}</span>
              </div>
            ))}
            <div className="pt-1 text-center">
              <div className="text-3xl font-bold text-[var(--text-primary)]">{driverDutyRate}%</div>
              <div className="text-xs text-[var(--text-muted)]">Duty Coverage Rate</div>
            </div>
          </div>
          <Link href="/admin/drivers" className="mt-4 block w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2 text-center text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
            Manage Drivers →
          </Link>
        </SectionCard>

        <SectionCard title="Route Performance" subtitle="On-time % by corridor">
          <div className="space-y-2.5">
            {routePerfData.map(r => (
              <div key={r.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[var(--text-secondary)] truncate max-w-[140px]">{r.name}</span>
                  <span className={`font-bold ${r.value >= 88 ? "text-emerald-600" : r.value >= 80 ? "text-amber-600" : "text-rose-600"}`}>{r.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--soft)]">
                  <div className={`h-full rounded-full transition-all duration-700 ${r.value >= 88 ? "bg-emerald-500" : r.value >= 80 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/reports" className="mt-4 block w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2 text-center text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
            Full Reports →
          </Link>
        </SectionCard>
      </div>

      {/* ── Row 2: Today's Trips + Alerts ── */}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard title="Today's Control Board" subtitle={`${todaysSchedules.length} trips scheduled`}
          action={<Link href="/admin/control" className="text-xs font-semibold text-[var(--accent)] hover:underline">Full Board →</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
                <tr>
                  {["Time", "Route", "Bus", "Status", ""].map(h => <th key={h} className="px-3 py-2.5 font-medium first:pl-4 last:pr-4">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {todaysSchedules.slice(0, 7).map(trip => (
                  <tr key={trip.id} className="border-t border-[var(--border)] hover:bg-[var(--soft)] transition">
                    <td className="px-3 py-2.5 pl-4 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                    <td className="px-3 py-2.5 text-[var(--text-secondary)] max-w-[130px] truncate">{trip.routeName}</td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)] text-xs">{trip.busNo}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={trip.status} /></td>
                    <td className="px-3 py-2.5 pr-4">
                      <Link href="/admin/schedules" className="rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {todaysSchedules.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No trips scheduled for today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="System Alerts" subtitle="Action required">
          <div className="space-y-2.5">
            {unresolvedConflicts.length > 0 && (
              <Link href="/admin/conflicts" className="flex flex-col rounded-xl border border-rose-300 bg-rose-50/60 dark:border-rose-400/30 dark:bg-rose-500/10 p-3 hover:bg-rose-50 transition">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300"><AlertTriangle className="h-4 w-4 shrink-0" />{unresolvedConflicts.length} Schedule Conflicts</div>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-0.5">Click to resolve →</p>
              </Link>
            )}
            {openExceptions.length > 0 && (
              <Link href="/admin/exceptions" className="flex flex-col rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-400/30 dark:bg-amber-500/10 p-3 hover:bg-amber-50 transition">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300"><Wrench className="h-4 w-4 shrink-0" />{openExceptions.length} Open Exceptions</div>
                <p className="text-xs text-amber-600/80 mt-0.5">Click to handle →</p>
              </Link>
            )}
            {busesUnderMaint.length > 0 && (
              <Link href="/admin/fleet" className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 hover:bg-[var(--panel)] transition">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><Bus className="h-4 w-4 shrink-0" />{busesUnderMaint.length} Buses in Maintenance</div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">View fleet →</p>
              </Link>
            )}
            {unresolvedConflicts.length === 0 && openExceptions.length === 0 && busesUnderMaint.length === 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-500/10 p-5 text-center">
                <CheckCircle className="h-9 w-9 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">All Systems Operational</p>
                <p className="text-xs text-emerald-600/70 mt-0.5">No active alerts</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: Schedule Summary / Maintenance / Fuel ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Schedule Summary" subtitle="All trips">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: "Total",     value: schedules.length,      color: "text-[var(--text-primary)]" },
              { label: "Completed", value: completedTrips.length, color: "text-emerald-600" },
              { label: "Delayed",   value: delayedTrips.length,   color: "text-amber-600" },
              { label: "Scheduled", value: schedules.filter(s => s.status === "Scheduled").length, color: "text-blue-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
          <Link href="/admin/schedules" className="block w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2.5 text-center text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
            Manage Timetable →
          </Link>
        </SectionCard>

        <SectionCard title="Maintenance Status" subtitle={`${maintenance.length} records`}>
          <div className="space-y-2.5">
            {[
              { label: "Overdue",   count: maintenance.filter(m => m.status === "Overdue").length,   color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-500/10",    border: "border-rose-200 dark:border-rose-400/20" },
              { label: "Scheduled", count: maintenance.filter(m => m.status === "Scheduled").length, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-500/10",  border: "border-amber-200 dark:border-amber-400/20" },
              { label: "Completed", count: maintenance.filter(m => m.status === "Completed").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-400/20" },
            ].map(({ label, count, color, bg, border }) => (
              <div key={label} className={`flex items-center justify-between rounded-xl border ${border} ${bg} px-4 py-2.5`}>
                <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                <span className={`text-xl font-bold ${color}`}>{count}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/maintenance" className="mt-3 block w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2.5 text-center text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
            View Maintenance →
          </Link>
        </SectionCard>

        <SectionCard title="Recent Fuel Records" subtitle={`${fuel.length} log entries`}>
          <div className="space-y-2">
            {fuel.slice(0, 4).map(f => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{f.busNo} — {f.route}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{f.date}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-[var(--accent)]">{f.fuelLiters} L</div>
                  <div className="text-[11px] text-[var(--text-muted)]">LKR {f.cost.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {fuel.length === 0 && <div className="py-6 text-center text-sm text-[var(--text-muted)]">No fuel records yet</div>}
          </div>
          <Link href="/admin/fuel" className="mt-3 block w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2.5 text-center text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
            View All Fuel Records →
          </Link>
        </SectionCard>
      </div>

      {/* ── Quick Access Grid ── */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Quick Access — All Sections</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SECTIONS.map(({ href, label, icon: Icon, desc, color }) => (
            <Link key={href} href={href}
              className="group flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-soft)]">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color} group-hover:scale-105 transition`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">{label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
