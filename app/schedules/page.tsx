"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, AlertTriangle, PencilLine, Trash2 } from "lucide-react";
import { AppShell, ConfirmationModal, PageHeader, PrimaryButton, SearchField, StatusBadge, TableCard } from "@/components/shell";
import { RecordDialog, RecordField } from "@/components/record-dialog";
import { busData, driverData, routeData, ScheduleItem, scheduleData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const scheduleFields: RecordField[] = [
  { name: "route", label: "Route", type: "select", options: routeData.map((route) => route.name) },
  { name: "bus", label: "Bus", type: "select", options: busData.map((bus) => bus.busNo) },
  { name: "driver", label: "Driver", type: "select", options: driverData.map((driver) => driver.name) },
  { name: "departureTime", label: "Departure time", type: "time" },
  { name: "arrivalTime", label: "Arrival time", type: "time" },
  { name: "date", label: "Date", type: "date" },
  { name: "serviceType", label: "Service type", type: "select", options: ["Normal", "Express", "Rural Service"] },
  { name: "status", label: "Status", type: "select", options: ["Scheduled", "On Time", "Delayed", "Completed"] },
];

const emptySchedule = { route: routeData[0].name, bus: busData[0].busNo, driver: driverData[0].name, departureTime: "07:30", arrivalTime: "10:05", date: "2026-10-03", serviceType: "Express", status: "Scheduled" };

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const initialForm = {
  route: "Colombo - Kandy",
  bus: "NP-2201",
  driver: "S. Perera",
  departureTime: "07:30",
  arrivalTime: "10:05",
  date: "2026-10-03",
  serviceType: "Express",
};

export default function SchedulesPage() {
  const { records, addRecord, updateRecord, removeRecord } = usePersistentCollection("srmss-schedules", scheduleData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);
  const [view, setView] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [search, setSearch] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const currentScheduleFields = scheduleFields.map((field) => field.name === "route"
    ? { ...field, options: routes.map((route) => route.name) }
    : field.name === "bus" ? { ...field, options: buses.map((bus) => bus.busNo) }
      : field.name === "driver" ? { ...field, options: drivers.map((driver) => driver.name) } : field);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "create") setDialogOpen(true);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => `${record.routeName} ${record.driver} ${record.busNo}`.toLowerCase().includes(search.toLowerCase()));
  }, [records, search]);

  const detectConflict = (candidate: Record<string, string>, ignoredId?: number) => {
    const candidateStart = toMinutes(candidate.departureTime);
    const candidateEnd = toMinutes(candidate.arrivalTime);

    for (const current of records) {
      if (current.id === ignoredId) continue;
      if (current.date !== candidate.date) continue;
      const currentStart = toMinutes(current.departureTime);
      const currentEnd = toMinutes(current.arrivalTime);
      if (candidate.route !== current.routeName && candidate.driver !== current.driver && candidate.bus !== current.busNo) continue;
      const overlaps = candidateStart <= currentEnd && currentStart <= candidateEnd;
      if (overlaps) {
        return `Schedule Conflict Detected: Route ${candidate.route} overlaps with another scheduled trip between ${current.departureTime} and ${current.arrivalTime}.`;
      }
    }

    return null;
  };

  const handleSave = (values: Record<string, string>) => {
    const nextConflict = detectConflict(values, editingSchedule?.id);
    setConflict(nextConflict);
    if (nextConflict) return;

    const route = routes.find((item) => item.name === values.route) ?? routes[0];
    const nextRecord = {
      routeId: route.id,
      routeName: values.route,
      busNo: values.bus,
      driver: values.driver,
      departureTime: values.departureTime,
      arrivalTime: values.arrivalTime,
      date: values.date,
      status: values.status as ScheduleItem["status"],
      serviceType: values.serviceType as ScheduleItem["serviceType"],
    };

    if (editingSchedule) updateRecord(editingSchedule.id, nextRecord);
    else addRecord(nextRecord);
    setConflict(null);
    setDialogOpen(false);
    setEditingSchedule(null);
  };

  return (
    <AppShell title="Schedule Management" subtitle="Coordinate daily, weekly, and monthly trip plans.">
      <PageHeader title="Schedules" subtitle="Timetable operations" action={<PrimaryButton onClick={() => { setEditingSchedule(null); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New Schedule</PrimaryButton>} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["Daily", "Weekly", "Monthly"] as const).map((item) => (
            <button type="button" key={item} onClick={() => setView(item)} className={`rounded-xl px-3 py-2 text-sm font-medium ${view === item ? "bg-[var(--accent)] text-white" : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)]"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchField value={search} onChange={setSearch} placeholder="Search schedules" />
          <button type="button" className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)]">Filter</button>
        </div>
      </div>

      {conflict && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span>{conflict}</span>
        </div>
      )}

      <div className="grid gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          {view === "Daily" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Daily timetable</h3>
              <TableCard
                headers={["Route", "Bus", "Driver", "Departure", "Arrival", "Date", "Status", "Actions"]}
                rows={filteredRecords.map((record) => (
                  <>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{record.routeName}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{record.busNo}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{record.driver}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{record.departureTime}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{record.arrivalTime}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{record.date}</td>
                    <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button type="button" onClick={() => { setEditingSchedule(record); setDialogOpen(true); }} aria-label="Edit schedule" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]"><PencilLine className="h-4 w-4" /></button>
                      <button type="button" onClick={() => setPendingDelete(record.id)} aria-label="Delete schedule" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </>
                ))}
                emptyTitle="No schedules found"
                emptyDescription="No trips match the current search."
              />
            </div>
          )}

          {view === "Weekly" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Weekly schedule view</h3>
              <div className="grid gap-3 md:grid-cols-7">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
                    <div className="mb-3 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Day {index + 1}</div>
                    <div className="space-y-2">
                      {filteredRecords.slice(0, 2).map((record) => (
                        <div key={`${record.id}-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-xs text-[var(--text-secondary)]">
                          {record.routeName}
                          <div className="mt-1 font-medium text-[var(--text-primary)]">{record.departureTime}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "Monthly" && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Monthly calendar</h3>
              <div className="grid gap-3 md:grid-cols-7">
                {Array.from({ length: 30 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
                    <div className="mb-2 text-xs text-[var(--text-muted)]">{index + 1}</div>
                    {index % 3 === 0 && (
                      <div className="rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-medium text-[var(--accent)]">Trip</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <RecordDialog
        open={dialogOpen}
        title={editingSchedule ? "Edit schedule" : "New schedule"}
        fields={currentScheduleFields}
        initialValues={editingSchedule ? {
          route: editingSchedule.routeName,
          bus: editingSchedule.busNo,
          driver: editingSchedule.driver,
          departureTime: editingSchedule.departureTime,
          arrivalTime: editingSchedule.arrivalTime,
          date: editingSchedule.date,
          serviceType: editingSchedule.serviceType,
          status: editingSchedule.status,
        } : emptySchedule}
        onClose={() => { setDialogOpen(false); setEditingSchedule(null); setConflict(null); }}
        onSubmit={handleSave}
      />
      <ConfirmationModal
        open={pendingDelete !== null}
        title="Delete schedule"
        message="This scheduled trip will be removed from the local timetable. Continue?"
        onConfirm={() => { if (pendingDelete !== null) removeRecord(pendingDelete); setPendingDelete(null); }}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}
