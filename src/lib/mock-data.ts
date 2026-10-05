export type RouteStatus = "Active" | "Planned" | "Delayed" | "Completed";
export type ScheduleStatus = "On Time" | "Delayed" | "Scheduled" | "Completed";
export type DriverStatus = "On Duty" | "Off Duty" | "Available";
export type VehicleStatus = "Active" | "In Service" | "Under Maintenance" | "Out of Service";
export type MaintenanceStatus = "Completed" | "Scheduled" | "Overdue";

export type DepotRoute = {
  id: number;
  name: string;
  start: string;
  end: string;
  stops: string[];
  distance: number;
  serviceType: "Normal" | "Express" | "Rural Service";
  busId: number;
  driverId: number;
  status: RouteStatus;
  color: string;
};

export type ScheduleItem = {
  id: number;
  routeId: number;
  routeName: string;
  busNo: string;
  driver: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  status: ScheduleStatus;
  serviceType: "Normal" | "Express" | "Rural Service";
};

export type Bus = {
  id: number;
  registration: string;
  busNo: string;
  seatingCapacity: number;
  mileage: number;
  status: VehicleStatus;
  maintenanceHistory: string[];
};

export type Driver = {
  id: number;
  name: string;
  licenseNumber: string;
  phone: string;
  assignedRoute: string;
  assignedBusId?: number;
  workingHours: string;
  status: DriverStatus;
  insuranceDate?: string;
};

export type FuelRecord = {
  id: number;
  date: string;
  busNo: string;
  route: string;
  fuelLiters: number;
  cost: number;
  remarks: string;
};

export type MaintenanceRecord = {
  id: number;
  vehicle: string;
  type: "Routine Maintenance" | "Corrective Maintenance";
  date: string;
  nextServiceDate: string;
  status: MaintenanceStatus;
  remarks: string;
};

export const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Control Board", href: "/dashboard?section=control", icon: "Activity" },
  { label: "Fleet Management", href: "/dashboard?section=fleet", icon: "Bus" },
  { label: "Driver Roster", href: "/dashboard?section=drivers", icon: "Users" },
  { label: "Route Network", href: "/dashboard?section=routes", icon: "Route" },
  { label: "Timetable", href: "/dashboard?section=schedules", icon: "CalendarDays" },
  { label: "Conflict Center", href: "/dashboard?section=conflicts", icon: "AlertTriangle" },
  { label: "Exceptions", href: "/dashboard?section=exceptions", icon: "Wrench" },
  { label: "Analytics & Reports", href: "/dashboard?section=analytics", icon: "BarChart3" },
];

export const adminSidebarItems = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "User Management", href: "/admin?section=users", icon: "UserCog" },
  { label: "Depot Management", href: "/admin?section=depots", icon: "MapPin" },
  { label: "Control Board", href: "/admin?section=control", icon: "Activity" },
  { label: "Fleet Management", href: "/admin?section=fleet", icon: "Bus" },
  { label: "Driver Roster", href: "/admin?section=drivers", icon: "Users" },
  { label: "Route Network", href: "/admin?section=routes", icon: "Route" },
  { label: "Timetable", href: "/admin?section=schedules", icon: "CalendarDays" },
  { label: "Reports & Analytics", href: "/admin?section=reports", icon: "BarChart3" },
];

export const operationalStaffSidebarItems = [
  { label: "Dashboard", href: "/operational-staff", icon: "LayoutDashboard" },
  { label: "View Routes", href: "/operational-staff?section=routes", icon: "Route" },
  { label: "View Schedules", href: "/operational-staff?section=schedules", icon: "CalendarDays" },
  { label: "Update Trip Status", href: "/operational-staff?section=trip-status", icon: "Activity" },
  { label: "Record Fuel Usage", href: "/operational-staff?section=fuel", icon: "Fuel" },
  { label: "Record Maintenance", href: "/operational-staff?section=maintenance", icon: "Wrench" },
  { label: "Bus Availability", href: "/operational-staff?section=buses", icon: "Bus" },
  { label: "Driver Assignments", href: "/operational-staff?section=drivers", icon: "Users" },
];

export const routeData: DepotRoute[] = [
  {
    id: 1,
    name: "Colombo - Kandy",
    start: "Colombo",
    end: "Kandy",
    stops: ["Kelaniya", "Kurunegala", "Dambulla"],
    distance: 142,
    serviceType: "Express",
    busId: 1,
    driverId: 1,
    status: "Active",
    color: "#146CFA",
  },
  {
    id: 2,
    name: "Kandy - Matale",
    start: "Kandy",
    end: "Matale",
    stops: ["Peradeniya", "Akurana"],
    distance: 34,
    serviceType: "Normal",
    busId: 2,
    driverId: 2,
    status: "Delayed",
    color: "#00AEEF",
  },
  {
    id: 3,
    name: "Galle - Matara",
    start: "Galle",
    end: "Matara",
    stops: ["Hikkaduwa", "Ambalangoda"],
    distance: 48,
    serviceType: "Normal",
    busId: 3,
    driverId: 3,
    status: "Active",
    color: "#146CFA",
  },
  {
    id: 4,
    name: "Kurunegala - Puttalam",
    start: "Kurunegala",
    end: "Puttalam",
    stops: ["Maho", "Nikaweratiya"],
    distance: 72,
    serviceType: "Rural Service",
    busId: 4,
    driverId: 4,
    status: "Planned",
    color: "#00AEEF",
  },
  {
    id: 5,
    name: "Negombo - Colombo",
    start: "Negombo",
    end: "Colombo",
    stops: ["Ja-Ela", "Katunayake"],
    distance: 41,
    serviceType: "Normal",
    busId: 5,
    driverId: 5,
    status: "Completed",
    color: "#146CFA",
  },
];

export const busData: Bus[] = [
  {
    id: 1,
    registration: "CAB-1456",
    busNo: "NP-2201",
    seatingCapacity: 44,
    mileage: 182450,
    status: "In Service",
    maintenanceHistory: ["Oil filter replaced (2026-09-15)", "Brake inspection passed (2026-08-30)"],
  },
  {
    id: 2,
    registration: "KAD-8842",
    busNo: "KA-3324",
    seatingCapacity: 38,
    mileage: 148200,
    status: "Active",
    maintenanceHistory: ["Tire rotation (2026-09-10)"],
  },
  {
    id: 3,
    registration: "GLA-7720",
    busNo: "GL-1188",
    seatingCapacity: 40,
    mileage: 196320,
    status: "Under Maintenance",
    maintenanceHistory: ["Engine diagnostics due (2026-09-22)", "Suspension check pending"],
  },
  {
    id: 4,
    registration: "KUR-3631",
    busNo: "KU-5549",
    seatingCapacity: 36,
    mileage: 134610,
    status: "Out of Service",
    maintenanceHistory: ["Air brake repair scheduled"],
  },
  {
    id: 5,
    registration: "NEG-9322",
    busNo: "NE-7712",
    seatingCapacity: 42,
    mileage: 171230,
    status: "Active",
    maintenanceHistory: ["Battery replaced (2026-09-03)"],
  },
  {
    id: 6,
    registration: "MAT-1627",
    busNo: "MT-6678",
    seatingCapacity: 45,
    mileage: 203810,
    status: "In Service",
    maintenanceHistory: ["Routine inspection passed (2026-09-11)"],
  },
];

export const driverData: Driver[] = [
  { id: 1, name: "S. Perera", licenseNumber: "B-1598", phone: "077-245-9140", assignedRoute: "Colombo - Kandy", assignedBusId: 1, workingHours: "06:00 - 15:00", status: "On Duty", insuranceDate: "2027-05-15" },
  { id: 2, name: "N. Silva", licenseNumber: "B-2081", phone: "071-442-7801", assignedRoute: "Kandy - Matale", assignedBusId: 2, workingHours: "07:00 - 16:00", status: "Available", insuranceDate: "2026-11-30" },
  { id: 3, name: "R. Fernando", licenseNumber: "B-3552", phone: "076-881-3302", assignedRoute: "Galle - Matara", assignedBusId: 3, workingHours: "05:30 - 14:30", status: "On Duty", insuranceDate: "2027-02-28" },
  { id: 4, name: "M. Jayawardena", licenseNumber: "B-4419", phone: "070-117-8911", assignedRoute: "Kurunegala - Puttalam", assignedBusId: 4, workingHours: "08:00 - 17:00", status: "Off Duty", insuranceDate: "2026-12-15" },
  { id: 5, name: "T. Kumara", licenseNumber: "B-5029", phone: "075-984-8772", assignedRoute: "Negombo - Colombo", assignedBusId: 5, workingHours: "06:30 - 15:30", status: "On Duty", insuranceDate: "2027-08-20" },
  { id: 6, name: "H. Wanigasekara", licenseNumber: "B-6280", phone: "078-443-1124", assignedRoute: "Kandy - Matale", assignedBusId: 6, workingHours: "09:00 - 18:00", status: "Available", insuranceDate: "2027-01-10" },
];

export const scheduleData: ScheduleItem[] = [
  { id: 1, routeId: 1, routeName: "Colombo - Kandy", busNo: "NP-2201", driver: "S. Perera", departureTime: "06:45", arrivalTime: "09:20", date: "2026-10-02", status: "On Time", serviceType: "Express" },
  { id: 2, routeId: 2, routeName: "Kandy - Matale", busNo: "KA-3324", driver: "N. Silva", departureTime: "07:15", arrivalTime: "08:00", date: "2026-10-02", status: "Delayed", serviceType: "Normal" },
  { id: 3, routeId: 3, routeName: "Galle - Matara", busNo: "GL-1188", driver: "R. Fernando", departureTime: "08:30", arrivalTime: "09:50", date: "2026-10-02", status: "Scheduled", serviceType: "Normal" },
  { id: 4, routeId: 4, routeName: "Kurunegala - Puttalam", busNo: "KU-5549", driver: "M. Jayawardena", departureTime: "09:10", arrivalTime: "10:40", date: "2026-10-02", status: "Completed", serviceType: "Rural Service" },
  { id: 5, routeId: 5, routeName: "Negombo - Colombo", busNo: "NE-7712", driver: "T. Kumara", departureTime: "14:00", arrivalTime: "15:15", date: "2026-10-02", status: "On Time", serviceType: "Normal" },
  { id: 6, routeId: 1, routeName: "Colombo - Kandy", busNo: "MT-6678", driver: "H. Wanigasekara", departureTime: "07:30", arrivalTime: "10:05", date: "2026-10-03", status: "Scheduled", serviceType: "Express" },
  { id: 7, routeId: 2, routeName: "Kandy - Matale", busNo: "NP-2201", driver: "S. Perera", departureTime: "07:20", arrivalTime: "08:10", date: "2026-10-03", status: "Delayed", serviceType: "Normal" },
];

export const fuelRecords: FuelRecord[] = [
  { id: 1, date: "2026-09-28", busNo: "NP-2201", route: "Colombo - Kandy", fuelLiters: 120, cost: 18600, remarks: "Fuel top-up before morning express departure" },
  { id: 2, date: "2026-09-29", busNo: "KA-3324", route: "Kandy - Matale", fuelLiters: 92, cost: 14500, remarks: "Routine trip fueling" },
  { id: 3, date: "2026-09-30", busNo: "GL-1188", route: "Galle - Matara", fuelLiters: 88, cost: 13750, remarks: "Intercity route consumption" },
  { id: 4, date: "2026-10-01", busNo: "NE-7712", route: "Negombo - Colombo", fuelLiters: 95, cost: 14950, remarks: "Evening peak schedule refill" },
  { id: 5, date: "2026-10-02", busNo: "MT-6678", route: "Colombo - Kandy", fuelLiters: 116, cost: 17980, remarks: "Long-distance scheduled trip" },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: 1, vehicle: "GL-1188", type: "Routine Maintenance", date: "2026-09-15", nextServiceDate: "2026-10-15", status: "Scheduled", remarks: "Oil and filtering inspection scheduled" },
  { id: 2, vehicle: "KU-5549", type: "Corrective Maintenance", date: "2026-09-10", nextServiceDate: "2026-09-28", status: "Overdue", remarks: "Air brake system service deferred due to route requirement" },
  { id: 3, vehicle: "NP-2201", type: "Routine Maintenance", date: "2026-09-22", nextServiceDate: "2026-11-22", status: "Completed", remarks: "Brake inspection and tire rotation completed" },
  { id: 4, vehicle: "NE-7712", type: "Corrective Maintenance", date: "2026-09-17", nextServiceDate: "2026-10-12", status: "Scheduled", remarks: "Battery diagnostics and replacement review" },
];

export const liveTripStatus = [
  { route: "Colombo - Kandy", busNo: "NP-2201", driver: "S. Perera", status: "In Progress", departure: "06:45", currentState: "Mid-route / 40km to Kandy" },
  { route: "Kandy - Matale", busNo: "KA-3324", driver: "N. Silva", status: "Delayed", departure: "07:15", currentState: "Traffic hold near Peradeniya" },
  { route: "Galle - Matara", busNo: "GL-1188", driver: "R. Fernando", status: "Scheduled", departure: "08:30", currentState: "Ready for dispatch" },
  { route: "Negombo - Colombo", busNo: "NE-7712", driver: "T. Kumara", status: "On Time", departure: "14:00", currentState: "Approaching Colombo" },
];

export const summaryKpis = {
  totalRoutes: 18,
  activeBuses: 25,
  driversOnDuty: 42,
  delayedTrips: 3,
};

export const routePerformance = [
  { name: "Colombo - Kandy", value: 92 },
  { name: "Galle - Matara", value: 88 },
  { name: "Kandy - Matale", value: 84 },
  { name: "Negombo - Colombo", value: 90 },
  { name: "Kurunegala - Puttalam", value: 79 },
];

export const fuelTrend = [
  { name: "Jan", value: 2600 },
  { name: "Feb", value: 2800 },
  { name: "Mar", value: 2950 },
  { name: "Apr", value: 3100 },
  { name: "May", value: 3050 },
  { name: "Jun", value: 3350 },
  { name: "Jul", value: 3400 },
];

export const tripCompletion = [
  { name: "Completed", value: 78 },
  { name: "Delayed", value: 16 },
  { name: "Cancelled", value: 6 },
];

export const fleetUtilization = [
  { name: "Utilized", value: 78 },
  { name: "Available", value: 22 },
];

export const todaysTrips = [
  { route: "Colombo - Kandy", busNo: "NP-2201", driver: "S. Perera", status: "On Time", departure: "06:45", arrival: "09:20" },
  { route: "Kandy - Matale", busNo: "KA-3324", driver: "N. Silva", status: "Delayed", departure: "07:15", arrival: "08:00" },
  { route: "Galle - Matara", busNo: "GL-1188", driver: "R. Fernando", status: "In Progress", departure: "08:30", arrival: "09:50" },
  { route: "Negombo - Colombo", busNo: "NE-7712", driver: "T. Kumara", status: "Completed", departure: "14:00", arrival: "15:15" },
];

export const reportsKpis = [
  { label: "Total Trips", value: 1184, detail: "+8.2% vs last month" },
  { label: "Completed Trips", value: 1036, detail: "+6.7%" },
  { label: "On-Time Rate", value: "92.4%", detail: "+1.8%" },
  { label: "Fuel Consumption", value: "5,620 L", detail: "+320 L" },
];

export type ScheduleConflict = {
  id: number;
  route: string;
  time: string;
  resource: string;
  reason: string;
  severity: "Critical" | "Warning";
  status: "Unresolved" | "Resolved";
};

export type OperationalException = {
  id: number;
  type: "Delayed Trip" | "Bus Breakdown" | "Driver Unavailable" | "Schedule Disruption";
  route: string;
  entity: string;
  time: string;
  reason: string;
  status: "Open" | "In Progress" | "Resolved";
  resolutionNote?: string;
};

export const supervisorConflictsData: ScheduleConflict[] = [
  {
    id: 1,
    route: "Kandy - Matale",
    time: "07:15 - 08:00",
    resource: "Bus KA-3324 Overlap",
    reason: "Bus KA-3324 scheduled for departure overlaps with maintenance service window.",
    severity: "Critical",
    status: "Unresolved",
  },
  {
    id: 2,
    route: "Kurunegala - Puttalam",
    time: "09:10 - 10:40",
    resource: "Driver M. Jayawardena Double Booked",
    reason: "Driver M. Jayawardena assigned to Kurunegala-Puttalam while on mandatory break.",
    severity: "Warning",
    status: "Unresolved",
  },
  {
    id: 3,
    route: "Colombo - Kandy",
    time: "07:30 - 10:05",
    resource: "Express Corridor Slot Conflict",
    reason: "Trip departure time overlaps with incoming express intercity arrival.",
    severity: "Warning",
    status: "Resolved",
  },
];

export const supervisorExceptionsData: OperationalException[] = [
  {
    id: 1,
    type: "Bus Breakdown",
    route: "Galle - Matara",
    entity: "Bus GL-1188",
    time: "08:45",
    reason: "Coolant leak and suspension noise reported near Hikkaduwa depot.",
    status: "Open",
  },
  {
    id: 2,
    type: "Driver Unavailable",
    route: "Kurunegala - Puttalam",
    entity: "Driver M. Jayawardena",
    time: "08:00",
    reason: "Driver called in sick 30 mins prior to morning shift dispatch.",
    status: "In Progress",
  },
  {
    id: 3,
    type: "Delayed Trip",
    route: "Kandy - Matale",
    entity: "Bus KA-3324",
    time: "07:15",
    reason: "Heavy traffic bottleneck along Akurana corridor.",
    status: "Open",
  },
  {
    id: 4,
    type: "Schedule Disruption",
    route: "Colombo - Kandy",
    entity: "Bus NP-2201",
    time: "06:45",
    reason: "Expressway lane obstruction near Kadawatha interchange.",
    status: "Resolved",
    resolutionNote: "Departure delayed by +15m; passengers notified.",
  },
];
