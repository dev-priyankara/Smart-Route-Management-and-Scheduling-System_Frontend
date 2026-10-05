"use client";

import { Eye, Phone } from "lucide-react";
import { PageHeader, SectionCard, TableCard, StatusBadge } from "@/components/shell";
import type { AdminSectionProps } from "../types";

type Props = Pick<
  AdminSectionProps,
  "drivers" | "driverStatusData" | "buses" | "setViewingDriver"
>;

export function AdminDriversSection({ drivers, driverStatusData, buses, setViewingDriver }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Roster"
        subtitle="Review driver roster, contact information, and assignments"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {driverStatusData.map((item) => (
          <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">{item.name}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Driver Directory">
        <TableCard
          headers={["Driver ID", "Driver Name", "Phone", "License No", "Insurance Date", "Assigned Bus", "Assigned Route", "Status", "Actions"]}
          rows={drivers.map((driver) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{driver.id}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{driver.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">{driver.phone}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.insuranceDate || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find((b) => b.id === driver.assignedBusId)?.busNo ?? "—"}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.assignedRoute}</td>
              <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingDriver(driver)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
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
