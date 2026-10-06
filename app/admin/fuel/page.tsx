"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, TableCard } from "@/components/shell";
import { FuelRecord, busData, fuelRecords, routeData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type FuelForm = { date: string; busNo: string; route: string; fuelLiters: string; cost: string; remarks: string };

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function FuelPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { records: fuel, addRecord: addFuel, updateRecord: updateFuel, removeRecord: removeFuel } =
    usePersistentCollection("srmss-fuel-records", fuelRecords);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: FuelRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FuelRecord | null>(null);
  const [form, setForm] = useState<FuelForm>({ date: todayStr, busNo: "", route: "", fuelLiters: "", cost: "", remarks: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => {
    setForm({ date: todayStr, busNo: buses[0]?.busNo || "", route: routes[0]?.name || "", fuelLiters: "", cost: "", remarks: "" });
    setModal({ mode: "add" });
  };
  const openEdit = (f: FuelRecord) => {
    setForm({ date: f.date, busNo: f.busNo, route: f.route, fuelLiters: String(f.fuelLiters), cost: String(f.cost), remarks: f.remarks });
    setModal({ mode: "edit", data: f });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.busNo || !form.fuelLiters) return;
    const built = { date: form.date, busNo: form.busNo, route: form.route, fuelLiters: Number(form.fuelLiters), cost: Number(form.cost), remarks: form.remarks };
    if (modal?.mode === "add") { addFuel(built); showToast("Fuel record added"); }
    else if (modal?.data) { updateFuel(modal.data.id, { ...modal.data, ...built }); showToast("Fuel record updated"); }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeFuel(deleteTarget.id);
    showToast("Fuel record deleted");
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    fuel.filter(f => `${f.busNo} ${f.route} ${f.date} ${f.remarks}`.toLowerCase().includes(search.toLowerCase())),
    [fuel, search]
  );

  const totalLiters = fuel.reduce((s, f) => s + f.fuelLiters, 0);
  const totalCost = fuel.reduce((s, f) => s + f.cost, 0);
  const avgLiters = fuel.length ? (totalLiters / fuel.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="Fuel Records" subtitle="View and manage all fleet fuel consumption records"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Add Fuel Record
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Records", value: fuel.length, color: "text-[var(--text-primary)]" },
          { label: "Total Fuel (L)", value: totalLiters, color: "text-blue-600" },
          { label: "Total Cost (LKR)", value: totalCost.toLocaleString(), color: "text-rose-600" },
          { label: "Avg per Trip (L)", value: avgLiters, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Fuel Log">
        <div className="mb-4 max-w-sm">
          <SearchField value={search} onChange={setSearch} placeholder="Search bus, route, date…" />
        </div>
        <TableCard
          headers={["Date", "Bus No", "Route", "Fuel (L)", "Cost (LKR)", "Remarks", "Actions"]}
          rows={filtered.map(f => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{f.date}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{f.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{f.route}</td>
              <td className="px-4 py-3 font-medium text-[var(--accent)]">{f.fuelLiters} L</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">LKR {f.cost.toLocaleString()}</td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)] max-w-[160px] truncate">{f.remarks || "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: f })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(f)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(f)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Del</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View */}
      <Modal open={modal?.mode === "view"} title="Fuel Record Details" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([["Date", modal.data.date], ["Bus No", modal.data.busNo], ["Route", modal.data.route], ["Fuel (L)", String(modal.data.fuelLiters)], ["Cost (LKR)", modal.data.cost.toLocaleString()], ["Remarks", modal.data.remarks || "—"]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end"><button type="button" onClick={() => setModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>

      {/* Add/Edit */}
      <Modal open={modal?.mode === "add" || modal?.mode === "edit"} title={modal?.mode === "add" ? "Add Fuel Record" : "Edit Fuel Record"} onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date"><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></Field>
            <Field label="Bus"><select value={form.busNo} onChange={e => setForm(f => ({ ...f, busNo: e.target.value }))} className={inputCls}>{buses.map(b => <option key={b.id}>{b.busNo}</option>)}</select></Field>
            <Field label="Route"><select value={form.route} onChange={e => setForm(f => ({ ...f, route: e.target.value }))} className={inputCls}>{routes.map(r => <option key={r.id}>{r.name}</option>)}</select></Field>
            <Field label="Fuel (Liters)"><input type="number" min="0" step="0.1" required value={form.fuelLiters} onChange={e => setForm(f => ({ ...f, fuelLiters: e.target.value }))} className={inputCls} placeholder="e.g. 120" /></Field>
            <Field label="Cost (LKR)"><input type="number" min="0" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className={inputCls} placeholder="e.g. 18600" /></Field>
          </div>
          <Field label="Remarks" required={false}><input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} className={inputCls} placeholder="Optional note" /></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{modal?.mode === "add" ? "Add Record" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <Modal open={!!deleteTarget} title="Delete Fuel Record" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">Delete fuel record for <strong>{deleteTarget?.busNo}</strong> on {deleteTarget?.date}? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
