"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { MaintenanceRecord, busData, maintenanceRecords } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const MAINT_TYPES = ["Routine Maintenance", "Corrective Maintenance"] as const;
const MAINT_STATUSES = ["Scheduled", "Completed", "Overdue"] as const;
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type MaintForm = { vehicle: string; type: typeof MAINT_TYPES[number]; date: string; nextServiceDate: string; status: typeof MAINT_STATUSES[number]; remarks: string };

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function MaintenancePage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { records: maintenance, addRecord: addMaint, updateRecord: updateMaint, removeRecord: removeMaint } =
    usePersistentCollection("srmss-maintenance", maintenanceRecords);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: MaintenanceRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);
  const [form, setForm] = useState<MaintForm>({ vehicle: buses[0]?.busNo || "", type: "Routine Maintenance", date: todayStr, nextServiceDate: "", status: "Scheduled", remarks: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => {
    setForm({ vehicle: buses[0]?.busNo || "", type: "Routine Maintenance", date: todayStr, nextServiceDate: "", status: "Scheduled", remarks: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (m: MaintenanceRecord) => {
    setForm({ vehicle: m.vehicle, type: m.type, date: m.date, nextServiceDate: m.nextServiceDate, status: m.status as typeof MAINT_STATUSES[number], remarks: m.remarks });
    setModal({ mode: "edit", data: m });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle || !form.date) return;
    const built = { vehicle: form.vehicle, type: form.type, date: form.date, nextServiceDate: form.nextServiceDate || form.date, status: form.status as MaintenanceRecord["status"], remarks: form.remarks };
    if (modal?.mode === "add") { addMaint(built); showToast("Maintenance record added"); }
    else if (modal?.data) { updateMaint(modal.data.id, { ...modal.data, ...built }); showToast("Maintenance record updated"); }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeMaint(deleteTarget.id);
    showToast("Maintenance record deleted");
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    maintenance.filter(m => {
      const q = `${m.vehicle} ${m.type} ${m.status} ${m.remarks}`.toLowerCase().includes(search.toLowerCase());
      const s = statusFilter === "All Status" || m.status === statusFilter;
      return q && s;
    }),
    [maintenance, search, statusFilter]
  );

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="Maintenance Records" subtitle="View and manage all vehicle maintenance activities"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Add Record
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Overdue", value: maintenance.filter(m => m.status === "Overdue").length, color: "text-rose-600", bg: "border-rose-200 bg-rose-50/60 dark:border-rose-400/20 dark:bg-rose-500/10" },
          { label: "Scheduled", value: maintenance.filter(m => m.status === "Scheduled").length, color: "text-amber-600", bg: "border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-500/10" },
          { label: "Completed", value: maintenance.filter(m => m.status === "Completed").length, color: "text-emerald-600", bg: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-500/10" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Maintenance Log">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search vehicle, type, status…" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option>All Status</option>
            {MAINT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <TableCard
          headers={["Vehicle", "Type", "Service Date", "Next Service", "Status", "Remarks", "Actions"]}
          rows={filtered.map(m => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{m.vehicle}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{m.type}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{m.date}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{m.nextServiceDate}</td>
              <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)] max-w-[160px] truncate">{m.remarks || "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: m })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(m)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(m)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Del</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View */}
      <Modal open={modal?.mode === "view"} title="Maintenance Details" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase">Vehicle</div><div className="text-xl font-bold text-[var(--text-primary)]">{modal.data.vehicle}</div></div>
              <StatusBadge status={modal.data.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Type", modal.data.type], ["Service Date", modal.data.date], ["Next Service", modal.data.nextServiceDate], ["Remarks", modal.data.remarks || "—"]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end"><button type="button" onClick={() => setModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>

      {/* Add/Edit */}
      <Modal open={modal?.mode === "add" || modal?.mode === "edit"} title={modal?.mode === "add" ? "Add Maintenance Record" : "Edit Maintenance Record"} onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Vehicle"><select value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))} className={inputCls}>{buses.map(b => <option key={b.id}>{b.busNo}</option>)}</select></Field>
            <Field label="Maintenance Type"><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof MAINT_TYPES[number] }))} className={inputCls}>{MAINT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Service Date"><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></Field>
            <Field label="Next Service Date" required={false}><input type="date" value={form.nextServiceDate} onChange={e => setForm(f => ({ ...f, nextServiceDate: e.target.value }))} className={inputCls} /></Field>
            <Field label="Status"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof MAINT_STATUSES[number] }))} className={inputCls}>{MAINT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <Field label="Remarks" required={false}><input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className={inputCls} placeholder="Optional notes about this service" /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{modal?.mode === "add" ? "Add Record" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <Modal open={!!deleteTarget} title="Delete Maintenance Record" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">Delete maintenance record for <strong>{deleteTarget?.vehicle}</strong> ({deleteTarget?.date})? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
