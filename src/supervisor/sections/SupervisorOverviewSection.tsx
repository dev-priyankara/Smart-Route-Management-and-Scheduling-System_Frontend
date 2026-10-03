"use client";

import {
  AlertTriangle,
  Bus,
  Eye,
  Users,
  Wrench,
} from "lucide-react";
import { SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type {
  Bus as BusRecord,
  OperationalException,
  ScheduleConflict,
  ScheduleItem,
} from "@/lib/mock-data";

interface Props {
  todaysSchedules: ScheduleItem[];
  unresolvedConflicts: ScheduleConflict[];
  openExceptions: OperationalException[];
  busesUnderMaintenance: BusRecord[];
  availableBuses: BusRecord[];
  buses: BusRecord[];
  onDutyDrivers: { length: number };
  availableDrivers: { length: number };
  drivers: { length: number };
  fleetUtilizationRate: number;
  driverDutyRate: number;
  navigateSection: (sec: string) => void;
  handleDispatchTrip: (trip: ScheduleItem) => void;
  setViewingTripDetails: (trip: ScheduleItem | null) => void;
  setViewingBus: (bus: BusRecord | null) => void;
  setSelectedConflict: (conflict: ScheduleConflict | null) => void;
  setSelectedException: (exception: OperationalException | null) => void;
  setResourceAllocationOpen: (open: boolean) => void;
  setEmergencyAdjustmentOpen: (open: boolean) => void;
}

export function SupervisorOverviewSection({
  todaysSchedules,
  unresolvedConflicts,
  openExceptions,
  busesUnderMaintenance,
  availableBuses,
  buses,
  onDutyDrivers,
  availableDrivers,
  drivers,
  fleetUtilizationRate,
  driverDutyRate,
  navigateSection,
  handleDispatchTrip,
  setViewingTripDetails,
  setViewingBus,
  setSelectedConflict,
  setSelectedException,
  setResourceAllocationOpen,
  setEmergencyAdjustmentOpen,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Action Required Alerts */}
      <SectionCard title="Action Required Alerts" subtitle="Operational items requiring immediate supervisor decision or intervention">
        <div className="grid gap-3 md:grid-cols-2">
          {unresolvedConflicts.map((c) => (
            <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-rose-300 bg-rose-50/60 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <span className="font-bold text-rose-900 dark:text-rose-200">{c.resource}</span>
                </div>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">{c.severity} Conflict</span>
              </div>
              <p className="my-2 text-xs text-[var(--text-secondary)]">{c.reason}</p>
              <div className="flex items-center justify-between border-t border-rose-200 pt-2 dark:border-rose-400/20">
                <span className="text-[11px] text-[var(--text-muted)]">{c.route} · {c.time}</span>
                <button type="button" onClick={() => setSelectedConflict(c)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Resolve Conflict</button>
              </div>
            </div>
          ))}

          {openExceptions.map((ex) => (
            <div key={ex.id} className="flex flex-col justify-between rounded-2xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-600" />
                  <span className="font-bold text-amber-900 dark:text-amber-200">{ex.type}: {ex.entity}</span>
                </div>
                <StatusBadge status={ex.status} />
              </div>
              <p className="my-2 text-xs text-[var(--text-secondary)]">{ex.reason}</p>
              <div className="flex items-center justify-between border-t border-amber-200 pt-2 dark:border-amber-400/20">
                <span className="text-[11px] text-[var(--text-muted)]">{ex.route} · {ex.time}</span>
                <button type="button" onClick={() => setSelectedException(ex)} className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700">Handle Exception</button>
              </div>
            </div>
          ))}

          {busesUnderMaintenance.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-3 text-xs text-[var(--text-primary)]">
              <div className="flex items-center gap-3">
                <Bus className="h-5 w-5 text-rose-500" />
                <div>
                  <div className="font-bold">Bus {b.busNo} ({b.registration}) Restricted</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Under maintenance · Not available for dispatch</div>
                </div>
              </div>
              <button type="button" onClick={() => setViewingBus(b)} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Inspect</button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Control Board Summary & Utilization */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard
          title="Today's Operational Control Board"
          subtitle="Daily dispatch timetable and operational condition monitoring"
          action={
            <button type="button" onClick={() => navigateSection("control")} className="text-xs font-semibold text-[var(--accent)] hover:underline">Full Control Board →</button>
          }
        >
          <TableCard
            headers={["Departure", "Route Name", "Bus", "Driver", "Condition", "Operational Action"]}
            rows={todaysSchedules.map((trip) => (
              <>
                <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--text-primary)]">{trip.routeName}</div>
                  <div className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</div>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {trip.status === "Scheduled" && (
                      <button type="button" onClick={() => handleDispatchTrip(trip)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Dispatch</button>
                    )}
                    <button type="button" onClick={() => setViewingTripDetails(trip)} className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-1.5 text-[var(--text-secondary)] hover:bg-[var(--panel)]" title="Review trip">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </>
            ))}
          />
        </SectionCard>

        <SectionCard title="Depot Operational Utilization" subtitle="Real-time allocation of fleet buses and on-duty drivers">
          <div className="space-y-6 py-2">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                <span>Active Bus Fleet Utilization</span>
                <span>{fleetUtilizationRate}% ({availableBuses.length} / {buses.length} Buses)</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-[var(--soft)] p-0.5 border border-[var(--border)]">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500" style={{ width: `${fleetUtilizationRate}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>{availableBuses.length} Standby available</span>
                <span className="text-rose-500 font-semibold">{busesUnderMaintenance.length} Under maintenance</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                <span>Driver Duty Roster Coverage</span>
                <span>{driverDutyRate}% ({onDutyDrivers.length} / {drivers.length} Drivers)</span>
              </div>
              <div className="h-3.5 w-full overflow-hidden rounded-full bg-[var(--soft)] p-0.5 border border-[var(--border)]">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-600 transition-all duration-500" style={{ width: `${driverDutyRate}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>{availableDrivers.length} Available for dispatch</span>
                <span>Shift coverage active</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Operational Control Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setResourceAllocationOpen(true)} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Users className="h-4 w-4 text-[var(--accent)]" /> Allocate Resources
                </button>
                <button type="button" onClick={() => setEmergencyAdjustmentOpen(true)} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Emergency Adjust
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
