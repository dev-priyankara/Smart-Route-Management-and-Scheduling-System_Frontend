"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilLine, Plus, Trash2, Eye, Route as RouteIcon, Radio } from "lucide-react";
import { AppShell, MapCard, PageHeader, PrimaryButton, SearchField, StatusBadge, TableCard, ConfirmationModal } from "@/components/shell";
import { RecordDialog, RecordField } from "@/components/record-dialog";
import { busData, driverData, routeData, DepotRoute } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const routeFields: RecordField[] = [
  { name: "name", label: "Route name" },
  { name: "start", label: "Start point" },
  { name: "end", label: "Destination" },
  { name: "distance", label: "Distance (km)", type: "number" },
  { name: "stops", label: "Intermediate stops (comma separated)", required: false },
  { name: "serviceType", label: "Service type", type: "select", options: ["Normal", "Express", "Rural Service"] },
  { name: "bus", label: "Assigned bus", type: "select", options: busData.map((bus) => bus.busNo) },
  { name: "driver", label: "Assigned driver", type: "select", options: driverData.map((driver) => driver.name) },
  { name: "status", label: "Status", type: "select", options: ["Active", "Planned", "Delayed", "Completed"] },
];

const emptyRoute = { name: "", start: "", end: "", distance: "", stops: "", serviceType: "Normal", bus: busData[0].busNo, driver: driverData[0].name, status: "Active" };

export default function RoutesPage() {
  const { records: routes, addRecord, updateRecord, removeRecord } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState(routeData[0].id);
  const [selectedBus, setSelectedBus] = useState(busData[0].busNo);
  const [editingRoute, setEditingRoute] = useState<DepotRoute | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentRouteFields = routeFields.map((field) => field.name === "bus"
    ? { ...field, options: buses.map((bus) => bus.busNo) }
    : field.name === "driver" ? { ...field, options: drivers.map((driver) => driver.name) } : field);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("action") === "create") setDialogOpen(true);
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesSearch = `${route.name} ${route.start} ${route.end}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = selectedStatus === "All" || route.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [routes, search, selectedStatus]);

  const previewRoute = routes.find((route) => route.id === selectedRouteId) ?? filteredRoutes[0] ?? routes[0];
  const routeValues = (route: DepotRoute | null) => route ? {
    name: route.name,
    start: route.start,
    end: route.end,
    distance: String(route.distance),
    stops: route.stops.join(", "),
    serviceType: route.serviceType,
    bus: buses.find((bus) => bus.id === route.busId)?.busNo ?? buses[0]?.busNo ?? "",
    driver: drivers.find((driver) => driver.id === route.driverId)?.name ?? drivers[0]?.name ?? "",
    status: route.status,
  } : emptyRoute;

  const saveRoute = (values: Record<string, string>) => {
    const bus = buses.find((item) => item.busNo === values.bus);
    const driver = drivers.find((item) => item.name === values.driver);
    const route = {
      name: values.name.trim(),
      start: values.start.trim(),
      end: values.end.trim(),
      distance: Number(values.distance),
      stops: values.stops.split(",").map((stop) => stop.trim()).filter(Boolean),
      serviceType: values.serviceType as DepotRoute["serviceType"],
      busId: bus?.id ?? 0,
      driverId: driver?.id ?? 0,
      status: values.status as DepotRoute["status"],
      color: "#146CFA",
    };
    if (editingRoute) updateRecord(editingRoute.id, route);
    else addRecord(route);
    setSelectedRouteId(editingRoute?.id ?? Math.max(0, ...routes.map((item) => item.id)) + 1);
    setSelectedBus(values.bus);
    setDialogOpen(false);
    setEditingRoute(null);
  };

  return (
    <AppShell title="Route Planning" subtitle="Create, modify and manage routes.">
      <PageHeader
        title="Routes"
        subtitle="Operational route overview"
        action={
            <PrimaryButton onClick={() => { setEditingRoute(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Route
            </PrimaryButton>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-lg">
          <SearchField value={search} onChange={setSearch} placeholder="Search routes" />
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Delayed">Delayed</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">Select route
                <select value={previewRoute?.id ?? ""} onChange={(event) => { const route = routes.find((item) => item.id === Number(event.target.value)); if (route) { setSelectedRouteId(route.id); setSelectedBus(buses.find((bus) => bus.id === route.busId)?.busNo ?? ""); } }} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm">
                  {routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-[var(--text-primary)]">Tracking bus
                <select value={buses.some((bus) => bus.busNo === selectedBus) ? selectedBus : buses[0]?.busNo ?? ""} onChange={(event) => setSelectedBus(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm">
                  {buses.map((bus) => <option key={bus.id} value={bus.busNo}>{bus.busNo}</option>)}
                </select>
              </label>
            </div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-700"><Radio className="h-4 w-4" /> Tracking preview · demo data · {selectedBus}</div>
            {previewRoute && <MapCard routeName={previewRoute.name} start={previewRoute.start} end={previewRoute.end} stops={previewRoute.stops} />}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <TableCard
              headers={["Route", "Start", "Destination", "Stops", "Distance", "Service Type", "Bus", "Driver", "Status", "Actions"]}
              rows={filteredRoutes.map((route) => (
                <>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{route.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.start}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.end}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.stops.length}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.distance} km</td>
                  <td className="px-4 py-3"><StatusBadge status={route.serviceType} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find((bus) => bus.id === route.busId)?.busNo ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{drivers.find((driver) => driver.id === route.driverId)?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3"><StatusBadge status={route.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setSelectedRouteId(route.id); setSelectedBus(buses.find((bus) => bus.id === route.busId)?.busNo ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit" onClick={() => { setEditingRoute(route); setDialogOpen(true); }}>
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete" onClick={() => setPendingDelete(route.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              ))}
              emptyTitle="No routes found"
              emptyDescription="Try adjusting your route search or filters."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Route Overview</h3>
                <p className="text-sm text-[var(--text-muted)]">Service coverage</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Longest route</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{routes.reduce((longest, route) => route.distance > longest.distance ? route : longest, routes[0] ?? { name: "No route", distance: 0 }).name}</div>
                <div className="mt-1 text-sm text-[var(--text-muted)]">{routes.length} managed routes</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Coverage</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{routes.length} corridors</div>
                <div className="mt-1 text-sm text-[var(--text-muted)]">Urban, coastal and rural service range</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={pendingDelete !== null}
        title="Delete route"
        message="This route will be removed from the saved route list. Do you want to continue?"
        onConfirm={() => {
          if (pendingDelete !== null) removeRecord(pendingDelete);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
      <RecordDialog
        open={dialogOpen}
        title={editingRoute ? "Edit route" : "Add route"}
        fields={currentRouteFields}
        initialValues={routeValues(editingRoute)}
        onClose={() => { setDialogOpen(false); setEditingRoute(null); }}
        onSubmit={saveRoute}
      />
    </AppShell>
  );
}
