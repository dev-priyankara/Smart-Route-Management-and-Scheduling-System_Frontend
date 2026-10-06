"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { DepotRoute, busData, driverData, routeData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const SERVICE_TYPES = ["Normal", "Express", "Rural Service"] as const;
const ROUTE_STATUSES = ["Active", "Planned", "Delayed", "Completed"] as const;
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type RouteForm = { name: string; start: string; end: string; distance: string; stops: string; serviceType: typeof SERVICE_TYPES[number]; status: typeof ROUTE_STATUSES[number]; busId: string; driverId: string };
type ViewedRoute = DepotRoute & { assignedBusNo: string; assignedDriverName: string };

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function RoutesPage() {
  const { records: routes, addRecord: addRoute, updateRecord: updateRoute, removeRecord: removeRoute } =
    usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: ViewedRoute } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepotRoute | null>(null);
  const [form, setForm] = useState<RouteForm>({ name: "", start: "", end: "", distance: "0", stops: "", serviceType: "Normal", status: "Planned", busId: "", driverId: "" });
  const [toast, setToast] = useState("");
  const [stopInput, setStopInput] = useState(""); // for stop management

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setForm({ name: "", start: "", end: "", distance: "0", stops: "", serviceType: "Normal", status: "Planned", busId: "", driverId: "" }); setModal({ mode: "add" }); };
  const openEdit = (r: DepotRoute) => {
    setForm({ name: r.name, start: r.start, end: r.end, distance: String(r.distance), stops: r.stops.join(", "), serviceType: r.serviceType, status: r.status, busId: String(r.busId || ""), driverId: String(r.driverId || "") });
    setModal({ mode: "edit", data: { ...r, assignedBusNo: buses.find(b => b.id === r.busId)?.busNo ?? "—", assignedDriverName: drivers.find(d => d.id === r.driverId)?.name ?? "—" } });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.start.trim() || !form.end.trim()) return;
    const built = { name: form.name, start: form.start, end: form.end, distance: Number(form.distance), stops: form.stops.split(",").map(s => s.trim()).filter(Boolean), serviceType: form.serviceType, status: form.status, color: "#146CFA", busId: form.busId ? Number(form.busId) : 0, driverId: form.driverId ? Number(form.driverId) : 0 };
    if (modal?.mode === "add") { addRoute(built); showToast(`Route ${form.name} created`); }
    else if (modal?.data) { updateRoute(modal.data.id, { ...modal.data, ...built }); showToast(`Route ${form.name} updated`); }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeRoute(deleteTarget.id);
    showToast(`Route ${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    routes.filter(r => {
      const q = `${r.name} ${r.start} ${r.end} ${r.serviceType}`.toLowerCase().includes(search.toLowerCase());
      const s = statusFilter === "All Status" || r.status === statusFilter;
      return q && s;
    }),
    [routes, search, statusFilter]
  );

  // Stop management helpers
  const stopsArray = form.stops.split(",").map(s => s.trim()).filter(Boolean);
  const addStop = () => {
    if (!stopInput.trim()) return;
    setForm(f => ({ ...f, stops: [...stopsArray, stopInput.trim()].join(", ") }));
    setStopInput("");
  };
  const removeStop = (idx: number) => {
    const arr = stopsArray.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, stops: arr.join(", ") }));
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="Route Network" subtitle="Create, update, delete routes and manage route stops"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Create Route
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Routes", value: routes.length, color: "text-[var(--text-primary)]" },
          { label: "Active", value: routes.filter(r => r.status === "Active").length, color: "text-emerald-600" },
          { label: "Total Distance", value: `${routes.reduce((s, r) => s + r.distance, 0)} km`, color: "text-blue-600" },
          { label: "Delayed", value: routes.filter(r => r.status === "Delayed").length, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Route Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search route name, start, end…" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option>All Status</option>
            {ROUTE_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <TableCard
          headers={["Route Name", "Start", "End", "Distance", "Stops", "Service", "Assigned Bus", "Assigned Driver", "Status", "Actions"]}
          rows={filtered.map(r => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{r.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.start}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.end}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.distance} km</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.stops.length > 0 ? `${r.stops.length} stops` : "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={r.serviceType} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find(b => b.id === r.busId)?.busNo ?? "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{drivers.find(d => d.id === r.driverId)?.name ?? "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: { ...r, assignedBusNo: buses.find(b => b.id === r.busId)?.busNo ?? "—", assignedDriverName: drivers.find(d => d.id === r.driverId)?.name ?? "—" } })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(r)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(r)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Del</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={modal?.mode === "view"} title="Route Details" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase">Route</div><div className="text-xl font-bold text-[var(--text-primary)]">{modal.data.name}</div></div>
              <StatusBadge status={modal.data.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Start Point", modal.data.start], ["Destination", modal.data.end], ["Distance", `${modal.data.distance} km`], ["Service Type", modal.data.serviceType], ["Assigned Bus", modal.data.assignedBusNo], ["Assigned Driver", modal.data.assignedDriverName]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            {modal.data.stops.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)] mb-2">Intermediate Stops ({modal.data.stops.length})</div>
                <div className="flex flex-wrap gap-2">{modal.data.stops.map((s, i) => <span key={i} className="rounded-full bg-[var(--soft)] border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]">{i + 1}. {s}</span>)}</div>
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
        title={modal?.mode === "add" ? "Create New Route" : "Edit Route"}
        onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Route Name"><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Colombo - Kandy" /></Field>
            <Field label="Distance (km)"><input type="number" min="0" value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} className={inputCls} /></Field>
            <Field label="Start Point"><input required value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} className={inputCls} placeholder="e.g. Colombo Fort" /></Field>
            <Field label="Destination"><input required value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} className={inputCls} placeholder="e.g. Kandy Depot" /></Field>
            <Field label="Service Type"><select value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value as typeof SERVICE_TYPES[number] }))} className={inputCls}>{SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Status"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof ROUTE_STATUSES[number] }))} className={inputCls}>{ROUTE_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Assign Bus" required={false}><select value={form.busId} onChange={e => setForm(f => ({ ...f, busId: e.target.value }))} className={inputCls}><option value="">— Unassigned —</option>{buses.map(b => <option key={b.id} value={b.id}>{b.busNo} ({b.status})</option>)}</select></Field>
            <Field label="Assign Driver" required={false}><select value={form.driverId} onChange={e => setForm(f => ({ ...f, driverId: e.target.value }))} className={inputCls}><option value="">— Unassigned —</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.status})</option>)}</select></Field>
          </div>

          {/* Stop Management */}
          <div>
            <div className="mb-1.5 text-sm font-medium text-[var(--text-primary)]">Intermediate Stops</div>
            <div className="flex gap-2 mb-2">
              <input value={stopInput} onChange={e => setStopInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addStop(); } }} placeholder="Type stop name and press Enter or Add" className={`${inputCls} flex-1`} />
              <button type="button" onClick={addStop} className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">Add</button>
            </div>
            {stopsArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stopsArray.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    {i + 1}. {s}
                    <button type="button" onClick={() => removeStop(i)} className="text-[var(--accent)] hover:text-rose-500" aria-label={`Remove ${s}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{modal?.mode === "add" ? "Create Route" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} title="Delete Route" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">Delete route <strong className="text-[var(--text-primary)]">{deleteTarget?.name}</strong>? Schedules using this route will be affected. This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete Route</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
