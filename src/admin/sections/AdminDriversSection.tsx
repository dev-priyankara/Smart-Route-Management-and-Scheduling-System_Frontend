"use client";

import { Eye, Phone, Users } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, TableCard } from "@/components/shell";
import type { Driver } from "@/lib/mock-data";
import type { AdminSectionProps } from "../types";

type Props = Pick<
  AdminSectionProps,
  "drivers" | "driverStatusData" | "updateDriver" | "setViewingDriver" | "setDriverAssignmentOpen"
>;

export function AdminDriversSection({ drivers, driverStatusData, updateDriver, setViewingDriver, setDriverAssignmentOpen }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Roster & Duty Management"
        subtitle="Review driver duty roster, contact information, assigned corridors, and working shifts"
        action={
          <PrimaryButton onClick={() => setDriverAssignmentOpen(true)}>
            <Users className="mr-1.5 h-4 w-4" /> Update Driver Status
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {driverStatusData.map((item) => (
          <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">{item.name}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Driver Roster & Assignments">
        <TableCard
          headers={["Driver Name", "License No", "Contact Phone", "Assigned Corridor", "Working Shift Hours", "Duty Status", "Action"]}
          rows={drivers.map((driver) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{driver.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">{driver.phone}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.assignedRoute}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.workingHours}</td>
              <td className="px-4 py-3">
                <select
                  aria-label={`Update status for ${driver.name}`}
                  value={driver.status}
                  onChange={(e) => updateDriver(driver.id, { ...driver, status: e.target.value as Driver["status"] })}
                  className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Available">Available</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingDriver(driver)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
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
