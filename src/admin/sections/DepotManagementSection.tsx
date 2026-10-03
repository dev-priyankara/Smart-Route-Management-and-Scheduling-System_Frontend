"use client";

import { Eye, Plus, Settings } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, TableCard } from "@/components/shell";
import type { AdminSectionProps } from "../types";

type Props = Pick<AdminSectionProps, "mockDepots" | "showToast">;

export function DepotManagementSection({ mockDepots, showToast }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Depot Management"
        subtitle="Manage depot locations, assign managers, and monitor depot performance"
        action={
          <PrimaryButton onClick={() => showToast("Add depot feature coming soon")}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Depot
          </PrimaryButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Depots</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{mockDepots.length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Across the network</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Buses</div>
          <div className="text-3xl font-bold text-blue-600">{mockDepots.reduce((sum, d) => sum + d.buses, 0)}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Fleet distributed</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Staff</div>
          <div className="text-3xl font-bold text-emerald-600">{mockDepots.reduce((sum, d) => sum + d.staff, 0)}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Personnel deployed</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Active Depots</div>
          <div className="text-3xl font-bold text-emerald-600">{mockDepots.filter((d) => d.status === "Active").length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Operational depots</div>
        </div>
      </div>

      <SectionCard title="Depot Directory">
        <TableCard
          headers={["Depot Name", "Location", "Manager", "Buses", "Staff", "Status", "Actions"]}
          rows={mockDepots.map((depot) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{depot.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{depot.location}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{depot.manager}</td>
              <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{depot.buses}</td>
              <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{depot.staff}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${depot.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {depot.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </button>
                  <button type="button" onClick={() => showToast(`Managing depot: ${depot.name}`)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--panel)]">
                    <Settings className="h-3.5 w-3.5 mr-1" /> Manage
                  </button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
