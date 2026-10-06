"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "Administrator" | "Supervisor" | "Operational Staff";
  department: string;
  status: "Active" | "Inactive" | "Pending" | "Resigned";
  phone: string;
  lastLogin: string;
};

const ROLES: AdminUser["role"][] = ["Administrator", "Supervisor", "Operational Staff"];
const DEPARTMENTS = ["Operations", "Maintenance", "Administration"];
const STATUSES: AdminUser["status"][] = ["Active", "Inactive", "Pending", "Resigned"];

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

const SEED: AdminUser[] = [
  { id: 1, name: "A. De Silva", email: "depot.admin@srmss.lk", role: "Supervisor", department: "Operations", status: "Active", phone: "071-234-5678", lastLogin: "2026-10-03 08:15" },
  { id: 2, name: "K. Bandara", email: "depot.clerk@srmss.lk", role: "Operational Staff", department: "Operations", status: "Active", phone: "077-345-6789", lastLogin: "2026-10-03 07:45" },
  { id: 3, name: "M. Perera", email: "m.perera@srmss.lk", role: "Supervisor", department: "Maintenance", status: "Active", phone: "076-456-7890", lastLogin: "2026-10-02 16:30" },
  { id: 4, name: "S. Fernando", email: "s.fernando@srmss.lk", role: "Operational Staff", department: "Operations", status: "Inactive", phone: "070-567-8901", lastLogin: "2026-09-28 14:20" },
  { id: 5, name: "R. Jayasinghe", email: "r.jayasinghe@srmss.lk", role: "Administrator", department: "Administration", status: "Active", phone: "078-678-9012", lastLogin: "2026-10-03 09:00" },
];

type FormState = {
  name: string; email: string; role: AdminUser["role"];
  department: string; status: AdminUser["status"]; phone: string;
};

const emptyForm: FormState = { name: "", email: "", role: "Operational Staff", department: "Operations", status: "Active", phone: "" };

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(SEED);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: AdminUser } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (u: AdminUser) => {
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status, phone: u.phone });
    setModal({ mode: "edit", data: u });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return;
    if (modal?.mode === "add") {
      const newId = Math.max(0, ...users.map(u => u.id)) + 1;
      setUsers(p => [...p, { id: newId, ...form, lastLogin: "Never" }]);
      showToast(`User ${form.name} created successfully`);
    } else if (modal?.data) {
      setUsers(p => p.map(u => u.id === modal.data!.id ? { ...u, ...form } : u));
      showToast(`User ${form.name} updated`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers(p => p.filter(u => u.id !== deleteTarget.id));
    showToast(`User ${deleteTarget.name} removed`);
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    users.filter(u => {
      const q = `${u.name} ${u.email} ${u.role} ${u.department} ${u.phone}`.toLowerCase().includes(search.toLowerCase());
      const r = roleFilter === "All Roles" || u.role === roleFilter;
      const s = statusFilter === "All Status" || u.status === statusFilter;
      return q && r && s;
    }),
    [users, search, roleFilter, statusFilter]
  );

  const stats = [
    { label: "Total Users", value: users.length, color: "text-[var(--text-primary)]" },
    { label: "Active", value: users.filter(u => u.status === "Active").length, color: "text-emerald-600" },
    { label: "Administrators", value: users.filter(u => u.role === "Administrator").length, color: "text-violet-600" },
    { label: "Supervisors", value: users.filter(u => u.role === "Supervisor").length, color: "text-blue-600" },
    { label: "Operational Staff", value: users.filter(u => u.role === "Operational Staff").length, color: "text-amber-600" },
    { label: "Inactive / Resigned", value: users.filter(u => u.status === "Inactive" || u.status === "Resigned").length, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="User Management" subtitle="Create and manage system user accounts across all roles"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Add User
          </button>
        }
      />

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <SectionCard title="User Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search name, email, role…" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by role">
            <option>All Roles</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option>All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <TableCard
          headers={["Name", "Email", "Phone", "Role", "Department", "Status", "Last Login", "Actions"]}
          rows={filtered.map(u => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{u.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{u.phone || "—"}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  u.role === "Administrator" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                  : u.role === "Supervisor" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                }`}>{u.role}</span>
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{u.department}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  u.status === "Active" ? "bg-emerald-100 text-emerald-700"
                  : u.status === "Pending" ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-600"
                }`}>{u.status}</span>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{u.lastLogin}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: u })}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                    <Eye className="h-3.5 w-3.5" />View
                  </button>
                  <button type="button" onClick={() => openEdit(u)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    <PencilLine className="h-3.5 w-3.5" />Edit
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(u)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400">
                    <Trash2 className="h-3.5 w-3.5" />Delete
                  </button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={modal?.mode === "view"} title="User Details" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">User Account</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{modal.data.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">{modal.data.email}</div>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                modal.data.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}>{modal.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Phone", modal.data.phone || "—"], ["Role", modal.data.role], ["Department", modal.data.department], ["Last Login", modal.data.lastLogin]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="text-xs text-[var(--text-muted)]">{k}</div>
                  <div className="font-semibold text-[var(--text-primary)]">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => openEdit(modal.data!)}
                className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button>
              <button type="button" onClick={() => setModal(null)}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal open={modal?.mode === "add" || modal?.mode === "edit"}
        title={modal?.mode === "add" ? "Create New User" : "Edit User"}
        onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Amal Perera" />
            </Field>
            <Field label="Email Address">
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="user@srmss.lk" />
            </Field>
            <Field label="Phone Number" required={false}>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="077-xxx-xxxx" />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminUser["role"] }))} className={inputCls}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={inputCls}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AdminUser["status"] }))} className={inputCls}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">
              {modal?.mode === "add" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} title="Delete User" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete User</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
