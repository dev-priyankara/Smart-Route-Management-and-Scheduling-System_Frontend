"use client";

import { AlertTriangle, Eye, MapPin } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, TableCard, EmptyState } from "@/components/shell";
import type { Bus, Driver, ScheduleItem, DepotRoute } from "@/lib/mock-data";
import type { AdminSectionProps } from "../types";

const tripStatusOptions: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

type Props = Pick<
  AdminSectionProps,
  | "todaysSchedules"
  | "tripStatusData"
  | "handleUpdateTripStatus"
  | "handleDispatchTrip"
  | "setViewingTripDetails"
  | "setEmergencyAdjustmentOpen"
> & {
  buses: Bus[];
  drivers: Driver[];
  routes: DepotRoute[];
};

export function AdminControlBoardSection({
  todaysSchedules,
  tripStatusData,
  handleUpdateTripStatus,
  handleDispatchTrip,
  setViewingTripDetails,
  setEmergencyAdjustmentOpen,
  buses,
  drivers,
  routes,
}: Props) {
  // Compute operational metrics
  const activeRoutesCount = new Set(todaysSchedules.filter((s) => s.status === "On Time" || s.status === "Scheduled").map((s) => s.routeName)).size;
  const activeBusesCount = buses.filter((b) => b.status === "Active" || b.status === "In Service").length;
  const emergencyAvailableBuses = buses.filter((b) => b.status === "Active" || b.status === "In Service").length - activeBusesCount;
  const availableDriversCount = drivers.filter((d) => d.status === "Available" || d.status === "On Duty").length;
  const routeCompletedBuses = todaysSchedules.filter((s) => s.status === "Completed").length;
  const onTimeTrips = todaysSchedules.filter((s) => s.status === "On Time").length;
  const totalTrips = todaysSchedules.length;
  const onTimeRate = totalTrips > 0 ? Math.round((onTimeTrips / totalTrips) * 100) : 0;

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

      {/* Operational Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Active Routes", value: activeRoutesCount, icon: "route", color: "text-blue-600" },
          { label: "Active Buses", value: activeBusesCount, icon: "bus", color: "text-emerald-600" },
          { label: "Emergency Available Buses", value: emergencyAvailableBuses, icon: "alert", color: "text-amber-600" },
          { label: "Available Drivers", value: availableDriversCount, icon: "driver", color: "text-indigo-600" },
          { label: "Route-Completed Buses", value: routeCompletedBuses, icon: "complete", color: "text-teal-600" },
          { label: "On-Time Rate", value: `${onTimeRate}%`, icon: "ontime", color: "text-purple-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="mb-1 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.label}</div>
              <div className={`h-4 w-4 rounded-full ${item.icon === "route" ? "bg-blue-400" : item.icon === "bus" ? "bg-emerald-400" : item.icon === "alert" ? "bg-amber-400" : item.icon === "driver" ? "bg-indigo-400" : item.icon === "complete" ? "bg-teal-400" : "bg-purple-400"}`} />
            </div>
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Active Routes Map View */}
      <SectionCard title="Active Routes" subtitle="Real-time vehicle positions across all active service corridors">
        <div className="relative h-64 w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
              <p className="mt-2 text-sm text-[var(--text-muted)]">Active routes map view</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{activeRoutesCount} active routes | {activeBusesCount} active buses</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Active Trip Operations */}
      <SectionCard title="Active Trip Operations" subtitle="All scheduled trips for today with live status controls">
        <TableCard
          headers={["Departure", "Route", "Bus", "Driver", "Service Type", "Status", "Dispatch Action", "Details"]}
          rows={todaysSchedules.map((trip) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                <div className="flex flex-col">
                  <span>{trip.departureTime}</span>
                  <span className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text-primary)]">{trip.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${trip.serviceType === "Express" ? "bg-indigo-100 text-indigo-700" : trip.serviceType === "Rural Service" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-700"}`}>
                  {trip.serviceType}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  aria-label={`Update status for ${trip.routeName}`}
                  value={trip.status}
                  onChange={(e) => handleUpdateTripStatus(trip, e.target.value as ScheduleItem["status"])}
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                >
                  {tripStatusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                {trip.status === "Scheduled" && (
                  <button type="button" onClick={() => handleDispatchTrip(trip)} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Dispatch</button>
                )}
                {trip.status === "Delayed" && (
                  <button type="button" onClick={() => setEmergencyAdjustmentOpen(true)} className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700">Mitigate</button>
                )}
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
    </div>
  );
}
