"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Fuel,
  LayoutDashboard,
  MapPin,
  Plus,
  Route,
  Search,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import {
  AppShell,
  MetricCard,
  Modal,
  PageHeader,
  PrimaryButton,
  QuickActionCard,
  SearchField,
  SectionCard,
  StatusBadge,
  TableCard,
  Toast,
} from "@/components/shell";
import {
  Bus as BusRecord,
  busData,
  DepotRoute,
  Driver as DriverRecord,
  driverData,
  FuelRecord,
  fuelRecords,
  MaintenanceRecord,
  maintenanceRecords,
  operationalStaffSidebarItems,
  routeData,
  ScheduleItem,
  scheduleData,
} from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const tripStatusOptions: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

function OperationalStaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");
  const [currentSection, setCurrentSection] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("srmss-operational-staff-section");
      return stored || "dashboard";
    }
    return "dashboard";
  });

  // Sync with URL and persist to localStorage
  useEffect(() => {
    if (urlSection && urlSection !== currentSection) {
      setCurrentSection(urlSection);
      localStorage.setItem("srmss-operational-staff-section", urlSection);
    }
  }, [urlSection, currentSection]);

  // Persistent Collections
  const { records: schedules, updateRecord: updateSchedule } = usePersistentCollection("srmss-schedules", scheduleData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers } = usePersistentCollection("srmss-drivers", driverData);
  const { records: fuel, addRecord: addFuel } = usePersistentCollection("srmss-fuel-records", fuelRecords);
  const { records: maintenance, addRecord: addMaintenance } = usePersistentCollection("srmss-maintenance-records", maintenanceRecords);

  // Search and Notifications
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for the 8 Functions
  const [viewingRoute, setViewingRoute] = useState<DepotRoute | null>(null);
  const [viewingBus, setViewingBus] = useState<BusRecord | null>(null);
  const [viewingDriver, setViewingDriver] = useState<DriverRecord | null>(null);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);

  // Data Entry Forms
  const todayStr = new Date().toISOString().slice(0, 10);
  const [fuelForm, setFuelForm] = useState({
    date: todayStr,
    busNo: busData[0]?.busNo || "NP-2201",
    route: routeData[0]?.name || "Colombo - Kandy",
    fuelLiters: "100",
    cost: "15500",
    remarks: "",
  });

  const [maintForm, setMaintForm] = useState({
    vehicle: busData[0]?.busNo || "NP-2201",
    type: "Routine Maintenance" as "Routine Maintenance" | "Corrective Maintenance",
    date: todayStr,
    nextServiceDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: "Scheduled" as "Scheduled" | "Completed" | "Overdue",
    remarks: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navigateSection = (sec: string) => {
    setCurrentSection(sec);
    localStorage.setItem("srmss-operational-staff-section", sec);
    if (sec === "dashboard") {
      router.push("/operational-staff");
    } else {
      router.push(`/operational-staff?section=${sec}`);
    }
  };

  // Dates
  const today = todayStr;
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeek = nextWeekDate.toISOString().slice(0, 10);

  // Computed Metrics
  const todaysTrips = useMemo(() => {
    return schedules
      .filter((s) => s.date === today)
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [schedules, today]);

  const delayedTrips = useMemo(() => schedules.filter((trip) => trip.status === "Delayed"), [schedules]);
  const availableBuses = useMemo(() => buses.filter((bus) => bus.status === "Active" || bus.status === "In Service"), [buses]);
  const availableDrivers = useMemo(() => drivers.filter((driver) => driver.status === "Available"), [drivers]);
  const maintenanceAlerts = useMemo(() => {
    return maintenance.filter((record) => record.status === "Overdue" || (record.status === "Scheduled" && record.nextServiceDate <= nextWeek));
  }, [maintenance, nextWeek]);

  // Function 8: Search Operational Records
  const searchEntries = useMemo(() => [
    ...routes.map((r) => ({ title: r.name, detail: `${r.start} ➔ ${r.end} · ${r.serviceType} · ${r.distance} km`, category: "Route", original: r, type: "route" })),
    ...schedules.map((s) => ({ title: `${s.routeName} (${s.departureTime})`, detail: `Date: ${s.date} · Bus: ${s.busNo} · Driver: ${s.driver} · Status: ${s.status}`, category: "Schedule", original: s, type: "schedule" })),
    ...buses.map((b) => ({ title: `Bus ${b.busNo} (${b.registration})`, detail: `Status: ${b.status} · Capacity: ${b.seatingCapacity} seats · Mileage: ${b.mileage.toLocaleString()} km`, category: "Bus", original: b, type: "bus" })),
    ...drivers.map((d) => ({ title: `Driver ${d.name} (${d.licenseNumber})`, detail: `Status: ${d.status} · Route: ${d.assignedRoute} · Shift: ${d.workingHours}`, category: "Driver", original: d, type: "driver" })),
    ...fuel.map((f) => ({ title: `Fuel Log: ${f.busNo}`, detail: `${f.date} · ${f.fuelLiters} L · LKR ${f.cost.toLocaleString()} · ${f.route}`, category: "Fuel", original: f, type: "fuel" })),
    ...maintenance.map((m) => ({ title: `Maintenance: ${m.vehicle}`, detail: `${m.type} · ${m.status} · Next due: ${m.nextServiceDate}`, category: "Maintenance", original: m, type: "maintenance" })),
  ], [routes, schedules, buses, drivers, fuel, maintenance]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return searchEntries.filter((item) => `${item.title} ${item.detail} ${item.category}`.toLowerCase().includes(q)).slice(0, 10);
  }, [search, searchEntries]);

  // Function 3 Handler: Update Trip Status
  const handleUpdateTripStatus = (trip: ScheduleItem, newStatus: ScheduleItem["status"]) => {
    const { id, ...rest } = trip;
    updateSchedule(id, { ...rest, status: newStatus });
    showToast(`Trip ${trip.routeName} status updated to ${newStatus}`);
  };

  // Function 4 Handler: Record Fuel Usage
  const handleSaveFuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelForm.busNo || !fuelForm.fuelLiters || !fuelForm.cost) return;
    addFuel({
      date: fuelForm.date,
      busNo: fuelForm.busNo,
      route: fuelForm.route,
      fuelLiters: Number(fuelForm.fuelLiters),
      cost: Number(fuelForm.cost),
      remarks: fuelForm.remarks.trim(),
    });
    setFuelModalOpen(false);
    showToast(`Fuel record of ${fuelForm.fuelLiters} L logged for Bus ${fuelForm.busNo}`);
    setFuelForm({
      date: todayStr,
      busNo: buses[0]?.busNo || "NP-2201",
      route: routes[0]?.name || "Colombo - Kandy",
      fuelLiters: "100",
      cost: "15500",
      remarks: "",
    });
  };

  // Function 5 Handler: Record Maintenance Activity
  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.vehicle || !maintForm.type) return;
    addMaintenance({
      vehicle: maintForm.vehicle,
      type: maintForm.type,
      date: maintForm.date,
      nextServiceDate: maintForm.nextServiceDate,
      status: maintForm.status,
      remarks: maintForm.remarks.trim(),
    });
    setMaintenanceModalOpen(false);
    showToast(`Maintenance activity logged for vehicle ${maintForm.vehicle}`);
    setMaintForm({
      vehicle: buses[0]?.busNo || "NP-2201",
      type: "Routine Maintenance",
      date: todayStr,
      nextServiceDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: "Scheduled",
      remarks: "",
    });
  };

  // Dashboard 6 KPI Metrics
  const metrics = [
    {
      label: "Today's Scheduled Trips",
      value: String(todaysTrips.length),
      change: `${schedules.length} total scheduled`,
      icon: CalendarDays,
      accent: "blue" as const,
      onClick: () => navigateSection("schedules"),
    },
    {
      label: "Departures",
      value: String(todaysTrips.length),
      change: "Active daily departures",
      icon: Route,
      accent: "green" as const,
      onClick: () => navigateSection("trip-status"),
    },
    {
      label: "Delayed Trips",
      value: String(delayedTrips.length),
      change: delayedTrips.length ? `${delayedTrips.length} delayed trips` : "All on time",
      icon: Clock,
      accent: delayedTrips.length > 0 ? ("red" as const) : ("green" as const),
      onClick: () => navigateSection("trip-status"),
    },
    {
      label: "Available Buses",
      value: String(availableBuses.length),
      change: `${buses.length} total in fleet`,
      icon: Bus,
      accent: "blue" as const,
      onClick: () => navigateSection("buses"),
    },
    {
      label: "Available Drivers",
      value: String(availableDrivers.length),
      change: `${drivers.length} total drivers`,
      icon: Users,
      accent: "amber" as const,
      onClick: () => navigateSection("drivers"),
    },
    {
      label: "Maintenance Alerts",
      value: String(maintenanceAlerts.length),
      change: maintenanceAlerts.length ? `${maintenanceAlerts.length} require review` : "Up to date",
      icon: Wrench,
      accent: maintenanceAlerts.length > 0 ? ("red" as const) : ("green" as const),
      onClick: () => navigateSection("maintenance"),
    },
  ];

  const sectionsNav = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "routes", label: "View Route Details", icon: Route },
    { id: "schedules", label: "View Schedules", icon: CalendarDays },
    { id: "trip-status", label: "Update Trip Status", icon: Activity },
    { id: "fuel", label: "Record Fuel Usage", icon: Fuel },
    { id: "maintenance", label: "Record Maintenance", icon: Wrench },
    { id: "buses", label: "View Bus Availability", icon: Bus },
    { id: "drivers", label: "View Driver Assignments", icon: Users },
  ];

  return (
    <AppShell
      title="Operational Staff / Depot Clerk"
      subtitle="Day-to-day data entry and operational updates"
      navigationItems={operationalStaffSidebarItems}
      actions={
        <div className="flex items-center gap-2">
          <PrimaryButton onClick={() => setFuelModalOpen(true)}>
            <Fuel className="mr-1.5 h-4 w-4" /> Record Fuel
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setMaintenanceModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]"
          >
            <Wrench className="mr-1.5 h-4 w-4 text-[var(--accent)]" /> Record Maintenance
          </button>
        </div>
      }
    >
      <Toast message={toastMessage || ""} visible={Boolean(toastMessage)} />

      {/* Function 8: Search Operational Records */}
      <div className="mb-6">
        <SectionCard
          title="Search Operational Records"
          subtitle="Instant real-time search across Routes, Schedules, Bus Availability, Driver Assignments, Fuel Usage, and Maintenance Activity"
        >
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by route, schedule, bus number, driver, fuel log, or maintenance..."
          />

          {search.trim() && (
            <div className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4">
              {searchResults.length > 0 ? (
                searchResults.map((result, idx) => (
                  <div key={`${result.category}-${result.title}-${idx}`} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                          {result.category}
                        </span>
                        <span className="truncate font-semibold text-[var(--text-primary)]">{result.title}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{result.detail}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {result.type === "route" && (
                        <button
                          type="button"
                          onClick={() => setViewingRoute(result.original as DepotRoute)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Route
                        </button>
                      )}
                      {result.type === "bus" && (
                        <button
                          type="button"
                          onClick={() => setViewingBus(result.original as BusRecord)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                        >
                          <Eye className="h-3.5 w-3.5" /> Bus Details
                        </button>
                      )}
                      {result.type === "driver" && (
                        <button
                          type="button"
                          onClick={() => setViewingDriver(result.original as DriverRecord)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                        >
                          <Eye className="h-3.5 w-3.5" /> Driver Details
                        </button>
                      )}
                      {result.type === "schedule" && (
                        <button
                          type="button"
                          onClick={() => navigateSection("trip-status")}
                          className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[var(--accent-dark)]"
                        >
                          <Activity className="h-3.5 w-3.5" /> Update Status
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                  No matching operational records found for &ldquo;{search}&rdquo;.
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* 6 Required Dashboard KPI Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            onClick={metric.onClick}
            className="cursor-pointer transition hover:scale-[1.02]"
            role="button"
            tabIndex={0}
          >
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Function Tabs Navigation (Strictly the 8 Functions) */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
        {sectionsNav.map((sec) => {
          const Icon = sec.icon;
          const isActive = currentSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => navigateSection(sec.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-secondary)] hover:bg-[var(--soft)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {currentSection === "dashboard" && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            {/* Departures Board */}
            <SectionCard
              title="Today's Departures & Scheduled Trips"
              subtitle={`${todaysTrips.length} departure trips scheduled for today (${today})`}
              action={
                <button
                  type="button"
                  onClick={() => navigateSection("trip-status")}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Manage all trip statuses →
                </button>
              }
            >
              <TableCard
                headers={["Departure", "Route Name", "Bus", "Driver", "Service Type", "Trip Status", "Update Status"]}
                rows={todaysTrips.map((trip) => (
                  <>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{trip.routeName}</div>
                      <div className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.serviceType} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.status} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Update status for ${trip.routeName}`}
                        value={trip.status}
                        onChange={(e) => handleUpdateTripStatus(trip, e.target.value as ScheduleItem["status"])}
                        className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      >
                        {tripStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </>
                ))}
                emptyTitle="No trips scheduled for today"
                emptyDescription="Check schedules to view all upcoming trips."
              />
            </SectionCard>

            {/* Maintenance Alerts & Delayed Watch */}
            <div className="space-y-6">
              <SectionCard
                title="Maintenance Alerts"
                subtitle="Due within 7 days or overdue"
                action={
                  <button
                    type="button"
                    onClick={() => setMaintenanceModalOpen(true)}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    + Record Service
                  </button>
                }
              >
                {maintenanceAlerts.length > 0 ? (
                  <div className="divide-y divide-[var(--border)]">
                    {maintenanceAlerts.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--text-primary)]">
                            {m.vehicle} · {m.type}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Next service due: <span className="font-medium text-[var(--text-primary)]">{m.nextServiceDate}</span>
                          </div>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="mx-auto mb-1 h-5 w-5" /> All maintenance is up to date.
                  </p>
                )}
              </SectionCard>

              <SectionCard
                title="Delayed Trips Watch"
                subtitle="Attention required on scheduled departures"
                action={
                  <button
                    type="button"
                    onClick={() => navigateSection("trip-status")}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Update statuses
                  </button>
                }
              >
                {delayedTrips.length > 0 ? (
                  <div className="space-y-2">
                    {delayedTrips.map((dt) => (
                      <div
                        key={dt.id}
                        className="flex items-center justify-between rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-xs text-[var(--text-primary)]"
                      >
                        <div>
                          <div className="font-semibold text-amber-700 dark:text-amber-300">{dt.routeName}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            Dep: {dt.departureTime} · Bus: {dt.busNo} · Driver: {dt.driver}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateTripStatus(dt, "On Time")}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Clear Delay
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-center text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="mx-auto mb-1 h-5 w-5" /> No delayed departures currently.
                  </p>
                )}
              </SectionCard>
            </div>
          </div>

          {/* Quick Action Navigation Grid to the other 7 Functions */}
          <div className="mt-8">
            <PageHeader title="Operational Functions" subtitle="Execute day-to-day data entry and updates" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div onClick={() => navigateSection("routes")} className="cursor-pointer">
                <QuickActionCard
                  title="View Route Details"
                  icon={Route}
                  description="Inspect intermediate stops, endpoints, and route distances."
                  href="#routes"
                />
              </div>
              <div onClick={() => navigateSection("schedules")} className="cursor-pointer">
                <QuickActionCard
                  title="View Schedules"
                  icon={CalendarDays}
                  description="Check daily timetables, departure/arrival schedules."
                  href="#schedules"
                />
              </div>
              <div onClick={() => navigateSection("trip-status")} className="cursor-pointer">
                <QuickActionCard
                  title="Update Trip Status"
                  icon={Activity}
                  description="Set live trip status (Scheduled, On Time, Delayed, Completed)."
                  href="#trip-status"
                />
              </div>
              <div onClick={() => setFuelModalOpen(true)} className="cursor-pointer">
                <QuickActionCard
                  title="Record Fuel Usage"
                  icon={Fuel}
                  description="Log fuel liters, cost in LKR, and route consumption."
                  href="#fuel"
                />
              </div>
              <div onClick={() => setMaintenanceModalOpen(true)} className="cursor-pointer">
                <QuickActionCard
                  title="Record Maintenance Activity"
                  icon={Wrench}
                  description="Record routine or corrective vehicle maintenance."
                  href="#maintenance"
                />
              </div>
              <div onClick={() => navigateSection("buses")} className="cursor-pointer">
                <QuickActionCard
                  title="View Bus Availability"
                  icon={Bus}
                  description="View fleet status, seating capacity, mileage and readiness."
                  href="#buses"
                />
              </div>
              <div onClick={() => navigateSection("drivers")} className="cursor-pointer">
                <QuickActionCard
                  title="View Driver Assignments"
                  icon={Users}
                  description="Review driver duty roster, assigned routes and shift hours."
                  href="#drivers"
                />
              </div>
              <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="cursor-pointer">
                <QuickActionCard
                  title="Search Operational Records"
                  icon={Search}
                  description="Global instant search across all operational depot records."
                  href="#search"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FUNCTION 1: VIEW ROUTE DETAILS */}
      {currentSection === "routes" && (
        <div className="space-y-6">
          <PageHeader title="View Route Details" subtitle="Inspect managed service corridors, endpoints, intermediate stops, and assigned assets" />
          <SectionCard title="Route Network Directory">
            <TableCard
              headers={["Route Name", "Start Point", "Destination", "Intermediate Stops", "Distance (km)", "Service Type", "Assigned Bus", "Assigned Driver", "Status", "Action"]}
              rows={routes.map((r) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{r.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.start}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.end}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.stops.length} stops ({r.stops.join(", ")})</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.distance} km</td>
                  <td className="px-4 py-3"><StatusBadge status={r.serviceType} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find((b) => b.id === r.busId)?.busNo ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{drivers.find((d) => d.id === r.driverId)?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewingRoute(r)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5 text-[var(--accent)]" /> View Details
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* FUNCTION 2: VIEW SCHEDULES */}
      {currentSection === "schedules" && (
        <div className="space-y-6">
          <PageHeader title="View Schedules" subtitle="Timetables, departure/arrival times, vehicle assignments, and driver duties" />
          <SectionCard title="Timetable Directory">
            <TableCard
              headers={["Date", "Departure Time", "Arrival Time", "Route Name", "Fleet Bus No", "Assigned Driver", "Service Type", "Status"]}
              rows={schedules.map((trip) => (
                <>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.date}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.arrivalTime}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.routeName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                  <td className="px-4 py-3"><StatusBadge status={trip.serviceType} /></td>
                  <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* FUNCTION 3: UPDATE TRIP STATUS */}
      {currentSection === "trip-status" && (
        <div className="space-y-6">
          <PageHeader title="Update Trip Status" subtitle="Update live departure and trip progress directly for daily schedules" />
          <SectionCard title="Live Trip Status Management">
            <TableCard
              headers={["Date", "Departure", "Arrival", "Route", "Bus No", "Driver", "Current Status", "Update Status Action"]}
              rows={schedules.map((trip) => (
                <>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.date}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.arrivalTime}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{trip.routeName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                  <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Update status for ${trip.routeName} on ${trip.date}`}
                      value={trip.status}
                      onChange={(e) => handleUpdateTripStatus(trip, e.target.value as ScheduleItem["status"])}
                      className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {tripStatusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* FUNCTION 4: RECORD FUEL USAGE */}
      {currentSection === "fuel" && (
        <div className="space-y-6">
          <PageHeader
            title="Record Fuel Usage"
            subtitle="Track fuel top-ups, route consumption, and costs across the fleet"
            action={
              <PrimaryButton onClick={() => setFuelModalOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Log Fuel Record
              </PrimaryButton>
            }
          />
          <SectionCard title="Recorded Fuel Logs">
            <TableCard
              headers={["Date", "Bus Fleet No", "Route", "Fuel (Liters)", "Cost (LKR)", "Remarks / Notes"]}
              rows={fuel.map((f) => (
                <>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{f.date}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{f.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{f.route}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{f.fuelLiters} L</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">LKR {f.cost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{f.remarks || "—"}</td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* FUNCTION 5: RECORD MAINTENANCE ACTIVITY */}
      {currentSection === "maintenance" && (
        <div className="space-y-6">
          <PageHeader
            title="Record Maintenance Activity"
            subtitle="Track vehicle service history, routine inspections, and corrective repairs"
            action={
              <PrimaryButton onClick={() => setMaintenanceModalOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Log Maintenance
              </PrimaryButton>
            }
          />
          <SectionCard title="Recorded Maintenance Activities">
            <TableCard
              headers={["Vehicle Bus", "Maintenance Type", "Service Date", "Next Service Due", "Status", "Remarks / Diagnostics"]}
              rows={maintenance.map((m) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{m.vehicle}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{m.type}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{m.date}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{m.nextServiceDate}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{m.remarks || "—"}</td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* FUNCTION 6: VIEW BUS AVAILABILITY */}
      {currentSection === "buses" && (
        <div className="space-y-6">
          <PageHeader title="View Bus Availability" subtitle="Fleet readiness, seating capacity, mileage, and operational states" />
          <SectionCard title="Fleet Availability Roster">
            <TableCard
              headers={["Bus Fleet No", "Registration", "Seating Capacity", "Mileage (km)", "Operational Status", "Maintenance History", "Details"]}
              rows={buses.map((bus) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{bus.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.registration}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.seatingCapacity} Seats</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3"><StatusBadge status={bus.status} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{bus.maintenanceHistory[0] || "None"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewingBus(bus)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Specs
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* FUNCTION 7: VIEW DRIVER ASSIGNMENTS */}
      {currentSection === "drivers" && (
        <div className="space-y-6">
          <PageHeader title="View Driver Assignments" subtitle="Driver duty roster, contact information, assigned corridors, and working shifts" />
          <SectionCard title="Driver Roster & Assignments">
            <TableCard
              headers={["Driver Name", "License No", "Contact Phone", "Assigned Corridor", "Working Shift Hours", "Duty Status", "Action"]}
              rows={drivers.map((driver) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{driver.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.phone}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.assignedRoute}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.workingHours}</td>
                  <td className="px-4 py-3"><StatusBadge status={driver.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewingDriver(driver)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* MODAL: VIEW ROUTE DETAILS (Function 1) */}
      <Modal open={Boolean(viewingRoute)} title="Route Details" onClose={() => setViewingRoute(null)}>
        {viewingRoute && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Corridor Name</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{viewingRoute.name}</div>
              </div>
              <StatusBadge status={viewingRoute.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Start Point</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingRoute.start}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Destination</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingRoute.end}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Total Distance</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingRoute.distance} km</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Service Type</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingRoute.serviceType}</div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Intermediate Stops</div>
              <div className="flex flex-wrap gap-2">
                {viewingRoute.stops.map((stop, i) => (
                  <span key={stop} className="inline-flex items-center gap-1 rounded-lg bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]">
                    <MapPin className="h-3 w-3 text-[var(--accent)]" /> {stop} ({i + 1})
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingRoute(null)}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: VIEW BUS AVAILABILITY SPECS (Function 6) */}
      <Modal open={Boolean(viewingBus)} title="Bus Availability & Fleet Details" onClose={() => setViewingBus(null)}>
        {viewingBus && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Fleet Number</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{viewingBus.busNo}</div>
              </div>
              <StatusBadge status={viewingBus.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Registration No.</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingBus.registration}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Seating Capacity</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingBus.seatingCapacity} Seats</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Odometer Mileage</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingBus.mileage.toLocaleString()} km</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Availability Status</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingBus.status}</div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Maintenance Logs</div>
              <ul className="list-inside list-disc space-y-1 text-xs text-[var(--text-secondary)]">
                {viewingBus.maintenanceHistory.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingBus(null)}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: VIEW DRIVER DETAILS (Function 7) */}
      <Modal open={Boolean(viewingDriver)} title="Driver Assignment Profile" onClose={() => setViewingDriver(null)}>
        {viewingDriver && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Driver Name</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{viewingDriver.name}</div>
              </div>
              <StatusBadge status={viewingDriver.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">License Number</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingDriver.licenseNumber}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Contact Phone</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingDriver.phone}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Assigned Route</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingDriver.assignedRoute}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Working Shift Hours</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingDriver.workingHours}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingDriver(null)}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: RECORD FUEL USAGE (Function 4) */}
      <Modal open={fuelModalOpen} title="Record Fuel Usage" onClose={() => setFuelModalOpen(false)}>
        <form onSubmit={handleSaveFuel} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Date</span>
              <input
                type="date"
                required
                value={fuelForm.date}
                onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Bus Fleet No</span>
              <select
                required
                value={fuelForm.busNo}
                onChange={(e) => setFuelForm({ ...fuelForm, busNo: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.busNo}>
                    {b.busNo} ({b.registration})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Assigned Route</span>
              <select
                required
                value={fuelForm.route}
                onChange={(e) => setFuelForm({ ...fuelForm, route: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Fuel Amount (Liters)</span>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 100"
                value={fuelForm.fuelLiters}
                onChange={(e) => setFuelForm({ ...fuelForm, fuelLiters: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Cost (LKR)</span>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 15500"
                value={fuelForm.cost}
                onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Remarks / Notes</span>
              <input
                type="text"
                placeholder="Morning fill / Peak route top-up"
                value={fuelForm.remarks}
                onChange={(e) => setFuelForm({ ...fuelForm, remarks: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setFuelModalOpen(false)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
            >
              Save Fuel Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD MAINTENANCE ACTIVITY (Function 5) */}
      <Modal open={maintenanceModalOpen} title="Record Maintenance Activity" onClose={() => setMaintenanceModalOpen(false)}>
        <form onSubmit={handleSaveMaintenance} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Vehicle Bus</span>
              <select
                required
                value={maintForm.vehicle}
                onChange={(e) => setMaintForm({ ...maintForm, vehicle: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.busNo}>
                    {b.busNo} ({b.registration})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Maintenance Type</span>
              <select
                required
                value={maintForm.type}
                onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value as typeof maintForm.type })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                <option value="Routine Maintenance">Routine Maintenance</option>
                <option value="Corrective Maintenance">Corrective Maintenance</option>
              </select>
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Service Date</span>
              <input
                type="date"
                required
                value={maintForm.date}
                onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Next Service Due Date</span>
              <input
                type="date"
                required
                value={maintForm.nextServiceDate}
                onChange={(e) => setMaintForm({ ...maintForm, nextServiceDate: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Status</span>
              <select
                required
                value={maintForm.status}
                onChange={(e) => setMaintForm({ ...maintForm, status: e.target.value as typeof maintForm.status })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">Remarks / Diagnostics</span>
              <input
                type="text"
                placeholder="Oil replacement / Brake inspection"
                value={maintForm.remarks}
                onChange={(e) => setMaintForm({ ...maintForm, remarks: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setMaintenanceModalOpen(false)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
            >
              Save Maintenance Entry
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default function OperationalStaffPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading operational portal...</div>}>
      <OperationalStaffContent />
    </Suspense>
  );
}