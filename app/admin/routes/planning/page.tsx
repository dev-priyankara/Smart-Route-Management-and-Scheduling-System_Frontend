"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, MapPinned, Minus, Plus, Save, X } from "lucide-react";
import { AppShell, InputField, MapCard, Modal, PageHeader, PrimaryButton, SecondaryButton, SelectField, StatusBadge } from "@/components/shell";
import { busData, driverData, routeData, DepotRoute } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const initialForm = {
  routeName: "",
  startPoint: "",
  endPoint: "",
  totalDistance: "",
  serviceType: "Normal",
  busAssignment: "NP-2201",
  driverAssignment: "S. Perera",
};

export default function RoutePlanningPage() {
  const { addRecord } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);
  const [form, setForm] = useState(initialForm);
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  const [showSavedToast, setShowSavedToast] = useState(false);

  const moveStop = (index: number, direction: "up" | "down") => {
    setStops((current) => {
      const next = [...current];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return current;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const addStop = () => {
    if (!newStop.trim()) return;
    setStops((current) => [...current, newStop.trim()]);
    setNewStop("");
  };

  const removeStop = (index: number) => {
    setStops((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSave = () => {
    const assignedBus = buses.find((bus) => bus.busNo === form.busAssignment);
    const assignedDriver = drivers.find((driver) => driver.name === form.driverAssignment);
    addRecord({
      name: form.routeName.trim(),
      start: form.startPoint.trim(),
      end: form.endPoint.trim(),
      stops,
      distance: Number(form.totalDistance),
      serviceType: form.serviceType as DepotRoute["serviceType"],
      busId: assignedBus?.id ?? 0,
      driverId: assignedDriver?.id ?? 0,
      status: "Planned",
      color: "#146CFA",
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 1900);
  };

  const routePreview = useMemo(() => ({
    routeName: form.routeName || "New Route",
    start: form.startPoint || "Start",
    end: form.endPoint || "End",
    stops,
  }), [form, stops]);

  return (
    <AppShell title="Route Planning" subtitle="Create, modify and manage routes.">
      <PageHeader title="Route Planning" subtitle="Build efficient service corridors and assignments" action={<PrimaryButton onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Route</PrimaryButton>} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Route Name" value={form.routeName} onChange={(value) => setForm((current) => ({ ...current, routeName: value }))} placeholder="Colombo - Kandy" />
            <InputField label="Total Distance" value={form.totalDistance} onChange={(value) => setForm((current) => ({ ...current, totalDistance: value }))} placeholder="142" />
            <InputField label="Start Point" value={form.startPoint} onChange={(value) => setForm((current) => ({ ...current, startPoint: value }))} placeholder="Colombo" />
            <InputField label="End Point" value={form.endPoint} onChange={(value) => setForm((current) => ({ ...current, endPoint: value }))} placeholder="Kandy" />
            <SelectField label="Service Type" value={form.serviceType} onChange={(value) => setForm((current) => ({ ...current, serviceType: value }))} options={["Normal", "Express", "Rural Service"]} />
            <SelectField label="Bus Assignment" value={form.busAssignment} onChange={(value) => setForm((current) => ({ ...current, busAssignment: value }))} options={buses.map((bus) => bus.busNo)} />
            <div className="md:col-span-2">
              <SelectField label="Driver Assignment" value={form.driverAssignment} onChange={(value) => setForm((current) => ({ ...current, driverAssignment: value }))} options={drivers.map((driver) => driver.name)} />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Intermediate Stops</h3>
              <span className="text-sm text-[var(--text-muted)]">{stops.length} stops</span>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={`${stop}-${index}`} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">{index + 1}</span>
                  <div className="flex-1 text-sm font-medium text-[var(--text-primary)]">{stop}</div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" onClick={() => moveStop(index, "up")} aria-label="Move stop up">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" onClick={() => moveStop(index, "down")} aria-label="Move stop down">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={() => removeStop(index)} aria-label="Remove stop">
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input value={newStop} onChange={(event) => setNewStop(event.target.value)} placeholder="Add intermediate stop" className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
              <button type="button" onClick={addStop} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-dark)]">
                <Plus className="h-4 w-4" /> Add stop
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave}>Save Route</PrimaryButton>
          </div>
        </div>

        <div className="space-y-6">
          <MapCard routeName={routePreview.routeName} start={routePreview.start} end={routePreview.end} stops={routePreview.stops} />

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Route Summary</h3>
                <p className="text-sm text-[var(--text-muted)]">Assignment preview</p>
              </div>
              <StatusBadge status={form.serviceType} />
            </div>
            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-2.5"><span>Bus</span><span className="font-medium text-[var(--text-primary)]">{form.busAssignment}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-2.5"><span>Driver</span><span className="font-medium text-[var(--text-primary)]">{form.driverAssignment}</span></div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-2.5"><span>Distance</span><span className="font-medium text-[var(--text-primary)]">{form.totalDistance} km</span></div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-2.5"><span>Stops</span><span className="font-medium text-[var(--text-primary)]">{stops.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showSavedToast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          Route saved successfully.
        </div>
      )}
    </AppShell>
  );
}
