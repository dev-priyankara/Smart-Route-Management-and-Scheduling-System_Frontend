"use client";

import { useMemo, useState } from "react";
import { Bus, PencilLine, Plus, Trash2, Eye } from "lucide-react";
import { AppShell, PageHeader, PrimaryButton, SearchField, SecondaryButton, StatusBadge, TableCard } from "@/components/shell";
import { busData } from "@/lib/mock-data";

export default function BusesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredBuses = useMemo(() => {
    return busData.filter((bus) => {
      const matchesSearch = `${bus.busNo} ${bus.registration}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || bus.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <AppShell title="Buses" subtitle="Vehicle fleet inventory and service state.">
      <PageHeader title="Vehicle Management" subtitle="Bus and fleet overview" action={<PrimaryButton><Plus className="mr-2 h-4 w-4" /> Add Vehicle</PrimaryButton>} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-lg"><SearchField value={search} onChange={setSearch} placeholder="Search buses" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="In Service">In Service</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBuses.map((bus) => (
          <div key={bus.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Bus className="h-6 w-6" /></div>
              <StatusBadge status={bus.status} />
            </div>
            <div className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{bus.busNo}</div>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between"><span>Registration</span><span className="font-medium text-[var(--text-primary)]">{bus.registration}</span></div>
              <div className="flex items-center justify-between"><span>Capacity</span><span className="font-medium text-[var(--text-primary)]">{bus.seatingCapacity}</span></div>
              <div className="flex items-center justify-between"><span>Mileage</span><span className="font-medium text-[var(--text-primary)]">{bus.mileage.toLocaleString()} km</span></div>
            </div>
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Maintenance</div>
              <div className="text-sm text-[var(--text-secondary)]">{bus.maintenanceHistory[0] ?? "No recent maintenance"}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View"><Eye className="h-4 w-4" /></button>
              <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit"><PencilLine className="h-4 w-4" /></button>
              <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
        <TableCard
          headers={["Bus Number", "Registration", "Capacity", "Mileage", "Status", "Maintenance", "Actions"]}
          rows={filteredBuses.map((bus) => (
            <>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{bus.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.registration}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.seatingCapacity}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.mileage.toLocaleString()}</td>
              <td className="px-4 py-3"><StatusBadge status={bus.status} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.maintenanceHistory[0]}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><Eye className="h-4 w-4" /></button>
                  <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                  <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </>
          ))}
          emptyTitle="No buses found"
          emptyDescription="No fleet entries match your current search or filter."
        />
      </div>
    </AppShell>
  );
}
