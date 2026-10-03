"use client";

import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { ScheduleItem } from "@/lib/mock-data";

interface Props {
  schedules: ScheduleItem[];
}

export function StaffSchedulesSection({ schedules }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="View Schedules" subtitle="Review all planned departures and timetable entries" />
      <SectionCard title="Full Schedule Timetable">
        <TableCard
          headers={["Date", "Departure", "Arrival", "Route", "Bus", "Driver", "Service Type", "Status"]}
          rows={schedules.map((s) => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.date}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{s.departureTime}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.arrivalTime}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{s.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={s.serviceType} /></td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
