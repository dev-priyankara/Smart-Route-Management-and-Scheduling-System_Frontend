"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, PencilLine, Plus, Trash2, Users } from "lucide-react";
import { AppShell, ConfirmationModal, Modal, PageHeader, PrimaryButton, SearchField, StatusBadge, TableCard } from "@/components/shell";
import { RecordDialog, RecordField } from "@/components/record-dialog";
import { driverData, Driver as DriverRecord, routeData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const driverFields: RecordField[] = [
  { name: "name", label: "Full name" },
  { name: "licenseNumber", label: "License number" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "assignedRoute", label: "Assigned route", type: "select", options: routeData.map((route) => route.name) },
  { name: "workingHours", label: "Working hours" },
  { name: "status", label: "Status", type: "select", options: ["On Duty", "Off Duty", "Available"] },
];

const emptyDriver = { name: "", licenseNumber: "", phone: "", assignedRoute: routeData[0].name, workingHours: "06:00 - 15:00", status: "Available" };

export default function DriversPage() {
  const { records: drivers, addRecord, updateRecord, removeRecord } = usePersistentCollection("srmss-drivers", driverData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null);
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const currentDriverFields = driverFields.map((field) => field.name === "assignedRoute"
    ? { ...field, options: routes.map((route) => route.name) }
    : field);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "create") setDialogOpen(true);
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch = `${driver.name} ${driver.licenseNumber} ${driver.assignedRoute}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  const openEditor = (driver: DriverRecord | null) => {
    setEditingDriver(driver);
    setDialogOpen(true);
  };

  const saveDriver = (values: Record<string, string>) => {
    const driver = {
      name: values.name.trim(),
      licenseNumber: values.licenseNumber.trim(),
      phone: values.phone.trim(),
      assignedRoute: values.assignedRoute,
      workingHours: values.workingHours.trim(),
      status: values.status as DriverRecord["status"],
    };
    if (editingDriver) updateRecord(editingDriver.id, driver);
    else addRecord(driver);
    setDialogOpen(false);
    setEditingDriver(null);
  };

  return (
    <AppShell title="Drivers" subtitle="Driver roster, assignments and working state.">
      <PageHeader title="Driver Management" subtitle="Staff availability and route coverage" action={<PrimaryButton onClick={() => openEditor(null)}><Plus className="mr-2 h-4 w-4" /> Add Driver</PrimaryButton>} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-lg"><SearchField value={search} onChange={setSearch} placeholder="Search drivers" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
          <option value="All">All statuses</option>
          <option value="On Duty">On Duty</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Available">Available</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Users className="h-5 w-5" /></div>
              <StatusBadge status={driver.status} />
            </div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">{driver.name}</div>
            <div className="mt-1 text-sm text-[var(--text-muted)]">{driver.assignedRoute}</div>
            <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between"><span>License</span><span className="font-medium text-[var(--text-primary)]">{driver.licenseNumber}</span></div>
              <div className="flex items-center justify-between"><span>Phone</span><span className="font-medium text-[var(--text-primary)]">{driver.phone}</span></div>
              <div className="flex items-center justify-between"><span>Hours</span><span className="font-medium text-[var(--text-primary)]">{driver.workingHours}</span></div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedDriver(driver)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View details"><Eye className="h-4 w-4" /></button>
              <button type="button" onClick={() => openEditor(driver)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit"><PencilLine className="h-4 w-4" /></button>
              <button type="button" onClick={() => setPendingDelete(driver.id)} className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
        <TableCard
          headers={["Name", "License No.", "Phone", "Assigned Route", "Working Hours", "Status", "Actions"]}
          rows={filteredDrivers.map((driver) => (
            <>
              <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.phone}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.assignedRoute}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.workingHours}</td>
              <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setSelectedDriver(driver)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => openEditor(driver)} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit"><PencilLine className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setPendingDelete(driver.id)} className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </>
          ))}
          emptyTitle="No drivers found"
          emptyDescription="No driver profile matches the current filter."
        />
      </div>

      <Modal open={Boolean(selectedDriver)} title="Driver Details" onClose={() => setSelectedDriver(null)}>
        {selectedDriver && (
          <div className="space-y-4 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Full name</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>License validity</span>
              <span className="font-semibold text-[var(--text-primary)]">Valid until 2028</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Contact number</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.phone}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Assigned route</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.assignedRoute}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Working hours</span>
              <span className="font-semibold text-[var(--text-primary)]">{selectedDriver.workingHours}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <span>Current status</span>
              <StatusBadge status={selectedDriver.status} />
            </div>
          </div>
        )}
      </Modal>
      <RecordDialog
        open={dialogOpen}
        title={editingDriver ? "Edit driver" : "Add driver"}
        fields={currentDriverFields}
        initialValues={editingDriver ? {
          name: editingDriver.name,
          licenseNumber: editingDriver.licenseNumber,
          phone: editingDriver.phone,
          assignedRoute: editingDriver.assignedRoute,
          workingHours: editingDriver.workingHours,
          status: editingDriver.status,
        } : emptyDriver}
        onClose={() => { setDialogOpen(false); setEditingDriver(null); }}
        onSubmit={saveDriver}
      />
      <ConfirmationModal
        open={pendingDelete !== null}
        title="Delete driver"
        message="This driver and their local demo record will be removed. Continue?"
        onConfirm={() => { if (pendingDelete !== null) removeRecord(pendingDelete); setPendingDelete(null); }}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}
