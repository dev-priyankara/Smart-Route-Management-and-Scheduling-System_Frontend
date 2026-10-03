"use client";

import { Fuel } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, TableCard } from "@/components/shell";
import type { FuelRecord } from "@/lib/mock-data";

interface Props {
  fuelRecords: FuelRecord[];
  setFuelModalOpen: (open: boolean) => void;
}

export function StaffFuelSection({ fuelRecords, setFuelModalOpen }: Props) {
  const totalLiters = fuelRecords.reduce((sum, r) => sum + r.fuelLiters, 0);
  const totalCost = fuelRecords.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Fuel Usage"
        subtitle="Log fuel consumption for depot vehicles"
        action={
          <PrimaryButton onClick={() => setFuelModalOpen(true)}>
            <Fuel className="mr-1.5 h-4 w-4" /> Record Fuel Usage
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Records</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{fuelRecords.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Fuel</div>
          <div className="text-3xl font-bold text-blue-600">{totalLiters} L</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Cost</div>
          <div className="text-3xl font-bold text-emerald-600">LKR {totalCost.toLocaleString()}</div>
        </div>
      </div>

      <SectionCard title="Fuel Log Records">
        <TableCard
          headers={["Date", "Bus No", "Route", "Fuel (L)", "Cost (LKR)", "Remarks"]}
          rows={fuelRecords.map((record) => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{record.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{record.route}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{record.fuelLiters} L</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">LKR {record.cost.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{record.remarks || "—"}</td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
