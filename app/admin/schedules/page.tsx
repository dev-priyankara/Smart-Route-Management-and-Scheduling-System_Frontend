"use client";

import { useState } from "react";
import { PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { ScheduleItem, scheduleData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

export default function SchedulesPage() {
  const { records: schedules } = usePersistentCollection("srmss-schedules", scheduleData);
  const [search, setSearch] = useState("");

  const filtered = schedules.filter(s =>
    `${s.routeName} ${s.busNo} ${s.driver} ${s.date} ${s.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" subtitle="View all scheduled trips across all depots" />
      <SectionCard title="Complete Timetable">
        <div className="mb-4 max-w-sm">
          <SearchField value={search} onChange={setSearch} placeholder="Search route, bus, driver, date…" />
        </div>
        <TableCard
          headers={["Date", "Departure", "Arrival", "Route", "Bus", "Driver", "Type", "Status"]}
          rows={filtered.map(s => (
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
