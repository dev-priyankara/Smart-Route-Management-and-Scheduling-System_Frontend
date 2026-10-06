"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Cloud,
  CloudRain,
  DollarSign,
  Download,
  Droplets,
  Eye,
  FileText,
  Fuel,
  Gauge,
  History,
  Info,
  LayoutDashboard,
  MapPin,
  MapPinned,
  Navigation,
  PauseCircle,
  Phone,
  Plus,
  Printer,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  StopCircle,
  Thermometer,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  X,
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
  MaintenanceRecord,
  maintenanceRecords,
  OperationalException,
  routeData,
  ScheduleConflict,
  ScheduleItem,
  scheduleData,
  supervisorConflictsData,
  supervisorExceptionsData,
} from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

const tripStatusOptions: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];

function SupervisorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");
  const [currentSection, setCurrentSection] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("srmss-supervisor-section");
      return stored || "overview";
    }
    return "overview";
  });

  // Sync with URL and persist to localStorage
  useEffect(() => {
    if (urlSection && urlSection !== currentSection) {
      setCurrentSection(urlSection);
      localStorage.setItem("srmss-supervisor-section", urlSection);
    }
  }, [urlSection, currentSection]);

  const navigateSection = (sec: string) => {
    setCurrentSection(sec);
    localStorage.setItem("srmss-supervisor-section", sec);
    if (sec === "overview") {
      router.push("/supervisor");
    } else {
      router.push(`/supervisor?section=${sec}`);
    }
  };

  // Persistent Storage Collections
  const { records: schedules, updateRecord: updateSchedule } = usePersistentCollection("srmss-schedules", scheduleData);
  const { records: routes } = usePersistentCollection("srmss-routes", routeData);
  const { records: buses, updateRecord: updateBus } = usePersistentCollection("srmss-buses", busData);
  const { records: drivers, updateRecord: updateDriver } = usePersistentCollection("srmss-drivers", driverData);
  const { records: conflicts, updateRecord: updateConflict } = usePersistentCollection("srmss-conflicts", supervisorConflictsData);
  const { records: exceptions, addRecord: addException, updateRecord: updateException } = usePersistentCollection("srmss-exceptions", supervisorExceptionsData);
  const { records: maintenance } = usePersistentCollection("srmss-maintenance", maintenanceRecords);

  // States & Notifications
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Modals
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);
  const [selectedException, setSelectedException] = useState<OperationalException | null>(null);
  const [resourceAllocationOpen, setResourceAllocationOpen] = useState(false);
  const [emergencyAdjustmentOpen, setEmergencyAdjustmentOpen] = useState(false);
  const [viewingTripDetails, setViewingTripDetails] = useState<ScheduleItem | null>(null);
  const [viewingBus, setViewingBus] = useState<BusRecord | null>(null);
  const [viewingDriver, setViewingDriver] = useState<DriverRecord | null>(null);
  const [driverAssignmentOpen, setDriverAssignmentOpen] = useState(false);

  // Form State: Resource Allocation
  const [allocateForm, setAllocateForm] = useState({
    routeId: String(routes[0]?.id || 1),
    busNo: buses[0]?.busNo || "NP-2201",
    driverName: drivers[0]?.name || "S. Perera",
  });

  // Form State: Emergency Schedule Adjustment
  const [emergencyForm, setEmergencyForm] = useState({
    scheduleId: String(schedules[0]?.id || 1),
    reason: "Emergency Road Closure",
    newDepartureTime: "08:00",
    newArrivalTime: "10:35",
    remarks: "Adjusted due to Kadawatha expressway lane obstruction",
  });

  // Form State: Driver Assignment
  const [driverAssignForm, setDriverAssignForm] = useState({
    driverName: drivers[0]?.name || "S. Perera",
    newStatus: "On Duty",
    remarks: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dates
  const todayStr = new Date().toISOString().slice(0, 10);

  // Computed Operational Data
  const todaysSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.date === todayStr)
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [schedules, todayStr]);

  const dispatchedTrips = useMemo(() => todaysSchedules.filter((s) => s.status === "On Time" || s.status === "Completed"), [todaysSchedules]);
  const tripsInProgress = useMemo(() => todaysSchedules.filter((s) => s.status === "On Time"), [todaysSchedules]);
  const delayedTrips = useMemo(() => todaysSchedules.filter((s) => s.status === "Delayed"), [todaysSchedules]);
  const scheduledTrips = useMemo(() => todaysSchedules.filter((s) => s.status === "Scheduled"), [todaysSchedules]);
  const completedTrips = useMemo(() => schedules.filter((s) => s.status === "Completed"), [schedules]);
  const openExceptions = useMemo(() => exceptions.filter((e) => e.status !== "Resolved"), [exceptions]);
  const unresolvedConflicts = useMemo(() => conflicts.filter((c) => c.status === "Unresolved"), [conflicts]);

  const activeBuses = useMemo(() => buses.filter((b) => b.status === "Active" || b.status === "In Service"), [buses]);
  const availableBuses = useMemo(() => buses.filter((b) => b.status === "Active"), [buses]);
  const busesUnderMaintenance = useMemo(() => buses.filter((b) => b.status === "Under Maintenance" || b.status === "Out of Service"), [buses]);

  const onDutyDrivers = useMemo(() => drivers.filter((d) => d.status === "On Duty"), [drivers]);
  const availableDrivers = useMemo(() => drivers.filter((d) => d.status === "Available"), [drivers]);
  const offDutyDrivers = useMemo(() => drivers.filter((d) => d.status === "Off Duty"), [drivers]);

  // Operational Fleet Utilization %
  const fleetUtilizationRate = buses.length ? Math.round((activeBuses.length / buses.length) * 100) : 0;
  const driverDutyRate = drivers.length ? Math.round((onDutyDrivers.length / drivers.length) * 100) : 0;
  const dispatchRate = todaysSchedules.length ? Math.round((dispatchedTrips.length / todaysSchedules.length) * 100) : 0;
  const onTimeRate = dispatchedTrips.length ? Math.round((tripsInProgress.length / dispatchedTrips.length) * 100) : 0;

  // Resource Allocation Handler
  const handleAllocateResource = (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoute = routes.find((r) => r.id === Number(allocateForm.routeId));
    const selectedBusObj = buses.find((b) => b.busNo === allocateForm.busNo);
    const selectedDriverObj = drivers.find((d) => d.name === allocateForm.driverName);

    if (selectedBusObj && (selectedBusObj.status === "Under Maintenance" || selectedBusObj.status === "Out of Service")) {
      showToast(`Cannot allocate Bus ${allocateForm.busNo} — Vehicle is under maintenance!`);
      return;
    }

    // Update schedules matching this route
    const matchingSchedule = todaysSchedules.find((s) => s.routeName === targetRoute?.name);
    if (matchingSchedule) {
      updateSchedule(matchingSchedule.id, {
        ...matchingSchedule,
        busNo: allocateForm.busNo,
        driver: allocateForm.driverName,
      });
    }

    setResourceAllocationOpen(false);
    showToast(`Successfully allocated Bus ${allocateForm.busNo} and Driver ${allocateForm.driverName} to ${targetRoute?.name || "Route"}`);
  };

  // Emergency Schedule Adjustment Handler
  const handleApplyEmergencyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSchedule = schedules.find((s) => s.id === Number(emergencyForm.scheduleId));
    if (!targetSchedule) return;

    const { id, ...rest } = targetSchedule;
    updateSchedule(id, {
      ...rest,
      departureTime: emergencyForm.newDepartureTime,
      arrivalTime: emergencyForm.newArrivalTime,
      status: "Delayed",
    });

    // Add exception log
    addException({
      type: "Schedule Disruption",
      route: targetSchedule.routeName,
      entity: `Bus ${targetSchedule.busNo}`,
      time: emergencyForm.newDepartureTime,
      reason: `${emergencyForm.reason} (${emergencyForm.remarks})`,
      status: "In Progress",
    });

    setEmergencyAdjustmentOpen(false);
    showToast(`Emergency adjustment applied to ${targetSchedule.routeName}: Departure set to ${emergencyForm.newDepartureTime}`);
  };

  // Conflict Resolution Handler
  const handleResolveConflict = (conflictItem: ScheduleConflict) => {
    const { id, ...rest } = conflictItem;
    updateConflict(id, { ...rest, status: "Resolved" });
    showToast(`Schedule conflict for ${conflictItem.route} marked as Resolved`);
    setSelectedConflict(null);
  };

  // Exception Resolution Handler
  const handleResolveException = (exceptionItem: OperationalException, resolution: string) => {
    const { id, ...rest } = exceptionItem;
    updateException(id, {
      ...rest,
      status: "Resolved",
      resolutionNote: resolution,
    });
    showToast(`Exception on ${exceptionItem.route} resolved: ${resolution}`);
    setSelectedException(null);
  };

  // Driver Status Update Handler
  const handleDriverAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const driverObj = drivers.find((d) => d.name === driverAssignForm.driverName);
    if (!driverObj) return;
    updateDriver(driverObj.id, {
      ...driverObj,
      status: driverAssignForm.newStatus as DriverRecord["status"],
    });
    setDriverAssignmentOpen(false);
    showToast(`Driver ${driverAssignForm.driverName} status updated to ${driverAssignForm.newStatus}`);
  };

  // Quick Action Dispatch Handler
  const handleDispatchTrip = (trip: ScheduleItem) => {
    handleUpdateTripStatus(trip, "On Time");
    showToast(`Trip ${trip.routeName} (${trip.departureTime}) successfully Dispatched!`);
  };

  const handleUpdateTripStatus = (trip: ScheduleItem, status: ScheduleItem["status"]) => {
    const { id, ...rest } = trip;
    updateSchedule(id, { ...rest, status });
  };

  // KPI Summary Cards
  const summaryMetrics = [
    {
      label: "Scheduled Trips",
      value: String(todaysSchedules.length),
      change: "Today's depot timetable",
      icon: CalendarDays,
      accent: "blue" as const,
    },
    {
      label: "Dispatched Trips",
      value: String(dispatchedTrips.length),
      change: `${todaysSchedules.length ? Math.round((dispatchedTrips.length / todaysSchedules.length) * 100) : 0}% dispatch rate`,
      icon: CheckCircle2,
      accent: "green" as const,
    },
    {
      label: "In Progress",
      value: String(tripsInProgress.length),
      change: "En route along corridors",
      icon: Route,
      accent: "blue" as const,
    },
    {
      label: "Delayed Trips",
      value: String(delayedTrips.length),
      change: delayedTrips.length ? "Requires mitigation" : "No active delays",
      icon: Clock,
      accent: delayedTrips.length > 0 ? ("amber" as const) : ("green" as const),
    },
    {
      label: "Active Fleet",
      value: String(activeBuses.length),
      change: `${fleetUtilizationRate}% utilization rate`,
      icon: Bus,
      accent: "green" as const,
    },
    {
      label: "On-Duty Drivers",
      value: String(onDutyDrivers.length),
      change: `${driverDutyRate}% duty coverage`,
      icon: Users,
      accent: "blue" as const,
    },
    {
      label: "Open Exceptions",
      value: String(openExceptions.length),
      change: `${unresolvedConflicts.length} schedule conflicts`,
      icon: AlertTriangle,
      accent: openExceptions.length > 0 ? ("red" as const) : ("green" as const),
    },
    {
      label: "On-Time Rate",
      value: `${onTimeRate}%`,
      change: "Trip punctuality index",
      icon: Gauge,
      accent: onTimeRate >= 90 ? "green" as const : onTimeRate >= 70 ? "amber" as const : "red" as const,
    },
  ];

  const selectedEmergencySchedule = useMemo(() => {
    return schedules.find((s) => s.id === Number(emergencyForm.scheduleId)) || schedules[0];
  }, [schedules, emergencyForm.scheduleId]);

  // Navigation Sections
  const sections = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "control", label: "Control Board", icon: Activity },
    { id: "fleet", label: "Vehicle Fleet", icon: Bus },
    { id: "drivers", label: "Driver Roster", icon: Users },
    { id: "routes", label: "Route Network", icon: Route },
    { id: "schedules", label: "Timetable", icon: CalendarDays },
    { id: "conflicts", label: "Conflict Center", icon: AlertTriangle },
    { id: "exceptions", label: "Exceptions & Issues", icon: Wrench },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
  ];

  // Analytics data
  const routePerformanceData = [
    { name: "Colombo - Kandy", value: 92 },
    { name: "Galle - Matara", value: 88 },
    { name: "Kandy - Matale", value: 84 },
    { name: "Negombo - Colombo", value: 90 },
    { name: "Kurunegala - Puttalam", value: 79 },
  ];

  const fleetStatusData = [
    { name: "Active/In Service", value: activeBuses.length, color: "bg-emerald-500" },
    { name: "Under Maintenance", value: buses.filter((b) => b.status === "Under Maintenance").length, color: "bg-amber-500" },
    { name: "Out of Service", value: buses.filter((b) => b.status === "Out of Service").length, color: "bg-rose-500" },
  ];

  const tripStatusData = [
    { name: "Scheduled", value: scheduledTrips.length, color: "bg-slate-500" },
    { name: "On Time", value: tripsInProgress.length, color: "bg-emerald-500" },
    { name: "Delayed", value: delayedTrips.length, color: "bg-amber-500" },
    { name: "Completed", value: completedTrips.length, color: "bg-blue-500" },
  ];

  const driverStatusData = [
    { name: "On Duty", value: onDutyDrivers.length, color: "bg-blue-500" },
    { name: "Available", value: availableDrivers.length, color: "bg-emerald-500" },
    { name: "Off Duty", value: offDutyDrivers.length, color: "bg-slate-500" },
  ];

  return (
    <AppShell
      title="Supervisor Operational Dashboard"
      subtitle="Comprehensive depot operations management and real-time fleet oversight"
    >
      <Toast message={toastMessage || ""} visible={Boolean(toastMessage)} />

      {/* Section Switcher Tabs — always visible */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = currentSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => navigateSection(sec.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
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

      {/* OVERVIEW SECTION */}
      {currentSection === "overview" && (
        <div className="space-y-6">

          {/* Role Banner — overview only */}
          <div className="rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--sidebar-bg)] via-[var(--panel)] to-[var(--soft)] p-5 text-[var(--text-primary)]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  <Sparkles className="h-4 w-4" /> DEPOT SUPERVISOR DASHBOARD
                </div>
                <h2 className="text-xl font-bold">Today&apos;s Depot Operations Overview</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Monitor daily dispatches, track fleet utilization, manage resource allocation, and oversee vehicle availability.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEmergencyAdjustmentOpen(true)}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700"
                >
                  <AlertTriangle className="mr-1.5 h-4 w-4" /> Emergency Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setResourceAllocationOpen(true)}
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--accent-dark)]"
                >
                  <Users className="mr-1.5 h-4 w-4" /> Allocate Resources
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar — overview only */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Current Time</span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Date</span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Depot Location</span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">Central Bus Depot</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Supervisor</span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">A. De Silva</span>
            </div>
          </div>

          {/* KPI Metric Cards — overview only */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summaryMetrics.map((metric) => (
              <div key={metric.label}>
                <MetricCard {...metric} />
              </div>
            ))}
          </div>
          <SectionCard
            title="Action Required Alerts"
            subtitle="Operational items requiring immediate supervisor decision or intervention"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {unresolvedConflicts.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-2xl border border-rose-300 bg-rose-50/60 p-4 dark:border-rose-400/30 dark:bg-rose-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                      <span className="font-bold text-rose-900 dark:text-rose-200">{c.resource}</span>
                    </div>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                      {c.severity} Conflict
                    </span>
                  </div>
                  <p className="my-2 text-xs text-[var(--text-secondary)]">{c.reason}</p>
                  <div className="flex items-center justify-between border-t border-rose-200 pt-2 dark:border-rose-400/20">
                    <span className="text-[11px] text-[var(--text-muted)]">{c.route} · {c.time}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedConflict(c)}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Resolve Conflict
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {openExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className="flex flex-col justify-between rounded-2xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-400/30 dark:bg-amber-500/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-amber-900 dark:text-amber-200">{ex.type}: {ex.entity}</span>
                    </div>
                    <StatusBadge status={ex.status} />
                  </div>
                  <p className="my-2 text-xs text-[var(--text-secondary)]">{ex.reason}</p>
                  <div className="flex items-center justify-between border-t border-amber-200 pt-2 dark:border-amber-400/20">
                    <span className="text-[11px] text-[var(--text-muted)]">{ex.route} · {ex.time}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedException(ex)}
                      className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      Handle Exception
                    </button>
                  </div>
                </div>
              ))}

              {busesUnderMaintenance.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--soft)] p-3 text-xs text-[var(--text-primary)]"
                >
                  <div className="flex items-center gap-3">
                    <Bus className="h-5 w-5 text-rose-500" />
                    <div>
                      <div className="font-bold">Bus {b.busNo} ({b.registration}) Restricted</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Under maintenance · Not available for dispatch allocation</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingBus(b)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Operational Control Board Summary & Utilization */}
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <SectionCard
              title="Today's Operational Control Board"
              subtitle="Daily dispatch timetable and operational condition monitoring"
              action={
                <button
                  type="button"
                  onClick={() => navigateSection("control")}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  Full Control Board →
                </button>
              }
            >
              <TableCard
                headers={["Departure", "Route Name", "Bus", "Driver", "Condition", "Operational Action"]}
                rows={todaysSchedules.map((trip) => (
                  <>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{trip.routeName}</div>
                      <div className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {trip.status === "Scheduled" && (
                          <button
                            type="button"
                            onClick={() => handleDispatchTrip(trip)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Dispatch
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewingTripDetails(trip)}
                          className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-1.5 text-[var(--text-secondary)] hover:bg-[var(--panel)]"
                          title="Review trip operational condition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </>
                ))}
              />
            </SectionCard>

            {/* Operational Utilization Visualization */}
            <SectionCard
              title="Depot Operational Utilization"
              subtitle="Real-time allocation of available fleet buses and on-duty drivers"
            >
              <div className="space-y-6 py-2">
                {/* Fleet Utilization Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                    <span>Active Bus Fleet Utilization</span>
                    <span>{fleetUtilizationRate}% ({activeBuses.length} / {buses.length} Buses)</span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-[var(--soft)] p-0.5 border border-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${fleetUtilizationRate}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{availableBuses.length} Standby available</span>
                    <span className="text-rose-500 font-semibold">{busesUnderMaintenance.length} Under maintenance</span>
                  </div>
                </div>

                {/* Driver Duty Coverage Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                    <span>Driver Duty Roster Coverage</span>
                    <span>{driverDutyRate}% ({onDutyDrivers.length} / {drivers.length} Drivers)</span>
                  </div>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-[var(--soft)] p-0.5 border border-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${driverDutyRate}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{availableDrivers.length} Available for dispatch</span>
                    <span>Shift coverage active</span>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Operational Control Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResourceAllocationOpen(true)}
                      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Users className="h-4 w-4 text-[var(--accent)]" /> Allocate Resources
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmergencyAdjustmentOpen(true)}
                      className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Emergency Adjust
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* CONTROL BOARD SECTION */}
      {currentSection === "control" && (
        <div className="space-y-6">
          <PageHeader
            title="Operational Control Board"
            subtitle="Real-time monitoring of all active vehicle trips and depot dispatches"
            action={
              <div className="flex items-center gap-2">
                <PrimaryButton onClick={() => setEmergencyAdjustmentOpen(true)}>
                  <AlertTriangle className="mr-1.5 h-4 w-4" /> Emergency Adjustment
                </PrimaryButton>
              </div>
            }
          />

          {/* Trip Status Breakdown */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tripStatusData.map((item) => (
              <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-center">
                <div className={`mx-auto mb-2 h-4 w-4 rounded-full ${item.color}`}></div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{item.value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{item.name}</div>
              </div>
            ))}
          </div>

          <SectionCard
            title="Active Trip Operations"
            subtitle="All scheduled trips for today with live status controls"
          >
            <TableCard
              headers={["Departure", "Route", "Bus", "Driver", "Service Type", "Status", "Dispatch Action", "Details"]}
              rows={todaysSchedules.map((trip) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                    <div className="flex flex-col">
                      <span>{trip.departureTime}</span>
                      <span className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{trip.routeName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      trip.serviceType === "Express"
                        ? "bg-indigo-100 text-indigo-700"
                        : trip.serviceType === "Rural Service"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-slate-100 text-slate-700"
                    }`}>{trip.serviceType}</span>
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
                  <td className="px-4 py-3">
                    {trip.status === "Scheduled" && (
                      <button
                        type="button"
                        onClick={() => handleDispatchTrip(trip)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Dispatch
                      </button>
                    )}
                    {trip.status === "Delayed" && (
                      <button
                        type="button"
                        onClick={() => setEmergencyAdjustmentOpen(true)}
                        className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                      >
                        Mitigate
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewingTripDetails(trip)}
                      className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>

          {/* Live Trip Monitoring */}
          <SectionCard title="Live Trip Monitoring" subtitle="Current operational status of active corridors">
            <div className="grid gap-4 md:grid-cols-2">
              {todaysSchedules.filter((t) => t.status === "On Time" || t.status === "Delayed").map((trip) => (
                <div key={trip.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Route className="h-5 w-5 text-[var(--accent)]" />
                      <span className="font-bold text-[var(--text-primary)]">{trip.routeName}</span>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>
                  <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                    <div className="flex justify-between">
                      <span>Bus:</span>
                      <span className="text-[var(--text-primary)] font-medium">{trip.busNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Driver:</span>
                      <span className="text-[var(--text-primary)] font-medium">{trip.driver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Departure:</span>
                      <span className="text-[var(--text-primary)]">{trip.departureTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arrival:</span>
                      <span className="text-[var(--text-primary)]">{trip.arrivalTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* FLEET SECTION */}
      {currentSection === "fleet" && (
        <div className="space-y-6">
          <PageHeader
            title="Vehicle Fleet Management"
            subtitle="Fleet coordination, maintenance state tracking, and operational readiness"
            action={
              <PrimaryButton onClick={() => showToast("Fleet export initiated for PDF report.")}>
                <Download className="mr-1.5 h-4 w-4" /> Export Fleet Report
              </PrimaryButton>
            }
          />

          {/* Fleet Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fleetStatusData.map((item) => (
              <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-center">
                <div className={`mx-auto mb-3 h-12 w-12 rounded-xl ${item.color}/20 flex items-center justify-center`}>
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">{item.name}</div>
              </div>
            ))}
          </div>

          <SectionCard title="Depot Bus Fleet Availability Roster">
            <TableCard
              headers={["Bus Fleet No", "Registration", "Seating Capacity", "Mileage (km)", "Operational Status", "Maintenance History Note", "Action"]}
              rows={buses.map((bus) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{bus.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.registration}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.seatingCapacity} Seats</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{bus.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={bus.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{bus.maintenanceHistory[0] || "None"}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewingBus(bus)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5" /> Inspect Specs
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>

          {/* Fleet Utilization Chart */}
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Fleet Utilization Distribution" subtitle="Current bus allocation across operational states">
              <div className="space-y-4 py-2">
                {fleetStatusData.map((item) => {
                  const max = Math.max(...fleetStatusData.map((f) => f.value));
                  const pct = max ? (item.value / max) * 100 : 0;
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded ${item.color}`}></div>
                      <div className="w-24 text-xs text-[var(--text-secondary)]">{item.name}</div>
                      <div className="flex-1">
                        <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right font-bold text-[var(--text-primary)]">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Maintenance Overview" subtitle="Scheduled and overdue maintenance activities">
              <div className="divide-y divide-[var(--border)]">
                {maintenance.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {m.vehicle} · {m.type}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Service date: {m.date} · Next due: {m.nextServiceDate}
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* DRIVERS SECTION */}
      {currentSection === "drivers" && (
        <div className="space-y-6">
          <PageHeader
            title="Driver Roster & Duty Management"
            subtitle="Review driver duty roster, contact information, assigned corridors, and working shifts"
            action={
              <PrimaryButton onClick={() => setDriverAssignmentOpen(true)}>
                <Users className="mr-1.5 h-4 w-4" /> Update Driver Status
              </PrimaryButton>
            }
          />

          {/* Driver Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {driverStatusData.map((item) => (
              <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 text-center">
                <div className={`mx-auto mb-3 h-12 w-12 rounded-xl ${item.color}/20 flex items-center justify-center`}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">{item.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mt-1">{item.name}</div>
              </div>
            ))}
          </div>

          <SectionCard title="Driver Roster & Assignments">
            <TableCard
              headers={["Driver Name", "License No", "Contact Phone", "Assigned Corridor", "Working Shift Hours", "Duty Status", "Action"]}
              rows={drivers.map((driver) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{driver.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.licenseNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">{driver.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{driver.assignedRoute}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{driver.workingHours}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Update status for ${driver.name}`}
                      value={driver.status}
                      onChange={(e) => updateDriver(driver.id, { ...driver, status: e.target.value as DriverRecord["status"] })}
                      className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Available">Available</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </td>
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

          {/* Driver Duty Timeline */}
          <SectionCard title="Driver Duty Timeline" subtitle="Real-time duty status and assignment tracking">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Driver</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Shift</th>
                    <th className="px-4 py-3 font-medium">Today's Trip</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => {
                    const todayTrip = todaysSchedules.find((s) => s.driver === d.name);
                    return (
                      <tr key={d.id} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.name}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{d.assignedRoute}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{d.workingHours}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {todayTrip ? `${todayTrip.departureTime} → ${todayTrip.arrivalTime} (${todayTrip.status})` : "— No trip assigned"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ROUTES SECTION */}
      {currentSection === "routes" && (
        <div className="space-y-6">
          <PageHeader title="Route Network Management" subtitle="Inspect managed service corridors, endpoints, intermediate stops, and assigned assets" />

          {/* Route Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Routes</div>
                <Route className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.length}</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">Active service corridors</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Distance</div>
                <Navigation className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.reduce((sum, r) => sum + r.distance, 0)} km</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">Combined network coverage</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Routes</div>
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.filter((r) => r.status === "Active").length}</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">Currently in service</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Service Types</div>
                <MapPinned className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">
                {Array.from(new Set(routes.map((r) => r.serviceType))).length}
              </div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">Express, Normal, Rural Service</div>
            </div>
          </div>

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
                      onClick={() => {
                        const targetRoute = routes.find((rt) => rt.id === r.id);
                        if (targetRoute) {
                          setViewingBus(buses.find((b) => b.id === targetRoute.busId) || null);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5 text-[var(--accent)]" /> View Details
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>

          {/* Route Map Visualization */}
          <div className="grid gap-6 lg:grid-cols-2">
            {routes.slice(0, 4).map((route) => (
              <SectionCard key={route.id} title={route.name} subtitle={`${route.start} → ${route.end} · ${route.distance} km · ${route.serviceType}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Start Point</span>
                    <span className="font-medium text-[var(--text-primary)]">{route.start}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Destination</span>
                    <span className="font-medium text-[var(--text-primary)]">{route.end}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Stops</span>
                    <span className="font-medium text-[var(--text-primary)]">{route.stops.length} intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Vehicle Assigned</span>
                    <span className="font-medium text-[var(--text-primary)]">{buses.find((b) => b.id === route.busId)?.busNo ?? "Unassigned"}</span>
                  </div>
                  <a
                    href={`https://maps.google.com/maps?saddr=${encodeURIComponent(route.start)}&daddr=${encodeURIComponent(route.end)}&output=embed`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                  >
                    <MapPinned className="h-3.5 w-3.5 text-[var(--accent)]" /> View on Google Maps
                  </a>
                </div>
              </SectionCard>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULES SECTION */}
      {currentSection === "schedules" && (
        <div className="space-y-6">
          <PageHeader
            title="Timetable Management"
            subtitle="Timetables, departure/arrival times, vehicle assignments, and driver duties"
            action={
              <PrimaryButton onClick={() => showToast("Timetable export initiated for PDF report.")}>
                <Printer className="mr-1.5 h-4 w-4" /> Export Timetable
              </PrimaryButton>
            }
          />

          {/* Schedule Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{schedules.length}</div>
              <div className="text-xs text-[var(--text-muted)]">Total Scheduled Trips</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-2xl font-bold text-emerald-600">{completedTrips.length}</div>
              <div className="text-xs text-[var(--text-muted)]">Completed</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-2xl font-bold text-amber-600">{delayedTrips.length}</div>
              <div className="text-xs text-[var(--text-muted)]">Delayed</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-2xl font-bold text-blue-600">{scheduledTrips.length}</div>
              <div className="text-xs text-[var(--text-muted)]">Pending Dispatch</div>
            </div>
          </div>

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

          {/* Today's Schedule Detail */}
          <SectionCard title="Today's Schedule Details" subtitle={`All trips for ${todayStr}`}>
            <div className="divide-y divide-[var(--border)]">
              {todaysSchedules.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">{trip.routeName}</span>
                      <span className="text-xs text-[var(--text-muted)]">({trip.serviceType})</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {trip.departureTime} → {trip.arrivalTime} · Bus: {trip.busNo} · Driver: {trip.driver}
                    </div>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* CONFLICTS SECTION */}
      {currentSection === "conflicts" && (
        <div className="space-y-6">
          <PageHeader
            title="Conflict Resolution Center"
            subtitle="View and resolve all schedule conflicts and resource allocation issues"
          />

          {/* Conflict Summary */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{unresolvedConflicts.length}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">Unresolved</div>
            </div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {conflicts.filter((c) => c.severity === "Warning").length}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Warnings</div>
            </div>
            <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {conflicts.filter((c) => c.severity === "Critical").length}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">Critical</div>
            </div>
          </div>

          <SectionCard title="All Schedule Conflicts" subtitle="Active conflicts requiring supervisor attention">
            <TableCard
              headers={["Route", "Resource", "Time Window", "Conflict Reason", "Severity", "Status", "Action"]}
              rows={conflicts.map((c) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{c.route}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.resource}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{c.time}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">{c.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                      c.severity === "Critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    {c.status === "Unresolved" && (
                      <button
                        type="button"
                        onClick={() => setSelectedConflict(c)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Resolve
                      </button>
                    )}
                    {c.status === "Resolved" && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">✓ Resolved</span>
                    )}
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* EXCEPTIONS SECTION */}
      {currentSection === "exceptions" && (
        <div className="space-y-6">
          <PageHeader
            title="Operational Exceptions & Incident Management"
            subtitle="Monitor and resolve operational exceptions, incidents, and disruptions"
          />

          {/* Exception Summary */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-red-300/30 bg-red-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {exceptions.filter((e) => e.status === "Open").length}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">Open</div>
            </div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {exceptions.filter((e) => e.status === "In Progress").length}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">In Progress</div>
            </div>
            <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {exceptions.filter((e) => e.status === "Resolved").length}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Resolved</div>
            </div>
            <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-5 text-center">
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{openExceptions.length}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">Action Needed</div>
            </div>
          </div>

          <SectionCard title="All Operational Exceptions" subtitle="Complete incident log with resolution tracking">
            <TableCard
              headers={["Type", "Route", "Entity", "Time", "Reason", "Status", "Action"]}
              rows={exceptions.map((ex) => (
                <>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {ex.type === "Bus Breakdown" && <Truck className="h-4 w-4 text-rose-500" />}
                      {ex.type === "Driver Unavailable" && <Users className="h-4 w-4 text-amber-500" />}
                      {ex.type === "Delayed Trip" && <Clock className="h-4 w-4 text-amber-500" />}
                      {ex.type === "Schedule Disruption" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span className="font-semibold text-[var(--text-primary)]">{ex.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{ex.route}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{ex.entity}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{ex.time}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{ex.reason}</td>
                  <td className="px-4 py-3"><StatusBadge status={ex.status} /></td>
                  <td className="px-4 py-3">
                    {ex.status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={() => setSelectedException(ex)}
                        className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                      >
                        Handle
                      </button>
                    )}
                    {ex.status === "Resolved" && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        {ex.resolutionNote && <span className="text-emerald-600">✓ {ex.resolutionNote}</span>}
                      </div>
                    )}
                  </td>
                </>
              ))}
            />
          </SectionCard>

          {/* Incident Resolution Log */}
          <SectionCard title="Resolution History" subtitle="Recently resolved incidents and actions taken">
            <div className="divide-y divide-[var(--border)]">
              {exceptions.filter((e) => e.status === "Resolved").map((ex) => (
                <div key={ex.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-[var(--text-primary)]">{ex.type}: {ex.entity}</span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{ex.route} · {ex.time}</div>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] text-right max-w-xs">
                    {ex.resolutionNote || "Resolved"}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ANALYTICS SECTION */}
      {currentSection === "analytics" && (
        <div className="space-y-6">
          <PageHeader
            title="Analytics & Reports"
            subtitle="Performance metrics, utilization statistics, and operational insights"
          />

          {/* Analytics Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">On-Time Rate</div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{onTimeRate}%</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Trip punctuality efficiency</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Dispatch Rate</div>
                <Gauge className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{dispatchRate}%</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Scheduled trips dispatched</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Avg Fleet Utilization</div>
                <Bus className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{fleetUtilizationRate}%</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Buses in active service</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Driver Duty Rate</div>
                <Users className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{driverDutyRate}%</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Drivers on active duty</div>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Route Performance Index" subtitle="On-time rates by route corridor (%)">
              <div className="space-y-3 py-2">
                {routePerformanceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-28 text-xs font-medium text-[var(--text-secondary)]">{item.name}</div>
                    <div className="flex-1">
                      <div className="h-5 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-500 transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-14 text-right font-bold text-[var(--text-primary)]">{item.value}%</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Trip Status Distribution" subtitle="Today's trip status breakdown">
              <div className="space-y-3 py-2">
                {tripStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${item.color}`}></div>
                    <div className="w-24 text-xs font-medium text-[var(--text-secondary)]">{item.name}</div>
                    <div className="flex-1">
                      <div className="h-5 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${(item.value / Math.max(...tripStatusData.map((t) => t.value), 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-8 text-right font-bold text-[var(--text-primary)]">{item.value}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Reports Section */}
          <SectionCard title="Available Reports" subtitle="Export operational data for documentation">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => showToast("Generating Trip Status Report...")}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-[var(--soft)]"
              >
                <FileText className="h-6 w-6 text-[var(--accent)]" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Trip Status Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Daily trip status and punctuality data</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => showToast("Generating Fleet Utilization Report...")}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-[var(--soft)]"
              >
                <Bus className="h-6 w-6 text-emerald-500" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Fleet Utilization Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Bus usage and availability statistics</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => showToast("Generating Driver Duty Report...")}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-[var(--soft)]"
              >
                <Users className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Driver Duty Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Roster coverage and shift analytics</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => showToast("Generating Exception Log Report...")}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-[var(--soft)]"
              >
                <Wrench className="h-6 w-6 text-amber-500" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Exception Log Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Incidents and resolution tracking</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => showToast("Generating Conflict Resolution Report...")}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-[var(--soft)]"
              >
                <AlertTriangle className="h-6 w-6 text-rose-500" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Conflict Resolution Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Schedule conflicts and resolution history</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => showToast("Generating Route Performance Report...")}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left hover:bg-[var(--soft)]"
              >
                <Route className="h-6 w-6 text-indigo-500" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Route Performance Report</div>
                  <div className="text-xs text-[var(--text-muted)]">Corridor efficiency and punctuality</div>
                </div>
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* MODAL: RESOURCE ALLOCATION PANEL */}
      <Modal open={resourceAllocationOpen} title="Resource Allocation Panel" onClose={() => setResourceAllocationOpen(false)}>
        <form onSubmit={handleAllocateResource} className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Select a route corridor and allocate an available bus and driver for operational dispatch.
          </p>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Target Route Corridor</span>
            <select
              required
              value={allocateForm.routeId}
              onChange={(e) => setAllocateForm({ ...allocateForm, routeId: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.serviceType})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Select Fleet Bus</span>
            <select
              required
              value={allocateForm.busNo}
              onChange={(e) => setAllocateForm({ ...allocateForm, busNo: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.busNo}>
                  Bus {b.busNo} ({b.registration}) — {b.status}
                </option>
              ))}
            </select>
          </label>

          {/* Validation Warning Alert */}
          {(() => {
            const currentBus = buses.find((b) => b.busNo === allocateForm.busNo);
            if (currentBus && (currentBus.status === "Under Maintenance" || currentBus.status === "Out of Service")) {
              return (
                <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Warning: Bus {allocateForm.busNo} is currently &ldquo;{currentBus.status}&rdquo; and cannot be dispatched!</span>
                </div>
              );
            }
            return null;
          })()}

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Select Driver</span>
            <select
              required
              value={allocateForm.driverName}
              onChange={(e) => setAllocateForm({ ...allocateForm, driverName: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.assignedRoute}) — {d.status}
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setResourceAllocationOpen(false)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
            >
              Confirm Resource Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EMERGENCY SCHEDULE ADJUSTMENT */}
      <Modal open={emergencyAdjustmentOpen} title="Emergency Schedule Adjustment" onClose={() => setEmergencyAdjustmentOpen(false)}>
        <form onSubmit={handleApplyEmergencyAdjustment} className="space-y-4">
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Affected Trip Schedule</span>
            <select
              required
              value={emergencyForm.scheduleId}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, scheduleId: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {todaysSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.routeName} (Departs {s.departureTime}) · Bus {s.busNo}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Emergency Disruption Reason</span>
            <select
              required
              value={emergencyForm.reason}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, reason: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="Emergency Road Closure">Emergency Road Closure</option>
              <option value="Severe Weather Disruption">Severe Weather Disruption</option>
              <option value="Fleet Vehicle Breakdown">Fleet Vehicle Breakdown</option>
              <option value="Driver Illness / Absence">Driver Illness / Absence</option>
              <option value="Traffic Congestion Corridor Delay">Traffic Congestion Corridor Delay</option>
            </select>
          </label>

          {/* BEFORE AND AFTER COMPARISON CARD */}
          {selectedEmergencySchedule && (
            <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-300 mb-2">Schedule Comparison Preview</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-[var(--panel)] p-2">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Current Schedule</div>
                  <div className="font-bold text-rose-500">{selectedEmergencySchedule.departureTime} → {selectedEmergencySchedule.arrivalTime}</div>
                </div>
                <div className="rounded-lg bg-[var(--panel)] p-2">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">New Emergency Schedule</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{emergencyForm.newDepartureTime} → {emergencyForm.newArrivalTime}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">New Departure Time</span>
              <input
                type="time"
                required
                value={emergencyForm.newDepartureTime}
                onChange={(e) => setEmergencyForm({ ...emergencyForm, newDepartureTime: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1 block font-medium text-[var(--text-primary)]">New Arrival Time</span>
              <input
                type="time"
                required
                value={emergencyForm.newArrivalTime}
                onChange={(e) => setEmergencyForm({ ...emergencyForm, newArrivalTime: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Operational Log Notes</span>
            <input
              type="text"
              required
              value={emergencyForm.remarks}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, remarks: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEmergencyAdjustmentOpen(false)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Apply Emergency Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFLICT REVIEW & RESOLVE */}
      <Modal open={Boolean(selectedConflict)} title="Review Schedule Conflict" onClose={() => setSelectedConflict(null)}>
        {selectedConflict && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
              <div className="font-bold text-rose-900 dark:text-rose-200 text-base">{selectedConflict.resource}</div>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{selectedConflict.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <span className="text-[var(--text-muted)]">Corridor Route</span>
                <div className="font-semibold text-[var(--text-primary)]">{selectedConflict.route}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <span className="text-[var(--text-muted)]">Time Window</span>
                <div className="font-semibold text-[var(--text-primary)]">{selectedConflict.time}</div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-3">
              <div className="font-bold text-amber-800 dark:text-amber-300 mb-2">Recommended Resolution Actions</div>
              <ul className="list-inside list-disc space-y-1 text-xs text-[var(--text-secondary)]">
                <li>Reassign conflicting resource to alternative time slot</li>
                <li>Allocate standby vehicle from depot inventory</li>
                <li>Adjust departure time by 15-30 minutes to avoid overlap</li>
                <li>Reassign driver to another available corridor</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setSelectedConflict(null)}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleResolveConflict(selectedConflict)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Mark Conflict Resolved
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: OPERATIONAL EXCEPTION HANDLING */}
      <Modal open={Boolean(selectedException)} title="Handle Operational Exception" onClose={() => setSelectedException(null)}>
        {selectedException && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
              <div className="font-bold text-amber-900 dark:text-amber-200 text-base">{selectedException.type}: {selectedException.entity}</div>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">{selectedException.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <span className="text-[var(--text-muted)]">Corridor Route</span>
                <div className="font-semibold text-[var(--text-primary)]">{selectedException.route}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <span className="text-[var(--text-muted)]">Reported Time</span>
                <div className="font-semibold text-[var(--text-primary)]">{selectedException.time}</div>
              </div>
            </div>

            <div className="text-xs font-bold text-[var(--text-primary)]">Select Resolution Action:</div>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => handleResolveException(selectedException, "Assigned Replacement Standby Bus")}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-left hover:bg-[var(--panel)]"
              >
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Assign Replacement Bus</div>
                  <div className="text-xs text-[var(--text-muted)]">Dispatch standby vehicle from depot inventory</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </button>

              <button
                type="button"
                onClick={() => handleResolveException(selectedException, "Reassigned Standby Duty Driver")}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-left hover:bg-[var(--panel)]"
              >
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Reassign Standby Driver</div>
                  <div className="text-xs text-[var(--text-muted)]">Assign available driver from roster</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </button>

              <button
                type="button"
                onClick={() => handleResolveException(selectedException, "Adjusted Departure Schedule +15m")}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-left hover:bg-[var(--panel)]"
              >
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Adjust Departure Time (+15m)</div>
                  <div className="text-xs text-[var(--text-muted)]">Mitigate delay by updating timetable schedule</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </button>

              <button
                type="button"
                onClick={() => handleResolveException(selectedException, "Dispatched Maintenance Crew")}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-left hover:bg-[var(--panel)]"
              >
                <div>
                  <div className="font-bold text-[var(--text-primary)]">Dispatch Maintenance Crew</div>
                  <div className="text-xs text-[var(--text-muted)]">Send roadside assistance for on-site repair</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedException(null)}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: VIEW TRIP CONDITION DETAILS */}
      <Modal open={Boolean(viewingTripDetails)} title="Trip Operational Condition" onClose={() => setViewingTripDetails(null)}>
        {viewingTripDetails && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Route Corridor</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{viewingTripDetails.routeName}</div>
              </div>
              <StatusBadge status={viewingTripDetails.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Departure Time</div>
                <div className="font-bold text-[var(--text-primary)]">{viewingTripDetails.departureTime}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Expected Arrival</div>
                <div className="font-bold text-[var(--text-primary)]">{viewingTripDetails.arrivalTime}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Assigned Bus</div>
                <div className="font-bold text-[var(--text-primary)]">{viewingTripDetails.busNo}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Assigned Driver</div>
                <div className="font-bold text-[var(--text-primary)]">{viewingTripDetails.driver}</div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Trip Details</div>
              <div className="grid gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Date</span>
                  <span className="font-medium text-[var(--text-primary)]">{viewingTripDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Service Type</span>
                  <span className="font-medium text-[var(--text-primary)]">{viewingTripDetails.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Route ID</span>
                  <span className="font-medium text-[var(--text-primary)]">{viewingTripDetails.routeId}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingTripDetails(null)}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: VIEW BUS SPECS */}
      <Modal open={Boolean(viewingBus)} title="Bus Fleet Availability Specs" onClose={() => setViewingBus(null)}>
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

      {/* MODAL: VIEW DRIVER DETAILS */}
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

            <div className="rounded-xl border border-[var(--border)] p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Today's Assignment</div>
              {(() => {
                const todayTrip = schedules.find((s) => s.driver === viewingDriver.name && s.date === todayStr);
                if (todayTrip) {
                  return (
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Route</span>
                        <span className="font-medium text-[var(--text-primary)]">{todayTrip.routeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Departure</span>
                        <span className="font-medium text-[var(--text-primary)]">{todayTrip.departureTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Arrival</span>
                        <span className="font-medium text-[var(--text-primary)]">{todayTrip.arrivalTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Bus</span>
                        <span className="font-medium text-[var(--text-primary)]">{todayTrip.busNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Status</span>
                        <span className="font-medium text-[var(--text-primary)]">{todayTrip.status}</span>
                      </div>
                    </div>
                  );
                }
                return <div className="text-xs text-[var(--text-muted)]">No trip assigned for today</div>;
              })()}
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

      {/* MODAL: DRIVER DUTY ASSIGNMENT */}
      <Modal open={driverAssignmentOpen} title="Update Driver Duty Status" onClose={() => setDriverAssignmentOpen(false)}>
        <form onSubmit={handleDriverAssignment} className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Select a driver and update their duty status to manage shift coverage and fleet availability.
          </p>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Select Driver</span>
            <select
              required
              value={driverAssignForm.driverName}
              onChange={(e) => setDriverAssignForm({ ...driverAssignForm, driverName: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} · {d.assignedRoute} · {d.status}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">New Duty Status</span>
            <select
              required
              value={driverAssignForm.newStatus}
              onChange={(e) => setDriverAssignForm({ ...driverAssignForm, newStatus: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="On Duty">On Duty</option>
              <option value="Available">Available</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </label>

          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Reason / Notes</span>
            <input
              type="text"
              placeholder="e.g. Shift start, End of duty, Break, etc."
              value={driverAssignForm.remarks}
              onChange={(e) => setDriverAssignForm({ ...driverAssignForm, remarks: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDriverAssignmentOpen(false)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
            >
              Update Driver Status
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--text-muted)]">Loading Supervisor Control Center...</div>}>
      <SupervisorDashboardContent />
    </Suspense>
  );
}
