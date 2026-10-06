"use client";

import { useEffect, useMemo, useState } from "react";
import { Bus, PencilLine, Plus, Trash2, Eye } from "lucide-react";
import { AppShell, ConfirmationModal, Modal, PageHeader, PrimaryButton, SearchField, StatusBadge, TableCard } from "@/components/shell";
import { RecordDialog, RecordField } from "@/components/record-dialog";
import { busData, Bus as BusRecord } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const vehicleFields: RecordField[] = [
  { name: "busNo", label: "Fleet number" },
  { name: "registration", label: "Registration" },
  { name: "seatingCapacity", label: "Seating capacity", type: "number" },
  { name: "mileage", label: "Mileage (km)", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["Active", "In Service", "Under Maintenance", "Out of Service"] },
  { name: "maintenance", label: "Maintenance history (separate entries with |)", required: false },
];

const emptyVehicle = { busNo: "", registration: "", seatingCapacity: "", mileage: "", status: "Active", maintenance: "" };

export default function BusesPage() {
  const { records: buses, addRecord, updateRecord, removeRecord } = usePersistentCollection("srmss-buses", busData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingBus, setEditingBus] = useState<BusRecord | null>(null);
  const [viewingBus, setViewingBus] = useState<BusRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "create") setDialogOpen(true);
  }, []);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchesSearch = `${bus.busNo} ${bus.registration}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || bus.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buses, search, statusFilter]);

  const openEditor = (bus: BusRecord | null) => {
    setEditingBus(bus);
    setDialogOpen(true);
  };

  const saveVehicle = (values: Record<string, string>) => {
    const vehicle = {
      busNo: values.busNo.trim(),
      registration: values.registration.trim(),
      seatingCapacity: Number(values.seatingCapacity),
      mileage: Number(values.mileage),
      status: values.status as BusRecord["status"],
      maintenanceHistory: values.maintenance.split("|").map((entry) => entry.trim()).filter(Boolean),
    };
    if (editingBus) updateRecord(editingBus.id, vehicle);
    else addRecord(vehicle);
    setDialogOpen(false);
    setEditingBus(null);
  };

  return (
    <AppShell title="Buses" subtitle="Vehicle fleet inventory and service state.">
      <PageHeader title="Vehicle Management" subtitle="Bus and fleet overview" action={<PrimaryButton onClick={() => openEditor(null)}><Plus className="mr-2 h-4 w-4" /> Add Vehicle</PrimaryButton>} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-lg"><SearchField value={search} onChange={setSearch} placeholder="Search buses" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="In Service">In Service</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBuses.map((bus) => (
          <div key={bus.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Bus className="h-6 w-6" /></div>
              <StatusBadge status={bus.status} />
            </div>
            <div className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{bus.busNo}</div>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between"><span>Registration</span><span className="font-medium text-[var(--text-primary)]">{bus.registration}</span></div>
              <div className="flex items-center justify-between"><span>Capacity</span><span className="font-medium text-[var(--text-primary)]">{bus.seatingCapacity}</span></div>
              <div className="flex items-center justify-between"><span>Mileage</span><span className="font-medium text-[var(--text-primary)]">{bus.mileage.toLocaleString()} km</span></div>
            </div>
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Maintenance</div>
              <div className="text-sm text-[var(--text-secondary)]">{bus.maintenanceHistory[0] ?? "No recent maintenance"}</div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setViewingBus(bus)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View details" aria-label="View vehicle details"><Eye className="h-4 w-4" /></button>
              <button type="button" onClick={() => openEditor(bus)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit"><PencilLine className="h-4 w-4" /></button>
              <button type="button" onClick={() => setPendingDelete(bus.id)} className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
        <TableCard
          headers={["Bus Number", "Registration", "Capacity", "Mileage", "Status", "Maintenance", "Actions"]}
          rows={filteredBuses.map((bus) => (
            <>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{bus.busNo}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.registration}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.seatingCapacity}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.mileage.toLocaleString()}</td>
              <td className="px-4 py-3"><StatusBadge status={bus.status} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.maintenanceHistory[0]}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setViewingBus(bus)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View details" aria-label="View vehicle details"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => openEditor(bus)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit"><PencilLine className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setPendingDelete(bus.id)} className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </>
          ))}
          emptyTitle="No buses found"
          emptyDescription="No fleet entries match your current search or filter."
        />
      </div>
      <RecordDialog
        open={dialogOpen}
        title={editingBus ? "Edit vehicle" : "Add vehicle"}
        fields={vehicleFields}
        initialValues={editingBus ? {
          busNo: editingBus.busNo,
          registration: editingBus.registration,
          seatingCapacity: String(editingBus.seatingCapacity),
          mileage: String(editingBus.mileage),
          status: editingBus.status,
          maintenance: editingBus.maintenanceHistory.join(" | "),
        } : emptyVehicle}
        onClose={() => { setDialogOpen(false); setEditingBus(null); }}
        onSubmit={saveVehicle}
      />
      <Modal open={Boolean(viewingBus)} title="Vehicle details" onClose={() => setViewingBus(null)}>
        {viewingBus && <div className="space-y-3 text-sm">
          {[["Fleet number", viewingBus.busNo], ["Registration", viewingBus.registration], ["Seating capacity", String(viewingBus.seatingCapacity)], ["Mileage", `${viewingBus.mileage.toLocaleString()} km`], ["Status", viewingBus.status], ["Maintenance history", viewingBus.maintenanceHistory.join(" · ") || "No recorded maintenance"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-2"><span className="text-[var(--text-muted)]">{label}</span><span className="text-right font-medium text-[var(--text-primary)]">{value}</span></div>)}
        </div>}
      </Modal>
      <ConfirmationModal
        open={pendingDelete !== null}
        title="Delete vehicle"
        message="This vehicle and its local demo record will be removed. Continue?"
        onConfirm={() => { if (pendingDelete !== null) removeRecord(pendingDelete); setPendingDelete(null); }}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}

