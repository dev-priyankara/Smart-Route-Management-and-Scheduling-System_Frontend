"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Phone, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { Driver as DriverRecord, driverData, busData, routeData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const DRIVER_STATUSES: DriverRecord["status"][] = ["On Duty", "Available", "Off Duty"];
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type DriverForm = {
  name: string; licenseNumber: string; phone: string;
  assignedRoute: string; workingHours: string; status: DriverRecord["status"];
  insuranceDate: string; assignedBusId: string;
};

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function DriversPage() {
  const { records: drivers, addRecord: addDriver, updateRecord: updateDriver, removeRecord: removeDriver } =
    usePersistentCollection("srmss-drivers", driverData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: DriverRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DriverRecord | null>(null);
  const [form, setForm] = useState<DriverForm>({ name: "", licenseNumber: "", phone: "", assignedRoute: "", workingHours: "06:00 - 14:00", status: "Available", insuranceDate: "", assignedBusId: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => {
    setForm({ name: "", licenseNumber: "", phone: "", assignedRoute: routes[0]?.name || "", workingHours: "06:00 - 14:00", status: "Available", insuranceDate: "", assignedBusId: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (d: DriverRecord) => {
    setForm({ name: d.name, licenseNumber: d.licenseNumber, phone: d.phone, assignedRoute: d.assignedRoute, workingHours: d.workingHours, status: d.status, insuranceDate: d.insuranceDate || "", assignedBusId: String(d.assignedBusId || "") });
    setModal({ mode: "edit", data: d });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.licenseNumber.trim()) return;
    const built = { name: form.name, licenseNumber: form.licenseNumber, phone: form.phone, assignedRoute: form.assignedRoute, workingHours: form.workingHours, status: form.status, insuranceDate: form.insuranceDate || undefined, assignedBusId: form.assignedBusId ? Number(form.assignedBusId) : undefined };
    if (modal?.mode === "add") { addDriver(built); showToast(`Driver ${form.name} added`); }
    else if (modal?.data) { updateDriver(modal.data.id, { ...modal.data, ...built }); showToast(`Driver ${form.name} updated`); }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeDriver(deleteTarget.id);
    showToast(`Driver ${deleteTarget.name} removed`);
    setDeleteTarget(null);
  };

  const onDuty = drivers.filter(d => d.status === "On Duty");
  const available = drivers.filter(d => d.status === "Available");
  const offDuty = drivers.filter(d => d.status === "Off Duty");

  const filtered = useMemo(() =>
    drivers.filter(d => {
      const q = `${d.name} ${d.licenseNumber} ${d.phone} ${d.assignedRoute} ${d.status}`.toLowerCase().includes(search.toLowerCase());
      const s = statusFilter === "All Status" || d.status === statusFilter;
      return q && s;
    }),
    [drivers, search, statusFilter]
  );

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="Driver Roster" subtitle="Add, edit, delete and manage all driver records"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Drivers", value: drivers.length, color: "text-[var(--text-primary)]" },
          { label: "On Duty", value: onDuty.length, color: "text-blue-600" },
          { label: "Available", value: available.length, color: "text-emerald-600" },
          { label: "Off Duty", value: offDuty.length, color: "text-slate-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Driver Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search name, license, phone, route…" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option>All Status</option>
            {DRIVER_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <TableCard
          headers={["ID", "Driver Name", "Phone", "License No", "Insurance Date", "Assigned Bus", "Assigned Route", "Shift Hours", "Status", "Actions"]}
          rows={filtered.map(d => (
            <>
              <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{d.id}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" /><span className="text-[var(--text-secondary)]">{d.phone}</span></div>
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.licenseNumber}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.insuranceDate || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find(b => b.id === d.assignedBusId)?.busNo ?? "—"}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.assignedRoute}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.workingHours}</td>
              <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: d })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(d)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(d)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Del</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={modal?.mode === "view"} title="Driver Profile" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase">Driver</div><div className="text-xl font-bold text-[var(--text-primary)]">{modal.data.name}</div></div>
              <StatusBadge status={modal.data.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["License No.", modal.data?.licenseNumber ?? "—"], ["Phone", modal.data?.phone ?? "—"], ["Insurance Date", modal.data?.insuranceDate || "—"], ["Assigned Bus", buses.find(b => b.id === modal.data?.assignedBusId)?.busNo ?? "—"], ["Assigned Route", modal.data?.assignedRoute ?? "—"], ["Working Hours", modal.data?.workingHours ?? "—"]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { if (modal?.data) openEdit(modal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button>
              <button type="button" onClick={() => setModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal open={modal?.mode === "add" || modal?.mode === "edit"}
        title={modal?.mode === "add" ? "Add New Driver" : "Edit Driver"}
        onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name"><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. S. Perera" /></Field>
            <Field label="License Number"><input required value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} className={inputCls} placeholder="e.g. B-1598" /></Field>
            <Field label="Phone Number"><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="077-xxx-xxxx" /></Field>
            <Field label="Insurance Expiry Date" required={false}><input type="date" value={form.insuranceDate} onChange={e => setForm(f => ({ ...f, insuranceDate: e.target.value }))} className={inputCls} /></Field>
            <Field label="Assigned Route"><select value={form.assignedRoute} onChange={e => setForm(f => ({ ...f, assignedRoute: e.target.value }))} className={inputCls}>{routes.map(r => <option key={r.id}>{r.name}</option>)}</select></Field>
            <Field label="Assigned Bus" required={false}><select value={form.assignedBusId} onChange={e => setForm(f => ({ ...f, assignedBusId: e.target.value }))} className={inputCls}><option value="">— Unassigned —</option>{buses.map(b => <option key={b.id} value={b.id}>{b.busNo} ({b.registration})</option>)}</select></Field>
            <Field label="Working Hours"><input value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} className={inputCls} placeholder="06:00 - 14:00" /></Field>
            <Field label="Status"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as DriverRecord["status"] }))} className={inputCls}>{DRIVER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{modal?.mode === "add" ? "Add Driver" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} title="Delete Driver" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">Delete driver <strong className="text-[var(--text-primary)]">{deleteTarget?.name}</strong> ({deleteTarget?.licenseNumber})? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete Driver</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
