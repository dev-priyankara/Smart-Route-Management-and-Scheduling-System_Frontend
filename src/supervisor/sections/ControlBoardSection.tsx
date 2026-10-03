"use client";

import { AlertTriangle, Eye, Route } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { ScheduleItem } from "@/lib/mock-data";

const tripStatusOptions: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

interface StatusItem { name: string; value: number; color: string; }

interface Props {
  todaysSchedules: ScheduleItem[];
  tripStatusData: StatusItem[];
  handleUpdateTripStatus: (trip: ScheduleItem, status: ScheduleItem["status"]) => void;
  handleDispatchTrip: (trip: ScheduleItem) => void;
  setViewingTripDetails: (trip: ScheduleItem | null) => void;
  setEmergencyAdjustmentOpen: (open: boolean) => void;
}

export function ControlBoardSection({
  todaysSchedules,
  tripStatusData,
  handleUpdateTripStatus,
  handleDispatchTrip,
  setViewingTripDetails,
  setEmergencyAdjustmentOpen,
}: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Control Board"
        subtitle="Real-time monitoring of all active vehicle trips and depot dispatches"
        action={
          <PrimaryButton onClick={() => setEmergencyAdjustmentOpen(true)}>
            <AlertTriangle className="mr-1.5 h-4 w-4" /> Emergency Adjustment
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tripStatusData.map((item) => (
          <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center">
            <div className={`mx-auto mb-2 h-4 w-4 rounded-full ${item.color}`} />
            <div className="text-2xl font-bold text-[var(--text-primary)]">{item.value}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.name}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Active Trip Operations" subtitle="All scheduled trips for today with live status controls">
        <TableCard
          headers={["Departure", "Route", "Bus", "Driver", "Service Type", "Status", "Dispatch Action", "Details"]}
          rows={todaysSchedules.map((trip) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                <div className="flex flex-col"><span>{trip.departureTime}</span><span className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</span></div>
              </td>
              <td className="px-4 py-3 text-[var(--text-primary)]">{trip.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${trip.serviceType === "Express" ? "bg-indigo-100 text-indigo-700" : trip.serviceType === "Rural Service" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-700"}`}>{trip.serviceType}</span>
              </td>
              <td className="px-4 py-3">
                <select aria-label={`Update status for ${trip.routeName}`} value={trip.status} onChange={(e) => handleUpdateTripStatus(trip, e.target.value as ScheduleItem["status"])} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                  {tripStatusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                {trip.status === "Scheduled" && <button type="button" onClick={() => handleDispatchTrip(trip)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Dispatch</button>}
                {trip.status === "Delayed" && <button type="button" onClick={() => setEmergencyAdjustmentOpen(true)} className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700">Mitigate</button>}
              </td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingTripDetails(trip)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>

      <SectionCard title="Live Trip Monitoring" subtitle="Current operational status of active corridors">
        <div className="grid gap-4 md:grid-cols-2">
          {todaysSchedules.filter((t) => t.status === "On Time" || t.status === "Delayed").map((trip) => (
            <div key={trip.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-[var(--accent)]" />
                  <span className="font-bold text-[var(--text-primary)]">{trip.routeName}</span>
                </div>
                <StatusBadge status={trip.status} />
              </div>
              <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                <div className="flex justify-between"><span>Bus:</span><span className="font-medium text-[var(--text-primary)]">{trip.busNo}</span></div>
                <div className="flex justify-between"><span>Driver:</span><span className="font-medium text-[var(--text-primary)]">{trip.driver}</span></div>
                <div className="flex justify-between"><span>Departure:</span><span className="text-[var(--text-primary)]">{trip.departureTime}</span></div>
                <div className="flex justify-between"><span>Arrival:</span><span className="text-[var(--text-primary)]">{trip.arrivalTime}</span></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
