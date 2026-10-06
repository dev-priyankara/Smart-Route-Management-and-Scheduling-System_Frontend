"use client";

import { useMemo, useState } from "react";
import { AppShell, PageHeader, SearchField, StatusBadge, TableCard } from "@/components/shell";
import { ScheduleItem, scheduleData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const statusOptions: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

export default function TripStatusPage() {
  const { records, updateRecord } = usePersistentCollection("srmss-schedules", scheduleData);
  const [search, setSearch] = useState("");

  const filteredTrips = useMemo(() => records
    .filter((trip) => `${trip.routeName} ${trip.busNo} ${trip.driver} ${trip.status} ${trip.date}`.toLowerCase().includes(search.toLowerCase()))
    .sort((first, second) => `${first.date} ${first.departureTime}`.localeCompare(`${second.date} ${second.departureTime}`)), [records, search]);

  const updateStatus = (trip: ScheduleItem, status: ScheduleItem["status"]) => {
    const { id, ...record } = trip;
    updateRecord(id, { ...record, status });
  };

  return (
    <AppShell title="Trip Status" subtitle="Update day-to-day departure progress">
      <PageHeader title="Trip Status Updates" subtitle="Select a status to apply it to the saved schedule immediately" />
      <div className="mb-5 max-w-xl"><SearchField value={search} onChange={setSearch} placeholder="Search route, bus, driver, date or status" /></div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
        <TableCard
          headers={["Date", "Departure", "Route", "Bus", "Driver", "Current Status", "Update Status"]}
          rows={filteredTrips.map((trip) => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.date}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.departureTime}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
              <td className="px-4 py-3">
                <label className="sr-only" htmlFor={`trip-status-${trip.id}`}>Update {trip.routeName} status</label>
                <select id={`trip-status-${trip.id}`} value={trip.status} onChange={(event) => updateStatus(trip, event.target.value as ScheduleItem["status"])} className="min-w-36 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
            </>
          ))}
          emptyTitle="No trips found"
          emptyDescription="Try another search or add a trip in schedules."
        />
      </div>
    </AppShell>
  );
}
