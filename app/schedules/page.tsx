"use client";

import { useMemo, useState } from "react";
import { Plus, AlertTriangle, Save } from "lucide-react";
import { AppShell, InputField, PageHeader, PrimaryButton, SearchField, SecondaryButton, SelectField, StatusBadge, TableCard } from "@/components/shell";
import { scheduleData } from "@/lib/mock-data";

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
  const [view, setView] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [records, setRecords] = useState(scheduleData);
  const [conflict, setConflict] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => `${record.routeName} ${record.driver} ${record.busNo}`.toLowerCase().includes(search.toLowerCase()));
  }, [records, search]);

  const detectConflict = (candidate: typeof initialForm) => {
    const candidateStart = Number(candidate.departureTime.replace(":", "."));
    const candidateEnd = Number(candidate.arrivalTime.replace(":", "."));

    for (const current of records) {
      if (current.date !== candidate.date) continue;
      const currentStart = Number(current.departureTime.replace(":", "."));
      const currentEnd = Number(current.arrivalTime.replace(":", "."));
      if (candidate.route !== current.routeName && candidate.driver !== current.driver && candidate.bus !== current.busNo) continue;
      const overlaps = candidateStart <= currentEnd && currentStart <= candidateEnd;
      if (overlaps) {
        return `Schedule Conflict Detected: Route ${candidate.route} overlaps with another scheduled trip between ${current.departureTime} and ${current.arrivalTime}.`;
      }
    }

    return null;
  };

  const handleSave = () => {
    const nextConflict = detectConflict(form);
    setConflict(nextConflict);
    if (nextConflict) return;

    const nextRecord = {
      id: Date.now(),
      routeId: 6,
      routeName: form.route,
      busNo: form.bus,
      driver: form.driver,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      date: form.date,
      status: "Scheduled",
      serviceType: form.serviceType as "Normal" | "Express" | "Rural Service",
    };

    setRecords((current) => [nextRecord, ...current]);
    setForm(initialForm);
  };

  return (
    <AppShell title="Schedule Management" subtitle="Coordinate daily, weekly, and monthly trip plans.">
      <PageHeader title="Schedules" subtitle="Timetable operations" action={<PrimaryButton onClick={handleSave}><Plus className="mr-2 h-4 w-4" /> New Schedule</PrimaryButton>} />

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

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Schedule Form</h3>
          <div className="mt-5 grid gap-4">
            <SelectField label="Route" value={form.route} onChange={(value) => setForm((current) => ({ ...current, route: value }))} options={["Colombo - Kandy", "Kandy - Matale", "Galle - Matara", "Kurunegala - Puttalam", "Negombo - Colombo"]} />
            <SelectField label="Bus" value={form.bus} onChange={(value) => setForm((current) => ({ ...current, bus: value }))} options={["NP-2201", "KA-3324", "GL-1188", "KU-5549", "NE-7712", "MT-6678"]} />
            <SelectField label="Driver" value={form.driver} onChange={(value) => setForm((current) => ({ ...current, driver: value }))} options={["S. Perera", "N. Silva", "R. Fernando", "M. Jayawardena", "T. Kumara", "H. Wanigasekara"]} />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Departure Time" type="time" value={form.departureTime} onChange={(value) => setForm((current) => ({ ...current, departureTime: value }))} />
              <InputField label="Arrival Time" type="time" value={form.arrivalTime} onChange={(value) => setForm((current) => ({ ...current, arrivalTime: value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Date" type="date" value={form.date} onChange={(value) => setForm((current) => ({ ...current, date: value }))} />
              <SelectField label="Service Type" value={form.serviceType} onChange={(value) => setForm((current) => ({ ...current, serviceType: value }))} options={["Normal", "Express", "Rural Service"]} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Schedule</PrimaryButton>
          </div>
        </div>

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
                    <td className="px-4 py-3 text-[var(--text-secondary)]">Edit · Delete</td>
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
    </AppShell>
  );
}
