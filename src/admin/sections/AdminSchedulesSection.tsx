"use client";

import { Eye } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { AdminSectionProps } from "../types";

type Props = Pick<AdminSectionProps, "schedules" | "setViewingTripDetails">;

export function AdminSchedulesSection({ schedules, setViewingTripDetails }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Timetable Management" subtitle="View and manage all scheduled trips across all depots" />
      <SectionCard title="Complete Timetable">
        <TableCard
          headers={["Date", "Departure Time", "Arrival Time", "Route Name", "Fleet Bus No", "Assigned Driver", "Service Type", "Status", "Action"]}
          rows={schedules.map((trip) => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.date}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.arrivalTime}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={trip.serviceType} /></td>
              <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingTripDetails(trip)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
