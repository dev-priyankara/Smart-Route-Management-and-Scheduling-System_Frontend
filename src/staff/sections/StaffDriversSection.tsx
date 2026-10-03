"use client";

import { Eye, Phone } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { Driver } from "@/lib/mock-data";

interface Props {
  drivers: Driver[];
  setViewingDriver: (driver: Driver | null) => void;
}

export function StaffDriversSection({ drivers, setViewingDriver }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Driver Assignments" subtitle="View current driver roster, assignments and availability" />
      <SectionCard title="Driver Roster">
        <TableCard
          headers={["Driver Name", "License No", "Phone", "Assigned Route", "Working Hours", "Status", "Action"]}
          rows={drivers.map((driver) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{driver.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" /><span className="text-[var(--text-secondary)]">{driver.phone}</span></div>
              </td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.assignedRoute}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.workingHours}</td>
              <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
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
