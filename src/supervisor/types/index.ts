import { RouteStatus, ScheduleStatus, DriverStatus, VehicleStatus, MaintenanceStatus } from "@/lib/mock-data";

export type SupervisorRoute = {
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

export type SupervisorSchedule = {
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

export type SupervisorBus = {
  id: number;
  registration: string;
  busNo: string;
  seatingCapacity: number;
  mileage: number;
  status: VehicleStatus;
  maintenanceHistory: string[];
};

export type SupervisorDriver = {
  id: number;
  name: string;
  licenseNumber: string;
  phone: string;
  assignedRoute: string;
  workingHours: string;
  status: DriverStatus;
};

export type SupervisorFuelRecord = {
  id: number;
  date: string;
  busNo: string;
  route: string;
  fuelLiters: number;
  cost: number;
  remarks: string;
};

export type SupervisorMaintenanceRecord = {
  id: number;
  vehicle: string;
  type: "Routine Maintenance" | "Corrective Maintenance";
  date: string;
  nextServiceDate: string;
  status: MaintenanceStatus;
  remarks: string;
};

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