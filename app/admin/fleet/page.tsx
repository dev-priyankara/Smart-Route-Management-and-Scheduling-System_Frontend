"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { Bus as BusRecord, busData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const BUS_STATUSES: BusRecord["status"][] = ["Active", "In Service", "Under Maintenance", "Out of Service"];
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type BusForm = { busNo: string; registration: string; seatingCapacity: string; mileage: string; status: BusRecord["status"]; maintenanceNote: string };
const emptyForm: BusForm = { busNo: "", registration: "", seatingCapacity: "44", mileage: "0", status: "Active", maintenanceNote: "" };

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function FleetPage() {
  const { records: buses, addRecord: addBus, updateRecord: updateBus, removeRecord: removeBus } =
    usePersistentCollection("srmss-buses", busData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: BusRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusRecord | null>(null);
  const [form, setForm] = useState<BusForm>(emptyForm);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setForm(emptyForm); setModal({ mode: "add" }); };
  const openEdit = (b: BusRecord) => {
    setForm({ busNo: b.busNo, registration: b.registration, seatingCapacity: String(b.seatingCapacity), mileage: String(b.mileage), status: b.status, maintenanceNote: b.maintenanceHistory[0] || "" });
    setModal({ mode: "edit", data: b });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.busNo.trim() || !form.registration.trim()) return;
    const built = { busNo: form.busNo, registration: form.registration, seatingCapacity: Number(form.seatingCapacity), mileage: Number(form.mileage), status: form.status, maintenanceHistory: form.maintenanceNote ? [form.maintenanceNote] : [] };
    if (modal?.mode === "add") { addBus(built); showToast(`Bus ${form.busNo} added successfully`); }
    else if (modal?.data) { updateBus(modal.data.id, { ...modal.data, ...built }); showToast(`Bus ${form.busNo} updated`); }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeBus(deleteTarget.id);
    showToast(`Bus ${deleteTarget.busNo} removed`);
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    buses.filter(b => {
      const q = `${b.busNo} ${b.registration} ${b.status}`.toLowerCase().includes(search.toLowerCase());
      const s = statusFilter === "All Status" || b.status === statusFilter;
      return q && s;
    }),
    [buses, search, statusFilter]
  );

  const activeBuses = buses.filter(b => b.status === "Active" || b.status === "In Service");

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="Vehicle Fleet Management" subtitle="Add, edit, delete and monitor all depot buses"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Add Bus
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Fleet", value: buses.length, color: "text-[var(--text-primary)]" },
          { label: "Active / In Service", value: activeBuses.length, color: "text-emerald-600" },
          { label: "Under Maintenance", value: buses.filter(b => b.status === "Under Maintenance").length, color: "text-amber-600" },
          { label: "Out of Service", value: buses.filter(b => b.status === "Out of Service").length, color: "text-rose-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Fleet Roster">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search bus no, registration…" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option>All Status</option>
            {BUS_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <TableCard
          headers={["Bus No", "Registration", "Capacity", "Mileage (km)", "Status", "Maintenance Note", "Actions"]}
          rows={filtered.map(b => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{b.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{b.registration}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{b.seatingCapacity} seats</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{b.mileage.toLocaleString()} km</td>
              <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)] max-w-[180px] truncate">{b.maintenanceHistory[0] || "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: b })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(b)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(b)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Del</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={modal?.mode === "view"} title="Bus Details" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase">Fleet No</div><div className="text-xl font-bold text-[var(--text-primary)]">{modal.data.busNo}</div></div>
              <StatusBadge status={modal.data.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Registration", modal.data.registration], ["Seating Capacity", `${modal.data.seatingCapacity} seats`], ["Mileage", `${modal.data.mileage.toLocaleString()} km`], ["Status", modal.data.status]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            {modal.data.maintenanceHistory.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)] mb-2">Maintenance History</div>
                {modal.data.maintenanceHistory.map((h, i) => <div key={i} className="text-xs text-[var(--text-secondary)]">• {h}</div>)}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { if (modal?.data) openEdit(modal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button>
              <button type="button" onClick={() => setModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal open={modal?.mode === "add" || modal?.mode === "edit"}
        title={modal?.mode === "add" ? "Add New Bus" : "Edit Bus"}
        onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fleet / Bus No"><input required value={form.busNo} onChange={e => setForm(f => ({ ...f, busNo: e.target.value }))} className={inputCls} placeholder="e.g. NP-2201" /></Field>
            <Field label="Registration No."><input required value={form.registration} onChange={e => setForm(f => ({ ...f, registration: e.target.value }))} className={inputCls} placeholder="e.g. CAB-1456" /></Field>
            <Field label="Seating Capacity"><input type="number" min="1" value={form.seatingCapacity} onChange={e => setForm(f => ({ ...f, seatingCapacity: e.target.value }))} className={inputCls} /></Field>
            <Field label="Mileage (km)"><input type="number" min="0" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} className={inputCls} /></Field>
            <Field label="Status"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as BusRecord["status"] }))} className={inputCls}>{BUS_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <Field label="Maintenance Note" required={false}><input value={form.maintenanceNote} onChange={e => setForm(f => ({ ...f, maintenanceNote: e.target.value }))} className={inputCls} placeholder="e.g. Oil filter replaced (2026-09-15)" /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{modal?.mode === "add" ? "Add Bus" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} title="Delete Bus" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">Delete bus <strong className="text-[var(--text-primary)]">{deleteTarget?.busNo}</strong> ({deleteTarget?.registration})? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete Bus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
