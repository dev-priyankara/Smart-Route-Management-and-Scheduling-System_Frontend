"use client";

import { Wrench } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { MaintenanceRecord } from "@/lib/mock-data";

interface Props {
  maintenanceRecords: MaintenanceRecord[];
  setMaintenanceModalOpen: (open: boolean) => void;
}

export function StaffMaintenanceSection({ maintenanceRecords, setMaintenanceModalOpen }: Props) {
  const overdue = maintenanceRecords.filter((r) => r.status === "Overdue");
  const scheduled = maintenanceRecords.filter((r) => r.status === "Scheduled");
  const completed = maintenanceRecords.filter((r) => r.status === "Completed");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Maintenance Activity"
        subtitle="Log vehicle maintenance and service records"
        action={
          <PrimaryButton onClick={() => setMaintenanceModalOpen(true)}>
            <Wrench className="mr-1.5 h-4 w-4" /> Record Maintenance
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Overdue</div>
          <div className="text-3xl font-bold text-rose-600">{overdue.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Scheduled</div>
          <div className="text-3xl font-bold text-amber-600">{scheduled.length}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Completed</div>
          <div className="text-3xl font-bold text-emerald-600">{completed.length}</div>
        </div>
      </div>

      <SectionCard title="Maintenance Records">
        <TableCard
          headers={["Vehicle", "Type", "Service Date", "Next Service", "Status", "Remarks"]}
          rows={maintenanceRecords.map((record) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{record.vehicle}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{record.type}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{record.nextServiceDate}</td>
              <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{record.remarks || "—"}</td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
