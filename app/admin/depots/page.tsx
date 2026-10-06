"use client";

import { useMemo, useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, TableCard } from "@/components/shell";

type AdminDepot = {
  id: number; name: string; location: string; manager: string;
  buses: number; staff: number; status: "Active" | "Maintenance" | "Closed";
};

const DEPOT_STATUSES = ["Active", "Maintenance"] as const;
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

const SEED_DEPOTS: AdminDepot[] = [
  { id: 1, name: "Central Bus Depot", location: "Colombo", manager: "A. De Silva", buses: 12, staff: 8, status: "Active" },
  { id: 2, name: "Kandy Depot", location: "Kandy", manager: "M. Perera", buses: 8, staff: 5, status: "Active" },
  { id: 3, name: "Galle Depot", location: "Galle", manager: "R. Silva", buses: 6, staff: 4, status: "Active" },
  { id: 4, name: "Negombo Depot", location: "Negombo", manager: "T. Kumara", buses: 10, staff: 6, status: "Maintenance" },
];

export default function DepotsPage() {
  const [depots, setDepots] = useState<AdminDepot[]>(SEED_DEPOTS);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [depotModal, setDepotModal] = useState<{ mode: "view" | "edit"; data: AdminDepot } | null>(null);
  const [depotForm, setDepotForm] = useState({ name: "", location: "", manager: "", buses: "0", staff: "0", status: "Active" as AdminDepot["status"] });

  const cities = useMemo(() => [...new Set(depots.map(d => d.location))], [depots]);

  const filtered = useMemo(() =>
    depots.filter(d => {
      const q = `${d.name} ${d.location} ${d.manager}`.toLowerCase().includes(search.toLowerCase());
      const c = cityFilter === "all" || d.location === cityFilter;
      const s = statusFilter === "all"
        || (statusFilter === "active" && d.status === "Active")
        || (statusFilter === "closed" && (d.status === "Closed" || d.status === "Maintenance"));
      return q && c && s;
    }), [depots, search, cityFilter, statusFilter]);

  const openEdit = (d: AdminDepot) => {
    setDepotForm({ name: d.name, location: d.location, manager: d.manager, buses: String(d.buses), staff: String(d.staff), status: d.status });
    setDepotModal({ mode: "edit", data: d });
  };

  const saveDepot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depotModal?.data) return;
    setDepots(prev => prev.map(d => d.id === depotModal.data.id ? { ...d, ...depotForm, buses: Number(depotForm.buses), staff: Number(depotForm.staff) } : d));
    setDepotModal(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Depot Management" subtitle="Manage depot locations and staff" />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Depots", value: depots.length, color: "text-[var(--text-primary)]" },
          { label: "Active", value: depots.filter(d => d.status === "Active").length, color: "text-emerald-600" },
          { label: "Total Buses", value: depots.reduce((s, d) => s + d.buses, 0), color: "text-blue-600" },
          { label: "Total Staff", value: depots.reduce((s, d) => s + d.staff, 0), color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Depot Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchField value={search} onChange={setSearch} placeholder="Search depots…" />
          </div>
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by city">
            <option value="all">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            aria-label="Filter by status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed / Maintenance</option>
          </select>
        </div>

        <TableCard
          headers={["Depot Name", "Location", "Manager", "Buses", "Staff", "Status", "Actions"]}
          rows={filtered.map(d => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.location}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{d.manager}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.buses}</td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.staff}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${d.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setDepotModal({ mode: "view", data: d })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(d)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      {/* View Modal */}
      <Modal open={depotModal?.mode === "view"} title="Depot Details" onClose={() => setDepotModal(null)}>
        {depotModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase">Depot</div><div className="text-xl font-bold text-[var(--text-primary)]">{depotModal.data.name}</div></div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${depotModal.data.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{depotModal.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Location", depotModal.data.location], ["Manager", depotModal.data.manager], ["Assigned Buses", `${depotModal.data.buses} vehicles`], ["Staff Count", `${depotModal.data.staff} personnel`]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { if (depotModal?.data) openEdit(depotModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button>
              <button type="button" onClick={() => setDepotModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={depotModal?.mode === "edit"} title="Edit Depot" onClose={() => setDepotModal(null)}>
        <form onSubmit={saveDepot} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Depot Name", "name", "text"], ["Location", "location", "text"], ["Manager", "manager", "text"], ["Buses Assigned", "buses", "number"], ["Staff Count", "staff", "number"]].map(([label, field, type]) => (
              <label key={field} className="block text-sm text-[var(--text-secondary)]">
                <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}</span>
                <input type={type} value={String(depotForm[field as keyof typeof depotForm])} onChange={e => setDepotForm(f => ({ ...f, [field]: e.target.value }))} className={inputCls} min={type === "number" ? "0" : undefined} />
              </label>
            ))}
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Status</span>
              <select value={depotForm.status} onChange={e => setDepotForm(f => ({ ...f, status: e.target.value as AdminDepot["status"] }))} className={inputCls}>
                {DEPOT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setDepotModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
