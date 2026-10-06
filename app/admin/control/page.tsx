"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bus, CheckCircle2, Eye, MapPin, Route, Users } from "lucide-react";
import {
  Modal, PageHeader, SectionCard, StatusBadge, TableCard,
} from "@/components/shell";
import {
  busData, ScheduleItem, scheduleData, supervisorConflictsData, supervisorExceptionsData,
  driverData,
} from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const TRIP_STATUSES: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

export default function ControlPage() {
  const { records: schedules, updateRecord: updateSchedule, addRecord: addException } = usePersistentCollection("srmss-schedules", scheduleData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSchedules = useMemo(() =>
    schedules.filter(s => s.date === todayStr).sort((a, b) => a.departureTime.localeCompare(b.departureTime)),
    [schedules, todayStr]);

  const activeBuses = useMemo(() => buses.filter(b => b.status === "Active" || b.status === "In Service"), [buses]);
  const emergencyBuses = useMemo(() => buses.filter(b => b.status === "Active"), [buses]);
  const availableDrivers = useMemo(() => drivers.filter(d => d.status === "Available"), [drivers]);
  const completedBuses = useMemo(() => [...new Set(schedules.filter(s => s.status === "Completed").map(s => s.busNo))], [schedules]);
  const activeRoutes = useMemo(() => [...new Set(schedules.filter(s => s.status === "On Time").map(s => s.routeName))], [schedules]);
  const scheduledTrips = useMemo(() => todaysSchedules.filter(s => s.status === "Scheduled"), [todaysSchedules]);
  const tripsInProgress = useMemo(() => todaysSchedules.filter(s => s.status === "On Time"), [todaysSchedules]);
  const delayedTrips = useMemo(() => todaysSchedules.filter(s => s.status === "Delayed"), [todaysSchedules]);
  const completedTrips = useMemo(() => schedules.filter(s => s.status === "Completed"), [schedules]);

  const [tripDetailModal, setTripDetailModal] = useState<ScheduleItem | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ scheduleId: String(schedules[0]?.id || ""), reason: "Emergency Road Closure", newDepartureTime: "08:00", newArrivalTime: "10:35", remarks: "" });
  const [showBusList, setShowBusList] = useState<"active" | "emergency" | null>(null);
  const [showDriverList, setShowDriverList] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const updateStatus = (trip: ScheduleItem, status: ScheduleItem["status"]) => {
    const { id, ...rest } = trip;
    updateSchedule(id, { ...rest, status });
  };

  const applyEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    const target = schedules.find(s => s.id === Number(emergencyForm.scheduleId));
    if (!target) return;
    const { id, ...rest } = target;
    updateSchedule(id, { ...rest, departureTime: emergencyForm.newDepartureTime, arrivalTime: emergencyForm.newArrivalTime, status: "Delayed" });
    setEmergencyOpen(false);
  };

  const operationalCards = [
    { label: "Active Routes", value: activeRoutes.length, sub: "Currently operational", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", icon: Route, action: () => {}, actionLabel: "View Routes" },
    { label: "Active Buses", value: activeBuses.length, sub: "In service / Active", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400", icon: Bus, action: () => setShowBusList("active"), actionLabel: "View Details" },
    { label: "Emergency Available", value: emergencyBuses.length, sub: "Ready for dispatch", color: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", icon: AlertTriangle, action: () => setShowBusList("emergency"), actionLabel: "View List" },
    { label: "Available Drivers", value: availableDrivers.length, sub: "Ready for assignment", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400", icon: Users, action: () => setShowDriverList(true), actionLabel: "View List" },
    { label: "Route Completed", value: completedBuses.length, sub: "Buses finished routes", color: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", icon: CheckCircle2, action: () => setShowCompleted(true), actionLabel: "View Details" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Operational Control Board" subtitle="Real-time monitoring of fleet, routes, drivers, and depot operations"
        action={
          <button type="button" onClick={() => { setEmergencyForm(f => ({ ...f, scheduleId: String(todaysSchedules[0]?.id || "") })); setEmergencyOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition">
            <AlertTriangle className="h-4 w-4" /> Emergency Adjustment
          </button>
        }
      />

      {/* Operational Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {operationalCards.map(({ label, value, sub, color, icon: Icon, action, actionLabel }) => (
          <SectionCard key={label} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
                <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{value}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">{sub}</div>
              </div>
              <div className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <button type="button" onClick={action}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
              <Eye className="h-3.5 w-3.5" /> {actionLabel}
            </button>
          </SectionCard>
        ))}
      </div>

      {/* Trip Status Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Scheduled", value: scheduledTrips.length, color: "bg-slate-500" },
          { label: "On Time", value: tripsInProgress.length, color: "bg-emerald-500" },
          { label: "Delayed", value: delayedTrips.length, color: "bg-amber-500" },
          { label: "Completed", value: completedTrips.length, color: "bg-blue-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center">
            <div className={`mx-auto mb-2 h-4 w-4 rounded-full ${color}`} />
            <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Active Trip Operations */}
      <SectionCard title="Active Trip Operations" subtitle={`${todaysSchedules.length} trips scheduled today`}>
        <TableCard
          headers={["Departure", "Route", "Bus", "Driver", "Type", "Status", "Action", "Details"]}
          rows={todaysSchedules.map(trip => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}<div className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</div></td>
              <td className="px-4 py-3 text-[var(--text-primary)]">{trip.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={trip.serviceType} /></td>
              <td className="px-4 py-3">
                <select value={trip.status} onChange={e => updateStatus(trip, e.target.value as ScheduleItem["status"])}
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  aria-label={`Status for ${trip.routeName}`}>
                  {TRIP_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                {trip.status === "Scheduled" && <button type="button" onClick={() => updateStatus(trip, "On Time")} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Dispatch</button>}
                {trip.status === "Delayed" && <button type="button" onClick={() => { setEmergencyForm(f => ({ ...f, scheduleId: String(trip.id) })); setEmergencyOpen(true); }} className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700">Mitigate</button>}
              </td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setTripDetailModal(trip)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* Trip Detail Modal */}
      <Modal open={!!tripDetailModal} title="Trip Details" onClose={() => setTripDetailModal(null)}>
        {tripDetailModal && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Route</div><div className="text-lg font-bold text-[var(--text-primary)]">{tripDetailModal.routeName}</div></div>
              <StatusBadge status={tripDetailModal.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Departure", tripDetailModal.departureTime], ["Arrival", tripDetailModal.arrivalTime], ["Bus", tripDetailModal.busNo], ["Driver", tripDetailModal.driver], ["Date", tripDetailModal.date], ["Service", tripDetailModal.serviceType]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Emergency Adjustment Modal */}
      <Modal open={emergencyOpen} title="Emergency Schedule Adjustment" onClose={() => setEmergencyOpen(false)}>
        <form onSubmit={applyEmergency} className="space-y-4">
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Schedule</span>
            <select value={emergencyForm.scheduleId} onChange={e => setEmergencyForm(f => ({ ...f, scheduleId: e.target.value }))} className={inputCls}>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.routeName} — {s.departureTime} ({s.date})</option>)}
            </select>
          </label>
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Reason</span>
            <input value={emergencyForm.reason} onChange={e => setEmergencyForm(f => ({ ...f, reason: e.target.value }))} className={inputCls} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">New Departure</span>
              <input type="time" value={emergencyForm.newDepartureTime} onChange={e => setEmergencyForm(f => ({ ...f, newDepartureTime: e.target.value }))} className={inputCls} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">New Arrival</span>
              <input type="time" value={emergencyForm.newArrivalTime} onChange={e => setEmergencyForm(f => ({ ...f, newArrivalTime: e.target.value }))} className={inputCls} />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEmergencyOpen(false)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">Apply Adjustment</button>
          </div>
        </form>
      </Modal>

      {/* Active Buses List Modal */}
      <Modal open={showBusList === "active"} title="Active Buses" onClose={() => setShowBusList(null)}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activeBuses.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
              <div><div className="font-semibold text-[var(--text-primary)]">{b.busNo}</div><div className="text-xs text-[var(--text-muted)]">{b.registration}</div></div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {activeBuses.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-6">No active buses</p>}
        </div>
      </Modal>

      {/* Emergency Buses Modal */}
      <Modal open={showBusList === "emergency"} title="Emergency Available Buses" onClose={() => setShowBusList(null)}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {emergencyBuses.map(b => (
            <div key={b.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
              <div><div className="font-semibold text-[var(--text-primary)]">{b.busNo}</div><div className="text-xs text-[var(--text-muted)]">{b.registration} · {b.seatingCapacity} seats</div></div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {emergencyBuses.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-6">No emergency-available buses</p>}
        </div>
      </Modal>

      {/* Available Drivers Modal */}
      <Modal open={showDriverList} title="Available Drivers" onClose={() => setShowDriverList(false)}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {availableDrivers.map(d => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
              <div><div className="font-semibold text-[var(--text-primary)]">{d.name}</div><div className="text-xs text-[var(--text-muted)]">{d.licenseNumber} · {d.phone}</div></div>
              <StatusBadge status={d.status} />
            </div>
          ))}
          {availableDrivers.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-6">No available drivers</p>}
        </div>
      </Modal>

      {/* Route-Completed Buses Modal */}
      <Modal open={showCompleted} title="Route-Completed Buses" onClose={() => setShowCompleted(false)}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {completedBuses.map(busNo => (
            <div key={busNo} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
              <div className="font-semibold text-[var(--text-primary)]">{busNo}</div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">Completed</span>
            </div>
          ))}
          {completedBuses.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-6">No completed routes yet</p>}
        </div>
      </Modal>
    </div>
  );
}
