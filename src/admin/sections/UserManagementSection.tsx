"use client";

import { Eye, PencilLine, Search } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { useState } from "react";
import type { AdminUser } from "../types";

type Props = {
  mockUsers: AdminUser[];
  showToast: (msg: string) => void;
};

export function UserManagementSection({ mockUsers, showToast }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "resigned">("all");

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch = `${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.status === "Active") ||
      (statusFilter === "pending" && u.status === "Pending") ||
      (statusFilter === "resigned" && u.status === "Resigned");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and permissions"
      />

      {/* User Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: mockUsers.length, color: "text-[var(--text-primary)]" },
          { label: "Active", value: mockUsers.filter((u) => u.status === "Active").length, color: "text-emerald-600" },
          { label: "Supervisors", value: mockUsers.filter((u) => u.role === "Supervisor").length, color: "text-blue-600" },
          { label: "Resigned", value: mockUsers.filter((u) => u.status === "Resigned").length, color: "text-rose-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="User Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] pl-10 pr-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
          </div>
          <div className="min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "pending" | "resigned")}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="resigned">Resigned</option>
            </select>
          </div>
        </div>
        <TableCard
          headers={["Name", "Email", "Role", "Department", "Status", "Last Login", "Actions"]}
          rows={filteredUsers.map((user) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{user.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
              <td className="px-4 py-3"><StatusBadge status={user.role} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{user.department}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : user.status === "Pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-200 text-slate-700"
                }`}>{user.status}</span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{user.lastLogin}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast(`Viewing: ${user.name}`)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`Editing: ${user.name}`)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  >
                    <PencilLine className="h-3.5 w-3.5 mr-1" /> Edit
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
