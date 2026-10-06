"use client";

import { useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import { Modal, PageHeader, SearchField, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import { DepotRoute, busData, driverData, routeData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const SERVICE_TYPES = ["Normal", "Express", "Rural Service"] as const;
const ROUTE_STATUSES = ["Active", "Planned", "Delayed", "Completed"] as const;
const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

type ViewedRoute = DepotRoute & { assignedBusNo: string; assignedDriverName: string };

export default function RoutesPage() {
  const { records: routes, updateRecord: updateRoute } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);
  const [search, setSearch] = useState("");
  const [routeModal, setRouteModal] = useState<{ mode: "view" | "edit"; data: ViewedRoute } | null>(null);
  const [routeForm, setRouteForm] = useState({ name: "", start: "", end: "", distance: "0", stops: "", serviceType: "Normal" as typeof SERVICE_TYPES[number], status: "Planned" as typeof ROUTE_STATUSES[number] });

  const openEdit = (r: DepotRoute) => {
    setRouteForm({ name: r.name, start: r.start, end: r.end, distance: String(r.distance), stops: r.stops.join(", "), serviceType: r.serviceType, status: r.status });
    setRouteModal({ mode: "edit", data: { ...r, assignedBusNo: buses.find(b => b.id === r.busId)?.busNo ?? "—", assignedDriverName: drivers.find(d => d.id === r.driverId)?.name ?? "—" } });
  };

  const saveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeModal?.data) return;
    updateRoute(routeModal.data.id, { ...routeModal.data, name: routeForm.name, start: routeForm.start, end: routeForm.end, distance: Number(routeForm.distance), stops: routeForm.stops.split(",").map(s => s.trim()).filter(Boolean), serviceType: routeForm.serviceType, status: routeForm.status });
    setRouteModal(null);
  };

  const filtered = routes.filter(r => `${r.name} ${r.start} ${r.end} ${r.status}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Route Network" subtitle="Full management of all service corridors" />

      <div className="grid gap-4 sm:grid-cols-4">
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
        <div className="mb-4 max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search route, start, destination…" /></div>
        <TableCard
          headers={["Route Name", "Start", "End", "Distance", "Stops", "Service", "Bus", "Driver", "Status", "Actions"]}
          rows={filtered.map(r => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{r.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.start}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.end}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.distance} km</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.stops.length}</td>
              <td className="px-4 py-3"><StatusBadge status={r.serviceType} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find(b => b.id === r.busId)?.busNo ?? "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{drivers.find(d => d.id === r.driverId)?.name ?? "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setRouteModal({ mode: "view", data: { ...r, assignedBusNo: buses.find(b => b.id === r.busId)?.busNo ?? "—", assignedDriverName: drivers.find(d => d.id === r.driverId)?.name ?? "—" } })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                  <button type="button" onClick={() => openEdit(r)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>

      <Modal open={routeModal?.mode === "view"} title="Route Details" onClose={() => setRouteModal(null)}>
        {routeModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3"><div><div className="text-xs text-[var(--text-muted)] uppercase">Route</div><div className="text-xl font-bold text-[var(--text-primary)]">{routeModal.data.name}</div></div><StatusBadge status={routeModal.data.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["Start Point", routeModal.data.start], ["Destination", routeModal.data.end], ["Distance", `${routeModal.data.distance} km`], ["Service Type", routeModal.data.serviceType], ["Assigned Bus", routeModal.data.assignedBusNo], ["Assigned Driver", routeModal.data.assignedDriverName]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            {routeModal.data.stops.length > 0 && <div className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)] mb-2">Intermediate Stops</div><div className="flex flex-wrap gap-2">{routeModal.data.stops.map(s => <span key={s} className="rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]">{s}</span>)}</div></div>}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (routeModal?.data) openEdit(routeModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setRouteModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>

      <Modal open={routeModal?.mode === "edit"} title="Edit Route" onClose={() => setRouteModal(null)}>
        <form onSubmit={saveRoute} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Route Name", "name"], ["Start Point", "start"], ["Destination", "end"]].map(([label, field]) => (
              <label key={field} className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}</span><input required value={String(routeForm[field as keyof typeof routeForm])} onChange={e => setRouteForm(f => ({ ...f, [field]: e.target.value }))} className={inputCls} /></label>
            ))}
            <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Distance (km)</span><input type="number" min="0" value={routeForm.distance} onChange={e => setRouteForm(f => ({ ...f, distance: e.target.value }))} className={inputCls} /></label>
            <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Service Type</span><select value={routeForm.serviceType} onChange={e => setRouteForm(f => ({ ...f, serviceType: e.target.value as typeof SERVICE_TYPES[number] }))} className={inputCls}>{SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select></label>
            <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Status</span><select value={routeForm.status} onChange={e => setRouteForm(f => ({ ...f, status: e.target.value as typeof ROUTE_STATUSES[number] }))} className={inputCls}>{ROUTE_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
          </div>
          <label className="block text-sm text-[var(--text-secondary)]"><span className="mb-1.5 block font-medium text-[var(--text-primary)]">Intermediate Stops (comma-separated)</span><input value={routeForm.stops} onChange={e => setRouteForm(f => ({ ...f, stops: e.target.value }))} className={inputCls} placeholder="Kelaniya, Kurunegala" /></label>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setRouteModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">Save Changes</button></div>
        </form>
      </Modal>
    </div>
  );
}
