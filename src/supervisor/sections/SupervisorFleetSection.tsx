"use client";

import { Download, Eye } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { Bus } from "@/lib/mock-data";

interface StatusItem { name: string; value: number; color: string; }

interface Props {
  buses: Bus[];
  fleetStatusData: StatusItem[];
  showToast: (msg: string) => void;
  setViewingBus: (bus: Bus | null) => void;
}

export function SupervisorFleetSection({ buses, fleetStatusData, showToast, setViewingBus }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Fleet Management"
        subtitle="Fleet coordination, maintenance state tracking, and operational readiness"
        action={
          <PrimaryButton onClick={() => showToast("Fleet export initiated for PDF report.")}>
            <Download className="mr-1.5 h-4 w-4" /> Export Fleet Report
          </PrimaryButton>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fleetStatusData.map((item) => (
          <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">{item.name}</div>
          </div>
        ))}
      </div>
      <SectionCard title="Depot Bus Fleet Availability Roster">
        <TableCard
          headers={["Bus Fleet No", "Registration", "Seating Capacity", "Mileage (km)", "Operational Status", "Maintenance History Note", "Action"]}
          rows={buses.map((bus) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{bus.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.registration}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.seatingCapacity} Seats</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.mileage.toLocaleString()} km</td>
              <td className="px-4 py-3"><StatusBadge status={bus.status} /></td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{bus.maintenanceHistory[0] || "None"}</td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingBus(bus)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" /> Inspect Specs
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
