"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2 } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { ScheduleItem, busData, driverData, routeData, scheduleData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const TRIP_STATUSES: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];
const SERVICE_TYPES = ["Normal", "Express", "Rural Service"] as const;
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type SchedForm = { routeName: string; busNo: string; driver: string; departureTime: string; arrivalTime: string; date: string; serviceType: typeof SERVICE_TYPES[number]; status: ScheduleItem["status"] };

function Field({ label, children, required = true }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}

export default function SchedulesPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { records: schedules, addRecord: addSchedule, updateRecord: updateSchedule, removeRecord: removeSchedule } =
    usePersistentCollection("srmss-schedules", scheduleData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [modal, setModal] = useState<{ mode: "view" | "add" | "edit"; data?: ScheduleItem } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);
  const [form, setForm] = useState<SchedForm>({ routeName: routes[0]?.name || "", busNo: buses[0]?.busNo || "", driver: drivers[0]?.name || "", departureTime: "07:00", arrivalTime: "10:00", date: todayStr, serviceType: "Normal", status: "Scheduled" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => {
    setForm({ routeName: routes[0]?.name || "", busNo: buses[0]?.busNo || "", driver: drivers[0]?.name || "", departureTime: "07:00", arrivalTime: "10:00", date: todayStr, serviceType: "Normal", status: "Scheduled" });
    setModal({ mode: "add" });
  };
  const openEdit = (s: ScheduleItem) => {
    setForm({ routeName: s.routeName, busNo: s.busNo, driver: s.driver, departureTime: s.departureTime, arrivalTime: s.arrivalTime, date: s.date, serviceType: s.serviceType, status: s.status });
    setModal({ mode: "edit", data: s });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.routeName || !form.busNo || !form.driver) return;
    const built = { routeId: routes.find(r => r.name === form.routeName)?.id || 1, routeName: form.routeName, busNo: form.busNo, driver: form.driver, departureTime: form.departureTime, arrivalTime: form.arrivalTime, date: form.date, serviceType: form.serviceType, status: form.status };
    if (modal?.mode === "add") { addSchedule(built); showToast("Schedule created"); }
    else if (modal?.data) { updateSchedule(modal.data.id, { ...modal.data, ...built }); showToast("Schedule updated"); }
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeSchedule(deleteTarget.id);
    showToast("Schedule deleted");
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    schedules.filter(s => {
      const q = `${s.routeName} ${s.busNo} ${s.driver} ${s.date} ${s.status}`.toLowerCase().includes(search.toLowerCase());
      const st = statusFilter === "All Status" || s.status === statusFilter;
      return q && st;
    }),
    [schedules, search, statusFilter]
  );

  const stats = [
    { label: "Total Schedules", value: schedules.length, color: "text-[var(--text-primary)]" },
    { label: "Scheduled", value: schedules.filter(s => s.status === "Scheduled").length, color: "text-blue-600" },
    { label: "On Time", value: schedules.filter(s => s.status === "On Time").length, color: "text-emerald-600" },
    { label: "Delayed", value: schedules.filter(s => s.status === "Delayed").length, color: "text-amber-600" },
    { label: "Completed", value: schedules.filter(s => s.status === "Completed").length, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">{toast}</div>}

      <PageHeader title="Timetable Management" subtitle="Create, modify and view all scheduled trips"
        action={
          <button type="button" onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-dark)] transition">
            <Plus className="h-4 w-4" /> Add Schedule
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Complete Timetable">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search route, bus, driver, date…" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option>All Status</option>
            {TRIP_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <TableCard
          headers={["Date", "Departure", "Arrival", "Route", "Bus", "Driver", "Type", "Status", "Actions"]}
          rows={filtered.map(s => (
            <>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.date}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{s.departureTime}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.arrivalTime}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{s.routeName}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{s.driver}</td>
              <td className="px-4 py-3"><StatusBadge status={s.serviceType} /></td>
              <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setModal({ mode: "view", data: s })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(s)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(s)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-400"><Trash2 className="h-3.5 w-3.5" />Del</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={modal?.mode === "view"} title="Schedule Details" onClose={() => setModal(null)}>
        {modal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Route</div><div className="text-lg font-bold text-[var(--text-primary)]">{modal.data.routeName}</div></div>
              <StatusBadge status={modal.data.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Departure", modal.data.departureTime], ["Arrival", modal.data.arrivalTime], ["Bus", modal.data.busNo], ["Driver", modal.data.driver], ["Date", modal.data.date], ["Service Type", modal.data.serviceType]] as [string, string][]).map(([k, v]) => (
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
        title={modal?.mode === "add" ? "Add Schedule" : "Edit Schedule"}
        onClose={() => setModal(null)}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Route"><select value={form.routeName} onChange={e => setForm(f => ({ ...f, routeName: e.target.value }))} className={inputCls}>{routes.map(r => <option key={r.id}>{r.name}</option>)}</select></Field>
            <Field label="Bus"><select value={form.busNo} onChange={e => setForm(f => ({ ...f, busNo: e.target.value }))} className={inputCls}>{buses.map(b => <option key={b.id}>{b.busNo}</option>)}</select></Field>
            <Field label="Driver"><select value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} className={inputCls}>{drivers.map(d => <option key={d.id}>{d.name}</option>)}</select></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></Field>
            <Field label="Departure Time"><input type="time" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} className={inputCls} /></Field>
            <Field label="Arrival Time"><input type="time" value={form.arrivalTime} onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))} className={inputCls} /></Field>
            <Field label="Service Type"><select value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value as typeof SERVICE_TYPES[number] }))} className={inputCls}>{SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Status"><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ScheduleItem["status"] }))} className={inputCls}>{TRIP_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{modal?.mode === "add" ? "Add Schedule" : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteTarget} title="Delete Schedule" onClose={() => setDeleteTarget(null)}>
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">Delete schedule for <strong className="text-[var(--text-primary)]">{deleteTarget?.routeName}</strong> on {deleteTarget?.date} at {deleteTarget?.departureTime}? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="button" onClick={handleDelete} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete Schedule</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
