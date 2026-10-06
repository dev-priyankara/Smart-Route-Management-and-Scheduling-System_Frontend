"use client";

import { useState } from "react";
import { Eye, PencilLine, Phone } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { Driver as DriverRecord, driverData, busData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const DRIVER_STATUSES: DriverRecord["status"][] = ["On Duty", "Available", "Off Duty"];
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

export default function DriversPage() {
  const { records: drivers, updateRecord: updateDriver } = usePersistentCollection("srmss-drivers", driverData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const [search, setSearch] = useState("");
  const [driverModal, setDriverModal] = useState<{ mode: "view" | "edit"; data: DriverRecord } | null>(null);
  const [driverForm, setDriverForm] = useState({ name: "", licenseNumber: "", phone: "", assignedRoute: "", workingHours: "06:00 - 14:00", status: "Available" as DriverRecord["status"] });

  const onDutyDrivers = drivers.filter(d => d.status === "On Duty");
  const filtered = drivers.filter(d => `${d.name} ${d.licenseNumber} ${d.assignedRoute} ${d.status}`.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (d: DriverRecord) => {
    setDriverForm({ name: d.name, licenseNumber: d.licenseNumber, phone: d.phone, assignedRoute: d.assignedRoute, workingHours: d.workingHours, status: d.status });
    setDriverModal({ mode: "edit", data: d });
  };

  const saveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverModal?.data) return;
    updateDriver(driverModal.data.id, { ...driverModal.data, ...driverForm });
    setDriverModal(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Driver Roster" subtitle="Review driver roster, contact information, and assignments" />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Drivers", value: drivers.length, color: "text-[var(--text-primary)]" },
          { label: "On Duty", value: onDutyDrivers.length, color: "text-blue-600" },
          { label: "Available", value: drivers.filter(d => d.status === "Available").length, color: "text-emerald-600" },
          { label: "Off Duty", value: drivers.filter(d => d.status === "Off Duty").length, color: "text-slate-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Driver Directory">
        <div className="mb-4 max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search driver, license, route…" /></div>
        <TableCard
          headers={["ID", "Driver Name", "Phone", "License No", "Insurance Date", "Assigned Bus", "Assigned Route", "Status", "Actions"]}
          rows={filtered.map(d => (
            <>
              <td className="px-4 py-3 text-[var(--text-muted)]">{d.id}</td>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.name}</td>
              <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" /><span className="text-[var(--text-secondary)]">{d.phone}</span></div></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.licenseNumber}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.insuranceDate || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find(b => b.id === d.assignedBusId)?.busNo ?? "—"}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.assignedRoute}</td>
              <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setDriverModal({ mode: "view", data: d })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(d)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      <Modal open={driverModal?.mode === "view"} title="Driver Profile" onClose={() => setDriverModal(null)}>
        {driverModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3"><div><div className="text-xs text-[var(--text-muted)] uppercase">Driver</div><div className="text-xl font-bold text-[var(--text-primary)]">{driverModal.data.name}</div></div><StatusBadge status={driverModal.data.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["License No.", driverModal.data.licenseNumber], ["Phone", driverModal.data.phone], ["Assigned Route", driverModal.data.assignedRoute], ["Working Hours", driverModal.data.workingHours], ["Insurance Date", driverModal.data.insuranceDate || "—"], ["Assigned Bus", buses.find(b => b.id === driverModal.data.assignedBusId)?.busNo ?? "—"]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (driverModal?.data) openEdit(driverModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setDriverModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>

      <Modal open={driverModal?.mode === "edit"} title="Edit Driver" onClose={() => setDriverModal(null)}>
        <form onSubmit={saveDriver} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Full Name", "name"], ["License Number", "licenseNumber"], ["Phone", "phone"], ["Assigned Route", "assignedRoute"], ["Working Hours", "workingHours"]].map(([label, field]) => (
              <label key={field} className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}</span>
                <input value={String(driverForm[field as keyof typeof driverForm])} onChange={e => setDriverForm(f => ({ ...f, [field]: e.target.value }))} className={inputCls} required />
              </label>
            ))}
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Status</span>
              <select value={driverForm.status} onChange={e => setDriverForm(f => ({ ...f, status: e.target.value as DriverRecord["status"] }))} className={inputCls}>{DRIVER_STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setDriverModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">Save Changes</button></div>
        </form>
      </Modal>
    </div>
  );
}
