"use client";

import { useMemo, useState } from "react";
import { Plus, PencilLine, Trash2 } from "lucide-react";
import { AppShell, PageHeader, PrimaryButton, SearchField, SecondaryButton, StatusBadge, TableCard } from "@/components/shell";
import { fuelRecords, maintenanceRecords } from "@/lib/mock-data";

export default function FuelMaintenancePage() {
  const [tab, setTab] = useState<"Fuel Log" | "Maintenance Log">("Fuel Log");
  const [search, setSearch] = useState("");

  const filteredFuel = useMemo(() => fuelRecords.filter((record) => `${record.busNo} ${record.route}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const filteredMaintenance = useMemo(() => maintenanceRecords.filter((record) => `${record.vehicle} ${record.type}`.toLowerCase().includes(search.toLowerCase())), [search]);

  const totalFuel = fuelRecords.reduce((acc, item) => acc + item.fuelLiters, 0);
  const totalCost = fuelRecords.reduce((acc, item) => acc + item.cost, 0);
  const averageFuel = Math.round(totalFuel / fuelRecords.length);

  return (
    <AppShell title="Fuel & Maintenance" subtitle="Fuel usage and maintenance tracking for the network.">
      <PageHeader title="Fuel & Maintenance" subtitle="Operational record tracking" action={<PrimaryButton><Plus className="mr-2 h-4 w-4" /> Add Record</PrimaryButton>} />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["Fuel Log", "Maintenance Log"] as const).map((item) => (
          <button type="button" key={item} onClick={() => setTab(item)} className={`rounded-xl px-3 py-2 text-sm font-medium ${tab === item ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)]"}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-lg"><SearchField value={search} onChange={setSearch} placeholder={tab === "Fuel Log" ? "Search fuel records" : "Search maintenance logs"} /></div>
      </div>

      {tab === "Fuel Log" ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Total Fuel Consumption</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{totalFuel} L</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Total Fuel Cost</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">LKR {totalCost.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Average Fuel per Trip</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{averageFuel} L</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <TableCard
              headers={["Date", "Bus", "Route", "Fuel (L)", "Cost", "Remarks", "Actions"]}
              rows={filteredFuel.map((record) => (
                <>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{record.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.route}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.fuelLiters}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">LKR {record.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.remarks}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </>
              ))}
              emptyTitle="No fuel records found"
              emptyDescription="Try another search term."
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Scheduled Maintenance</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{maintenanceRecords.filter((record) => record.status === "Scheduled").length}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Completed</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{maintenanceRecords.filter((record) => record.status === "Completed").length}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Overdue</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{maintenanceRecords.filter((record) => record.status === "Overdue").length}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <TableCard
              headers={["Vehicle", "Maintenance Type", "Date", "Next Service", "Status", "Remarks", "Actions"]}
              rows={filteredMaintenance.map((record) => (
                <>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{record.vehicle}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.type}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.nextServiceDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.remarks}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </>
              ))}
              emptyTitle="No maintenance records found"
              emptyDescription="No maintenance task matches the current search."
            />
          </div>
        </>
      )}
    </AppShell>
  );
}
