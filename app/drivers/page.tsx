"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2, Users } from "lucide-react";
import { AppShell, Modal, PageHeader, PrimaryButton, SearchField, SecondaryButton, StatusBadge, TableCard } from "@/components/shell";
import { driverData } from "@/lib/mock-data";

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDriver, setSelectedDriver] = useState<(typeof driverData)[number] | null>(null);

  const filteredDrivers = useMemo(() => {
    return driverData.filter((driver) => {
      const matchesSearch = `${driver.name} ${driver.licenseNumber} ${driver.assignedRoute}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <AppShell title="Drivers" subtitle="Driver roster, assignments and working state.">
      <PageHeader title="Driver Management" subtitle="Staff availability and route coverage" action={<PrimaryButton><Plus className="mr-2 h-4 w-4" /> Add Driver</PrimaryButton>} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-lg"><SearchField value={search} onChange={setSearch} placeholder="Search drivers" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
          <option value="All">All statuses</option>
          <option value="On Duty">On Duty</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Available">Available</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Users className="h-5 w-5" /></div>
              <StatusBadge status={driver.status} />
            </div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">{driver.name}</div>
            <div className="mt-1 text-sm text-[var(--text-muted)]">{driver.assignedRoute}</div>
            <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between"><span>License</span><span className="font-medium text-[var(--text-primary)]">{driver.licenseNumber}</span></div>
              <div className="flex items-center justify-between"><span>Phone</span><span className="font-medium text-[var(--text-primary)]">{driver.phone}</span></div>
              <div className="flex items-center justify-between"><span>Hours</span><span className="font-medium text-[var(--text-primary)]">{driver.workingHours}</span></div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedDriver(driver)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View details"><Eye className="h-4 w-4" /></button>
              <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit"><PencilLine className="h-4 w-4" /></button>
              <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
        <TableCard
          headers={["Name", "License No.", "Phone", "Assigned Route", "Working Hours", "Status", "Actions"]}
          rows={filteredDrivers.map((driver) => (
            <>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.phone}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.assignedRoute}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.workingHours}</td>
              <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedDriver(driver)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><Eye className="h-4 w-4" /></button>
                  <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                  <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </>
          ))}
          emptyTitle="No drivers found"
          emptyDescription="No driver profile matches the current filter."
        />
      </div>

      <Modal open={Boolean(selectedDriver)} title="Driver Details" onClose={() => setSelectedDriver(null)}>
        {selectedDriver && (
          <div className="space-y-4 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Full name</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>License validity</span>
              <span className="font-semibold text-[var(--text-primary)]">Valid until 2028</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Contact number</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.phone}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Assigned route</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.assignedRoute}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Working hours</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.workingHours}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Current status</span>
              <StatusBadge status={selectedDriver.status} />
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
