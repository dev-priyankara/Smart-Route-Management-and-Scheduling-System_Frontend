"use client";

import { useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { Bus as BusRecord, busData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const BUS_STATUSES: BusRecord["status"][] = ["Active", "In Service", "Under Maintenance", "Out of Service"];
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

export default function FleetPage() {
  const { records: buses, updateRecord: updateBus } = usePersistentCollection("srmss-buses", busData);
  const [search, setSearch] = useState("");
  const [busModal, setBusModal] = useState<{ mode: "view" | "edit"; data: BusRecord } | null>(null);
  const [busForm, setBusForm] = useState({ busNo: "", registration: "", seatingCapacity: "44", mileage: "0", status: "Active" as BusRecord["status"] });

  const openEdit = (b: BusRecord) => {
    setBusForm({ busNo: b.busNo, registration: b.registration, seatingCapacity: String(b.seatingCapacity), mileage: String(b.mileage), status: b.status });
    setBusModal({ mode: "edit", data: b });
  };

  const saveBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busModal?.data) return;
    updateBus(busModal.data.id, { ...busModal.data, busNo: busForm.busNo, registration: busForm.registration, seatingCapacity: Number(busForm.seatingCapacity), mileage: Number(busForm.mileage), status: busForm.status });
    setBusModal(null);
  };

  const activeBuses = buses.filter(b => b.status === "Active" || b.status === "In Service");
  const filtered = buses.filter(b => `${b.busNo} ${b.registration} ${b.status}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicle Fleet Management" subtitle="Fleet monitoring and operational readiness overview" />

      <div className="grid gap-4 sm:grid-cols-4">
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
        <div className="mb-4 max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search bus, registration…" /></div>
        <TableCard
          headers={["Bus No", "Registration", "Capacity", "Mileage", "Status", "Maintenance Note", "Actions"]}
          rows={filtered.map(b => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{b.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{b.registration}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{b.seatingCapacity} seats</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{b.mileage.toLocaleString()} km</td>
              <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
              <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{b.maintenanceHistory[0] || "—"}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setBusModal({ mode: "view", data: b })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(b)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      <Modal open={busModal?.mode === "view"} title="Bus Details" onClose={() => setBusModal(null)}>
        {busModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3"><div><div className="text-xs text-[var(--text-muted)] uppercase">Fleet No</div><div className="text-xl font-bold text-[var(--text-primary)]">{busModal.data.busNo}</div></div><StatusBadge status={busModal.data.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["Registration", busModal.data.registration], ["Capacity", `${busModal.data.seatingCapacity} seats`], ["Mileage", `${busModal.data.mileage.toLocaleString()} km`], ["Status", busModal.data.status]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            {busModal.data.maintenanceHistory.length > 0 && <div className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)] mb-2">Maintenance History</div>{busModal.data.maintenanceHistory.map((h, i) => <div key={i} className="text-xs text-[var(--text-secondary)]">• {h}</div>)}</div>}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (busModal?.data) openEdit(busModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setBusModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>

      <Modal open={busModal?.mode === "edit"} title="Edit Bus" onClose={() => setBusModal(null)}>
        <form onSubmit={saveBus} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Fleet / Bus No", "busNo", "text"], ["Registration No.", "registration", "text"], ["Seating Capacity", "seatingCapacity", "number"], ["Mileage (km)", "mileage", "number"]].map(([label, field, type]) => (
              <label key={field} className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}</span>
                <input type={type} value={String(busForm[field as keyof typeof busForm])} onChange={e => setBusForm(f => ({ ...f, [field]: e.target.value }))} className={inputCls} min={type === "number" ? "0" : undefined} required />
              </label>
            ))}
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Status</span>
              <select value={busForm.status} onChange={e => setBusForm(f => ({ ...f, status: e.target.value as BusRecord["status"] }))} className={inputCls}>{BUS_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setBusModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">Save Changes</button></div>
        </form>
      </Modal>
    </div>
  );
}
