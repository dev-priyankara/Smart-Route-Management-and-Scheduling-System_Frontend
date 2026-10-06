"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import {
  Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard,
} from "@/components/shell";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: number; name: string; email: string; role: string;
  department: string; status: "Active" | "Inactive" | "Pending" | "Resigned"; lastLogin: string;
};

const ROLES = ["Administrator", "Supervisor", "Operational Staff"];
const DEPARTMENTS = ["Operations", "Maintenance", "Administration"];

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

const SEED_USERS: AdminUser[] = [
  { id: 1, name: "A. De Silva", email: "depot.admin@srmss.lk", role: "Supervisor", department: "Operations", status: "Active", lastLogin: "2026-10-03 08:15" },
  { id: 2, name: "K. Bandara", email: "depot.clerk@srmss.lk", role: "Operational Staff", department: "Operations", status: "Active", lastLogin: "2026-10-03 07:45" },
  { id: 3, name: "M. Perera", email: "m.perera@srmss.lk", role: "Supervisor", department: "Maintenance", status: "Active", lastLogin: "2026-10-02 16:30" },
  { id: 4, name: "S. Fernando", email: "s.fernando@srmss.lk", role: "Operational Staff", department: "Operations", status: "Inactive", lastLogin: "2026-09-28 14:20" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(SEED_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userModal, setUserModal] = useState<{ mode: "view" | "edit"; data: AdminUser } | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Supervisor", department: "Operations", status: "Active" as AdminUser["status"] });

  const openEditUser = (u: AdminUser) => {
    setUserForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status });
    setUserModal({ mode: "edit", data: u });
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModal?.data) return;
    setUsers(prev => prev.map(u => u.id === userModal.data.id ? { ...u, ...userForm } : u));
    setUserModal(null);
  };

  const filtered = useMemo(() =>
    users.filter(u => {
      const q = `${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(search.toLowerCase());
      const s = statusFilter === "all" ||
        (statusFilter === "active" && u.status === "Active") ||
        (statusFilter === "pending" && u.status === "Pending") ||
        (statusFilter === "resigned" && u.status === "Resigned");
      return q && s;
    }), [users, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Manage system users, roles and permissions" />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users", value: users.length, color: "text-[var(--text-primary)]" },
          { label: "Active", value: users.filter(u => u.status === "Active").length, color: "text-emerald-600" },
          { label: "Supervisors", value: users.filter(u => u.role === "Supervisor").length, color: "text-blue-600" },
          { label: "Resigned", value: users.filter(u => u.status === "Resigned").length, color: "text-rose-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="User Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search by name, email, role…" />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="resigned">Resigned</option>
          </select>
        </div>

        <TableCard
          headers={["Name", "Email", "Role", "Department", "Status", "Last Login", "Actions"]}
          rows={filtered.map(u => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{u.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
              <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{u.department}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  u.status === "Active" ? "bg-emerald-100 text-emerald-700"
                  : u.status === "Pending" ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-700"}`}>
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{u.lastLogin}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setUserModal({ mode: "view", data: u })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                    <Eye className="h-3.5 w-3.5" />View
                  </button>
                  <button type="button" onClick={() => openEditUser(u)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                    <PencilLine className="h-3.5 w-3.5" />Edit
                  </button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={userModal?.mode === "view"} title="User Details" onClose={() => setUserModal(null)}>
        {userModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">User</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{userModal.data.name}</div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${userModal.data.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                {userModal.data.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Email", userModal.data.email], ["Role", userModal.data.role], ["Department", userModal.data.department], ["Last Login", userModal.data.lastLogin]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="text-xs text-[var(--text-muted)]">{k}</div>
                  <div className="font-semibold text-[var(--text-primary)] break-all">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { if (userModal?.data) openEditUser(userModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button>
              <button type="button" onClick={() => setUserModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={userModal?.mode === "edit"} title="Edit User" onClose={() => setUserModal(null)}>
        <form onSubmit={saveUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Full Name</span>
              <input required value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Email</span>
              <input required type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Role</span>
              <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Department</span>
              <select value={userForm.department} onChange={e => setUserForm(f => ({ ...f, department: e.target.value }))} className={inputCls}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Status</span>
              <select value={userForm.status} onChange={e => setUserForm(f => ({ ...f, status: e.target.value as AdminUser["status"] }))} className={inputCls}>
                <option>Active</option><option>Inactive</option><option>Pending</option><option>Resigned</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setUserModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
