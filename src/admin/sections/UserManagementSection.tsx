"use client";

import { Eye, Plus, Trash2 } from "lucide-react";
import { PageHeader, PrimaryButton, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { AdminSectionProps } from "../types";

type Props = Pick<AdminSectionProps, "mockUsers" | "showToast" | "setAddUserOpen">;

export function UserManagementSection({ mockUsers, showToast, setAddUserOpen }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and permissions"
        action={
          <PrimaryButton onClick={() => setAddUserOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New User
          </PrimaryButton>
        }
      />

      {/* User Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Users</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{mockUsers.length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Registered accounts</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Active Users</div>
          <div className="text-3xl font-bold text-emerald-600">{mockUsers.filter((u) => u.status === "Active").length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Currently active</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Supervisors</div>
          <div className="text-3xl font-bold text-blue-600">{mockUsers.filter((u) => u.role === "Supervisor").length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Depot supervisors</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Operational Staff</div>
          <div className="text-3xl font-bold text-amber-600">{mockUsers.filter((u) => u.role === "Operational Staff").length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Depot clerks</div>
        </div>
      </div>

      <SectionCard title="Registered Users">
        <TableCard
          headers={["Name", "Email", "Role", "Department", "Status", "Last Login", "Actions"]}
          rows={mockUsers.map((user) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{user.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
              <td className="px-4 py-3"><StatusBadge status={user.role} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{user.department}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{user.lastLogin}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button type="button" className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </button>
                  <button type="button" onClick={() => showToast(`User ${user.name} removed`)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
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
