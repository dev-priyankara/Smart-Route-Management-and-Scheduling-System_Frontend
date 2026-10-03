"use client";

import { Eye } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { Bus } from "@/lib/mock-data";

interface Props {
  buses: Bus[];
  setViewingBus: (bus: Bus | null) => void;
}

export function StaffBusesSection({ buses, setViewingBus }: Props) {
  const available = buses.filter((b) => b.status === "Active" || b.status === "In Service");
  const unavailable = buses.filter((b) => b.status === "Under Maintenance" || b.status === "Out of Service");

  return (
    <div className="space-y-6">
      <PageHeader title="Bus Availability" subtitle="Check current availability status of all depot vehicles" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Fleet</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{buses.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Available</div>
          <div className="text-3xl font-bold text-emerald-600">{available.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Unavailable</div>
          <div className="text-3xl font-bold text-rose-600">{unavailable.length}</div>
        </div>
      </div>

      <SectionCard title="Fleet Availability Roster">
        <TableCard
          headers={["Bus No", "Registration", "Seating Capacity", "Mileage", "Status", "Action"]}
          rows={buses.map((bus) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{bus.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.registration}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.seatingCapacity} seats</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.mileage.toLocaleString()} km</td>
              <td className="px-4 py-3"><StatusBadge status={bus.status} /></td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingBus(bus)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" /> Details
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
