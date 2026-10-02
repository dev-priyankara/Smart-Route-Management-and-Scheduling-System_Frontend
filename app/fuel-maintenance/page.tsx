"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Plus, PencilLine, Trash2 } from "lucide-react";
import { AppShell, ConfirmationModal, PageHeader, PrimaryButton, SearchField, StatusBadge, TableCard } from "@/components/shell";
import { RecordDialog, RecordField } from "@/components/record-dialog";
import { busData, fuelRecords, FuelRecord, maintenanceRecords, MaintenanceRecord, routeData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const fuelFields: RecordField[] = [
  { name: "date", label: "Date", type: "date" },
  { name: "busNo", label: "Bus", type: "select", options: busData.map((bus) => bus.busNo) },
  { name: "route", label: "Route", type: "select", options: routeData.map((route) => route.name) },
  { name: "fuelLiters", label: "Fuel (liters)", type: "number" },
  { name: "cost", label: "Cost (LKR)", type: "number" },
  { name: "remarks", label: "Remarks", required: false },
];

const maintenanceFields: RecordField[] = [
  { name: "vehicle", label: "Vehicle", type: "select", options: busData.map((bus) => bus.busNo) },
  { name: "type", label: "Maintenance type", type: "select", options: ["Routine Maintenance", "Corrective Maintenance"] },
  { name: "date", label: "Service date", type: "date" },
  { name: "nextServiceDate", label: "Next service date", type: "date" },
  { name: "status", label: "Status", type: "select", options: ["Completed", "Scheduled", "Overdue"] },
  { name: "remarks", label: "Remarks", required: false },
];

const emptyFuel = { date: "2026-10-02", busNo: busData[0].busNo, route: routeData[0].name, fuelLiters: "", cost: "", remarks: "" };
const emptyMaintenance = { vehicle: busData[0].busNo, type: "Routine Maintenance", date: "2026-10-02", nextServiceDate: "2026-11-02", status: "Scheduled", remarks: "" };

function FuelMaintenanceContent() {
  const fuel = usePersistentCollection("srmss-fuel-records", fuelRecords);
  const maintenance = usePersistentCollection("srmss-maintenance-records", maintenanceRecords);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const requestedTab = searchParams.get("tab");
  const tab = requestedTab === "maintenance" || action === "maintenance" ? "Maintenance Log" : "Fuel Log";
  const [search, setSearch] = useState("");
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [dismissedAction, setDismissedAction] = useState<string | null>(null);
  const [editingFuel, setEditingFuel] = useState<FuelRecord | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: "fuel" | "maintenance"; id: number } | null>(null);
  const currentFuelFields = fuelFields.map((field) => field.name === "busNo"
    ? { ...field, options: buses.map((bus) => bus.busNo) }
    : field.name === "route" ? { ...field, options: routes.map((route) => route.name) } : field);
  const currentMaintenanceFields = maintenanceFields.map((field) => field.name === "vehicle"
    ? { ...field, options: buses.map((bus) => bus.busNo) }
    : field);
  const dialogOpen = manualDialogOpen || (Boolean(action) && dismissedAction !== action);
  const openDialog = () => { setManualDialogOpen(true); setDismissedAction(null); };
  const closeDialog = () => { setManualDialogOpen(false); if (action) setDismissedAction(action); };

  const filteredFuel = useMemo(() => fuel.records.filter((record) => `${record.busNo} ${record.route}`.toLowerCase().includes(search.toLowerCase())), [fuel.records, search]);
  const filteredMaintenance = useMemo(() => maintenance.records.filter((record) => `${record.vehicle} ${record.type}`.toLowerCase().includes(search.toLowerCase())), [maintenance.records, search]);

  const totalFuel = fuel.records.reduce((acc, item) => acc + item.fuelLiters, 0);
  const totalCost = fuel.records.reduce((acc, item) => acc + item.cost, 0);
  const averageFuel = fuel.records.length ? Math.round(totalFuel / fuel.records.length) : 0;

  const saveRecord = (values: Record<string, string>) => {
    if (tab === "Fuel Log") {
      const record = { date: values.date, busNo: values.busNo, route: values.route, fuelLiters: Number(values.fuelLiters), cost: Number(values.cost), remarks: values.remarks.trim() };
      if (editingFuel) fuel.updateRecord(editingFuel.id, record);
      else fuel.addRecord(record);
    } else {
      const record = { vehicle: values.vehicle, type: values.type as MaintenanceRecord["type"], date: values.date, nextServiceDate: values.nextServiceDate, status: values.status as MaintenanceRecord["status"], remarks: values.remarks.trim() };
      if (editingMaintenance) maintenance.updateRecord(editingMaintenance.id, record);
      else maintenance.addRecord(record);
    }
    setManualDialogOpen(false);
    if (action) setDismissedAction(action);
    setEditingFuel(null);
    setEditingMaintenance(null);
  };

  const editRecord = (record: FuelRecord | MaintenanceRecord) => {
    if (tab === "Fuel Log") setEditingFuel(record as FuelRecord);
    else setEditingMaintenance(record as MaintenanceRecord);
    openDialog();
  };

  return (
    <AppShell title="Fuel & Maintenance" subtitle="Fuel usage and maintenance tracking for the network.">
      <PageHeader title="Fuel & Maintenance" subtitle="Operational record tracking" action={<PrimaryButton onClick={() => { setEditingFuel(null); setEditingMaintenance(null); openDialog(); }}><Plus className="mr-2 h-4 w-4" /> Add Record</PrimaryButton>} />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["Fuel Log", "Maintenance Log"] as const).map((item) => (
          <Link href={`/fuel-maintenance?tab=${item === "Fuel Log" ? "fuel" : "maintenance"}`} key={item} className={`rounded-xl px-3 py-2 text-sm font-medium ${tab === item ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)]"}`}>
            {item}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-lg"><SearchField value={search} onChange={setSearch} placeholder={tab === "Fuel Log" ? "Search fuel records" : "Search maintenance logs"} /></div>
      </div>

      {tab === "Fuel Log" ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Total Fuel Consumption</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{totalFuel} L</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Total Fuel Cost</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">LKR {totalCost.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Average Fuel per Trip</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{averageFuel} L</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <TableCard
              headers={["Date", "Bus", "Route", "Fuel (L)", "Cost", "Remarks", "Actions"]}
              rows={filteredFuel.map((record) => (
                <>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{record.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.route}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.fuelLiters}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">LKR {record.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.remarks}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editRecord(record)} aria-label="Edit fuel record" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setPendingDelete({ type: "fuel", id: record.id })} aria-label="Delete fuel record" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </>
              ))}
              emptyTitle="No fuel records found"
              emptyDescription="Try another search term."
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Scheduled Maintenance</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{maintenance.records.filter((record) => record.status === "Scheduled").length}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Completed</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{maintenance.records.filter((record) => record.status === "Completed").length}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Overdue</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{maintenance.records.filter((record) => record.status === "Overdue").length}</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <TableCard
              headers={["Vehicle", "Maintenance Type", "Date", "Next Service", "Status", "Remarks", "Actions"]}
              rows={filteredMaintenance.map((record) => (
                <>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{record.vehicle}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.type}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.nextServiceDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{record.remarks}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editRecord(record)} aria-label="Edit maintenance record" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setPendingDelete({ type: "maintenance", id: record.id })} aria-label="Delete maintenance record" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </>
              ))}
              emptyTitle="No maintenance records found"
              emptyDescription="No maintenance task matches the current search."
            />
          </div>
        </>
      )}
      <RecordDialog
        open={dialogOpen}
        title={editingFuel || editingMaintenance ? `Edit ${tab === "Fuel Log" ? "fuel" : "maintenance"} record` : `Add ${tab === "Fuel Log" ? "fuel" : "maintenance"} record`}
        fields={tab === "Fuel Log" ? currentFuelFields : currentMaintenanceFields}
        initialValues={tab === "Fuel Log" ? editingFuel ? {
          date: editingFuel.date,
          busNo: editingFuel.busNo,
          route: editingFuel.route,
          fuelLiters: String(editingFuel.fuelLiters),
          cost: String(editingFuel.cost),
          remarks: editingFuel.remarks,
        } : emptyFuel : editingMaintenance ? {
          vehicle: editingMaintenance.vehicle,
          type: editingMaintenance.type,
          date: editingMaintenance.date,
          nextServiceDate: editingMaintenance.nextServiceDate,
          status: editingMaintenance.status,
          remarks: editingMaintenance.remarks,
        } : emptyMaintenance}
        onClose={() => { closeDialog(); setEditingFuel(null); setEditingMaintenance(null); }}
        onSubmit={saveRecord}
      />
      <ConfirmationModal
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.type === "fuel" ? "fuel" : "maintenance"} record`}
        message="This operational record will be removed from the local log. Continue?"
        onConfirm={() => {
          if (pendingDelete?.type === "fuel") fuel.removeRecord(pendingDelete.id);
          if (pendingDelete?.type === "maintenance") maintenance.removeRecord(pendingDelete.id);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}

export default function FuelMaintenancePage() {
  return <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading operational logs...</div>}><FuelMaintenanceContent /></Suspense>;
}
