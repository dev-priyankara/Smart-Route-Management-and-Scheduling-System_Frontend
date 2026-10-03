"use client";

import { AlertTriangle, Eye, Users, Wrench } from "lucide-react";
import { SectionCard, StatusBadge } from "@/components/shell";
import type { AdminSectionProps } from "../types";

type Props = Pick<
  AdminSectionProps,
  | "todaysSchedules"
  | "unresolvedConflicts"
  | "openExceptions"
  | "busesUnderMaintenance"
  | "mockUsers"
  | "activeBuses"
  | "buses"
  | "dispatchedTrips"
  | "tripsInProgress"
  | "fleetUtilizationRate"
  | "dispatchRate"
  | "onTimeRate"
  | "setViewingTripDetails"
>;

export function AdminOverviewSection({
  todaysSchedules,
  unresolvedConflicts,
  openExceptions,
  busesUnderMaintenance,
  mockUsers,
  activeBuses,
  buses,
  dispatchedTrips,
  tripsInProgress,
  fleetUtilizationRate,
  dispatchRate,
  onTimeRate,
  setViewingTripDetails,
}: Props) {
  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard
          title="System Health Overview"
          subtitle="Real-time operational metrics across all depots and routes"
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Fleet Utilization</div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">{fleetUtilizationRate}%</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{activeBuses.length} of {buses.length} buses active</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Dispatch Rate</div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">{dispatchRate}%</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{dispatchedTrips.length} of {todaysSchedules.length} dispatched</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">On-Time Performance</div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">{onTimeRate}%</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{tripsInProgress.length} trips on time</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Today&apos;s Control Board</div>
              <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Departure</th>
                      <th className="px-4 py-3 font-medium">Route</th>
                      <th className="px-4 py-3 font-medium">Bus</th>
                      <th className="px-4 py-3 font-medium">Driver</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysSchedules.slice(0, 5).map((trip) => (
                      <tr key={trip.id} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.routeName}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                        <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setViewingTripDetails(trip)}
                            className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* System Alerts */}
        <SectionCard title="System Alerts" subtitle="Critical issues requiring admin attention">
          <div className="space-y-3">
            {unresolvedConflicts.length > 0 && (
              <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                  {unresolvedConflicts.length} Unresolved Conflicts
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Schedule conflicts need immediate attention</p>
              </div>
            )}
            {openExceptions.length > 0 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  {openExceptions.length} Open Exceptions
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Operational exceptions require resolution</p>
              </div>
            )}
            {busesUnderMaintenance.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Wrench className="h-4 w-4" />
                  {busesUnderMaintenance.length} Buses Under Maintenance
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Fleet availability may be impacted</p>
              </div>
            )}
            {mockUsers.filter((u) => u.status === "Inactive").length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Users className="h-4 w-4" />
                  {mockUsers.filter((u) => u.status === "Inactive").length} Inactive Users
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">User accounts requiring review</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
