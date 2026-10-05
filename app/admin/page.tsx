"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  MapPin,
  Navigation,
  PauseCircle,
  Phone,
  Plus,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  UserCog,
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

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");
  const [currentSection, setCurrentSection] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("srmss-admin-section");
      return stored || "overview";
    }
    return "overview";
  });

  // Sync with URL and persist to localStorage
  useEffect(() => {
    if (urlSection && urlSection !== currentSection) {
      setCurrentSection(urlSection);
      localStorage.setItem("srmss-admin-section", urlSection);
    }
  }, [urlSection, currentSection]);

  const navigateSection = (sec: string) => {
    setCurrentSection(sec);
    localStorage.setItem("srmss-admin-section", sec);
    if (sec === "overview") {
      router.push("/admin");
    } else {
      router.push(`/admin?section=${sec}`);
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
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [viewingLogs, setViewingLogs] = useState(false);

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

  // Form State: Add User
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    role: "supervisor",
    department: "operations",
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

  // Add User Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`User ${newUserForm.name} added successfully with ${newUserForm.role} role`);
    setAddUserOpen(false);
    setNewUserForm({ name: "", email: "", role: "supervisor", department: "operations" });
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
    { id: "users", label: "User Management", icon: UserCog },
    { id: "depots", label: "Depot Management", icon: MapPin },
    { id: "control", label: "Control Board", icon: Activity },
    { id: "fleet", label: "Vehicle Fleet", icon: Bus },
    { id: "drivers", label: "Driver Roster", icon: Users },
    { id: "routes", label: "Route Network", icon: Route },
    { id: "schedules", label: "Timetable", icon: CalendarDays },
    { id: "conflicts", label: "Conflict Center", icon: AlertTriangle },
    { id: "exceptions", label: "Exceptions & Issues", icon: Wrench },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
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

  // Mock users data for admin
  const mockUsers = [
    { id: 1, name: "A. De Silva", email: "depot.admin@srmss.lk", role: "Supervisor", department: "Operations", status: "Active", lastLogin: "2026-10-03 08:15" },
    { id: 2, name: "K. Bandara", email: "depot.clerk@srmss.lk", role: "Operational Staff", department: "Operations", status: "Active", lastLogin: "2026-10-03 07:45" },
    { id: 3, name: "M. Perera", email: "m.perera@srmss.lk", role: "Supervisor", department: "Maintenance", status: "Active", lastLogin: "2026-10-02 16:30" },
    { id: 4, name: "S. Fernando", email: "s.fernando@srmss.lk", role: "Operational Staff", department: "Operations", status: "Inactive", lastLogin: "2026-09-28 14:20" },
  ];

  // Mock depot data for admin
  const mockDepots = [
    { id: 1, name: "Central Bus Depot", location: "Colombo", manager: "A. De Silva", buses: 12, staff: 8, status: "Active" },
    { id: 2, name: "Kandy Depot", location: "Kandy", manager: "M. Perera", buses: 8, staff: 5, status: "Active" },
    { id: 3, name: "Galle Depot", location: "Galle", manager: "R. Silva", buses: 6, staff: 4, status: "Active" },
    { id: 4, name: "Negombo Depot", location: "Negombo", manager: "T. Kumara", buses: 10, staff: 6, status: "Maintenance" },
  ];

  return (
    <AppShell
      title="System Administrator Dashboard"
      subtitle="Complete system management, user administration, and depot oversight"
    >
      <Toast message={toastMessage || ""} visible={Boolean(toastMessage)} />

      {/* Admin Banner */}
      <div className="mb-6 rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--sidebar-bg)] via-[var(--panel)] to-[var(--soft)] p-5 text-[var(--text-primary)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
              <ShieldCheck className="h-4 w-4" /> ADMINISTRATOR CONTROL PANEL
            </div>
            <h2 className="text-xl font-bold">Complete System Overview & Management</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage users, oversee all depots, monitor system performance, and control operational resources across the entire network.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAddUserOpen(true)}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              <UserCog className="mr-1.5 h-4 w-4" /> Add New User
            </button>
            <button
              type="button"
              onClick={() => setViewingLogs(true)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition hover:bg-[var(--soft)]"
            >
              <History className="mr-1.5 h-4 w-4" /> System Logs
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <span className="text-sm font-medium text-[var(--text-secondary)]">Total Depots</span>
          </div>
          <span className="font-bold text-[var(--text-primary)]">{mockDepots.length} Active</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-violet-500" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">Total Users</span>
          </div>
          <span className="font-bold text-[var(--text-primary)]">{mockUsers.length} Registered</span>
        </div>
      </div>

      {/* COMPACT OPERATIONAL SUMMARY CARDS */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <div key={metric.label}>
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Section Switcher Tabs */}
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
          {/* System Health Overview */}
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <SectionCard
              title="System Health Overview"
              subtitle="Real-time operational metrics across all depots and routes"
            >
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Fleet Utilization</div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{fleetUtilizationRate}%</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{activeBuses.length} of {buses.length} buses active</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Dispatch Rate</div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{dispatchRate}%</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{dispatchedTrips.length} of {todaysSchedules.length} dispatched</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">On-Time Performance</div>
                    <div className="text-3xl font-bold text-[var(--text-primary)]">{onTimeRate}%</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{tripsInProgress.length} trips on time</div>
                  </div>
                </div>

                {/* Today's Operational Control Board Summary */}
                <div className="mt-6">
                  <div className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Today's Control Board</div>
                  <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
                        <tr>
                          <th className="px-4 py-3 font-medium">Departure</th>
                          <th className="px-4 py-3 font-medium">Route</th>
                          <th className="px-4 py-3 font-medium">Bus</th>
                          <th className="px-4 py-3 font-medium">Driver</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysSchedules.slice(0, 5).map((trip) => (
                          <tr key={trip.id} className="border-t border-[var(--border)]">
                            <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.routeName}</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                            <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setViewingTripDetails(trip)}
                                className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* System Alerts */}
            <SectionCard title="System Alerts" subtitle="Critical issues requiring admin attention">
              <div className="space-y-3">
                {unresolvedConflicts.length > 0 && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                      <AlertTriangle className="h-4 w-4" />
                      {unresolvedConflicts.length} Unresolved Conflicts
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Schedule conflicts need immediate attention</p>
                  </div>
                )}
                {openExceptions.length > 0 && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      {openExceptions.length} Open Exceptions
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Operational exceptions require resolution</p>
                  </div>
                )}
                {busesUnderMaintenance.length > 0 && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                      <Wrench className="h-4 w-4" />
                      {busesUnderMaintenance.length} Buses Under Maintenance
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Fleet availability may be impacted</p>
                  </div>
                )}
                {mockUsers.filter(u => u.status === "Inactive").length > 0 && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                      <Users className="h-4 w-4" />
                      {mockUsers.filter(u => u.status === "Inactive").length} Inactive Users
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">User accounts requiring review</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT SECTION */}
      {currentSection === "users" && (
        <div className="space-y-6">
          <PageHeader
            title="User Management"
            subtitle="Manage system users, roles, and permissions"
            action={
              <PrimaryButton onClick={() => setAddUserOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add New User
              </PrimaryButton>
            }
          />

          {/* User Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Users</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{mockUsers.length}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Registered accounts</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Active Users</div>
              <div className="text-3xl font-bold text-emerald-600">{mockUsers.filter(u => u.status === "Active").length}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Currently active</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Supervisors</div>
              <div className="text-3xl font-bold text-blue-600">{mockUsers.filter(u => u.role === "Supervisor").length}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Depot supervisors</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Operational Staff</div>
              <div className="text-3xl font-bold text-amber-600">{mockUsers.filter(u => u.role === "Operational Staff").length}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Depot clerks</div>
            </div>
          </div>

          {/* Users Table */}
          <SectionCard title="Registered Users">
            <TableCard
              headers={["Name", "Email", "Role", "Department", "Status", "Last Login", "Actions"]}
              rows={mockUsers.map((user) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{user.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.role} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.department}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{user.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </button>
                    </div>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* DEPOT MANAGEMENT SECTION */}
      {currentSection === "depots" && (
        <div className="space-y-6">
          <PageHeader
            title="Depot Management"
            subtitle="Manage depot locations, assign managers, and monitor depot performance"
            action={
              <PrimaryButton onClick={() => showToast("Add depot feature coming soon")}>
                <Plus className="mr-1.5 h-4 w-4" /> Add Depot
              </PrimaryButton>
            }
          />

          {/* Depot Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Depots</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{mockDepots.length}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Across the network</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Buses</div>
              <div className="text-3xl font-bold text-blue-600">{mockDepots.reduce((sum, d) => sum + d.buses, 0)}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Fleet distributed</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Staff</div>
              <div className="text-3xl font-bold text-emerald-600">{mockDepots.reduce((sum, d) => sum + d.staff, 0)}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Personnel deployed</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Active Depots</div>
              <div className="text-3xl font-bold text-emerald-600">{mockDepots.filter(d => d.status === "Active").length}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Operational depots</div>
            </div>
          </div>

          {/* Depots Table */}
          <SectionCard title="Depot Directory">
            <TableCard
              headers={["Depot Name", "Location", "Manager", "Buses", "Staff", "Status", "Actions"]}
              rows={mockDepots.map((depot) => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{depot.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{depot.location}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{depot.manager}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{depot.buses}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{depot.staff}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      depot.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {depot.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--panel)]"
                      >
                        <Settings className="h-3.5 w-3.5 mr-1" /> Manage
                      </button>
                    </div>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* REPORTS & ANALYTICS SECTION */}
      {currentSection === "reports" && (
        <div className="space-y-6">
          <PageHeader
            title="Reports & Analytics"
            subtitle="Generate reports, view analytics, and export system data"
            action={
              <PrimaryButton onClick={() => showToast("Report generation initiated")}>
                <Download className="mr-1.5 h-4 w-4" /> Generate Report
              </PrimaryButton>
            }
          />

          {/* Report KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Routes</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.length}</div>
              <div className="text-xs text-emerald-600 mt-1">Active service corridors</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Distance</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.reduce((sum, r) => sum + r.distance, 0)} km</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Network coverage</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Monthly Fuel Cost</div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">LKR 98,780</div>
              <div className="text-xs text-emerald-600 mt-1">-5.2% vs last month</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">System Uptime</div>
              <div className="text-3xl font-bold text-emerald-600">99.8%</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Last 30 days</div>
            </div>
          </div>

          {/* Route Performance */}
          <SectionCard title="Route Performance Analysis" subtitle="Performance metrics across all routes">
            <div className="space-y-3">
              {routePerformanceData.map((route) => (
                <div key={route.name} className="flex items-center gap-4">
                  <div className="w-48 text-sm font-medium text-[var(--text-primary)]">{route.name}</div>
                  <div className="flex-1">
                    <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--soft)] border border-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                        style={{ width: `${route.value}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right font-bold text-[var(--text-primary)]">{route.value}%</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Export Options */}
          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Export Data" subtitle="Download reports and data exports">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => showToast("Fleet report exported to PDF")}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 text-left transition hover:bg-[var(--panel)]"
                >
                  <Download className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Fleet Report</div>
                    <div className="text-xs text-[var(--text-muted)]">PDF export of all fleet data</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Schedule report exported to CSV")}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 text-left transition hover:bg-[var(--panel)]"
                >
                  <FileText className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Schedule Report</div>
                    <div className="text-xs text-[var(--text-muted)]">CSV export of schedules</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Driver report exported to Excel")}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 text-left transition hover:bg-[var(--panel)]"
                >
                  <Users className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Driver Report</div>
                    <div className="text-xs text-[var(--text-muted)]">Excel export of driver data</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Maintenance report exported to PDF")}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4 text-left transition hover:bg-[var(--panel)]"
                >
                  <Wrench className="h-5 w-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Maintenance Report</div>
                    <div className="text-xs text-[var(--text-muted)]">PDF export of maintenance logs</div>
                  </div>
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Analytics Dashboard" subtitle="Visual analytics and insights">
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">Fleet Utilization Distribution</div>
                  {fleetStatusData.map((item) => {
                    const max = Math.max(...fleetStatusData.map((f) => f.value));
                    const pct = max ? (item.value / max) * 100 : 0;
                    return (
                      <div key={item.name} className="flex items-center gap-3 mb-2">
                        <div className={`h-4 w-4 rounded ${item.color}`}></div>
                        <div className="w-32 text-xs text-[var(--text-secondary)]">{item.name}</div>
                        <div className="flex-1">
                          <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--panel)] border border-[var(--border)]">
                            <div
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-right font-bold text-[var(--text-primary)] text-sm">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* SETTINGS SECTION */}
      {currentSection === "settings" && (
        <div className="space-y-6">
          <PageHeader title="System Settings" subtitle="Configure system preferences and security settings" />

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="General Settings" subtitle="System configuration options">
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">System Name</div>
                  <div className="text-sm text-[var(--text-secondary)]">Smart Route Management and Scheduling System</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Version</div>
                  <div className="text-sm text-[var(--text-secondary)]">v1.0.0 (Production)</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Timezone</div>
                  <div className="text-sm text-[var(--text-secondary)]">Asia/Colombo (UTC+5:30)</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Maintenance Mode</div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">Disabled</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Security Settings" subtitle="Access control and security configuration">
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Two-Factor Authentication</div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700">Optional</span>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Session Timeout</div>
                  <div className="text-sm text-[var(--text-secondary)]">24 hours</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Password Policy</div>
                  <div className="text-sm text-[var(--text-secondary)]">Minimum 8 characters, mixed case required</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Data Encryption</div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">AES-256 Enabled</span>
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

          <SectionCard title="Active Trip Operations" subtitle="All scheduled trips for today with live status controls">
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
              <div className="mt-1 text-xs text-[var(--text-secondary)]">Currently operational</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Delayed Routes</div>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.filter((r) => r.status === "Delayed").length}</div>
              <div className="mt-1 text-xs text-[var(--text-secondary)]">Require attention</div>
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
                      onClick={() => showToast("Route details coming soon")}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* SCHEDULES, CONFLICTS, EXCEPTIONS - Similar to supervisor dashboard */}
      {currentSection === "schedules" && (
        <div className="space-y-6">
          <PageHeader title="Timetable Management" subtitle="View and manage all scheduled trips across all depots" />
          <SectionCard title="Complete Timetable">
            <TableCard
              headers={["Date", "Departure Time", "Arrival Time", "Route Name", "Fleet Bus No", "Assigned Driver", "Service Type", "Status", "Action"]}
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
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setViewingTripDetails(trip)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* MODALS */}
      <Modal open={Boolean(addUserOpen)} title="Add New User" onClose={() => setAddUserOpen(false)}>
        <form onSubmit={handleAddUser} className="space-y-4">
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Full Name</span>
            <input
              type="text"
              required
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="Enter full name"
            />
          </label>
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Email Address</span>
            <input
              type="email"
              required
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="user@srmss.lk"
            />
          </label>
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Role</span>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="admin">System Administrator</option>
              <option value="supervisor">Depot Supervisor</option>
              <option value="operational-staff">Operational Staff</option>
            </select>
          </label>
          <label className="block text-sm text-[var(--text-secondary)]">
            <span className="mb-1 block font-medium text-[var(--text-primary)]">Department</span>
            <select
              value={newUserForm.department}
              onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            >
              <option value="operations">Operations</option>
              <option value="maintenance">Maintenance</option>
              <option value="administration">Administration</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddUserOpen(false)}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Add User
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(viewingLogs)} title="System Activity Logs" onClose={() => setViewingLogs(false)}>
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
            <div className="text-xs text-[var(--text-muted)]">2026-10-03 08:15:22</div>
            <div className="text-sm text-[var(--text-primary)]">Admin login from 192.168.1.45</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
            <div className="text-xs text-[var(--text-muted)]">2026-10-03 08:12:05</div>
            <div className="text-sm text-[var(--text-primary)]">User K. Bandara logged in</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
            <div className="text-xs text-[var(--text-muted)]">2026-10-03 07:45:18</div>
            <div className="text-sm text-[var(--text-primary)]">Schedule updated: Colombo - Kandy (NP-2201)</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
            <div className="text-xs text-[var(--text-muted)]">2026-10-03 07:30:00</div>
            <div className="text-sm text-[var(--text-primary)]">System backup completed</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
            <div className="text-xs text-[var(--text-muted)]">2026-10-03 07:15:42</div>
            <div className="text-sm text-[var(--text-primary)]">Maintenance alert generated: GL-1188</div>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(viewingTripDetails)} title="Trip Details" onClose={() => setViewingTripDetails(null)}>
        {viewingTripDetails && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Route</div>
                <div className="text-lg font-bold text-[var(--text-primary)]">{viewingTripDetails.routeName}</div>
              </div>
              <StatusBadge status={viewingTripDetails.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Departure</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingTripDetails.departureTime}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Arrival</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingTripDetails.arrivalTime}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Bus</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingTripDetails.busNo}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-3">
                <div className="text-xs text-[var(--text-muted)]">Driver</div>
                <div className="font-semibold text-[var(--text-primary)]">{viewingTripDetails.driver}</div>
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

      <Modal open={Boolean(viewingBus)} title="Bus Details" onClose={() => setViewingBus(null)}>
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
    </AppShell>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading admin dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
