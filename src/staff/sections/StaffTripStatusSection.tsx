"use client";

import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { ScheduleItem } from "@/lib/mock-data";

const tripStatusOptions: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

interface Props {
  schedules: ScheduleItem[];
  handleUpdateTripStatus: (trip: ScheduleItem, status: ScheduleItem["status"]) => void;
}

export function StaffTripStatusSection({ schedules, handleUpdateTripStatus }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Update Trip Status" subtitle="Update departure and progress status for scheduled routes" />
      <SectionCard title="Today's Trip Status">
        <TableCard
          headers={["Date", "Departure", "Route", "Bus", "Driver", "Current Status", "Update Status"]}
          rows={schedules.map((trip) => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.date}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
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
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
