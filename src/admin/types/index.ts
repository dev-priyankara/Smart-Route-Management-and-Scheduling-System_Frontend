/**
 * src/admin/types/index.ts
 * Types used across the Admin Dashboard feature area.
 */

import type {
  Bus,
  DepotRoute,
  Driver,
  OperationalException,
  ScheduleConflict,
  ScheduleItem,
} from "@/lib/mock-data";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "Pending" | "Resigned";
  lastLogin: string;
};

export type AdminDepot = {
  id: number;
  name: string;
  location: string;
  manager: string;
  buses: number;
  staff: number;
  status: "Active" | "Maintenance" | "Closed";
};

export type StatusDataItem = {
  name: string;
  value: number;
  color: string;
};

/** Props shared across all Admin section components. */
export interface AdminSectionProps {
  // Data collections
  schedules: ScheduleItem[];
  routes: DepotRoute[];
  buses: Bus[];
  drivers: Driver[];
  conflicts: ScheduleConflict[];
  exceptions: OperationalException[];
  mockUsers: AdminUser[];
  mockDepots: AdminDepot[];

  // Computed values
  todaysSchedules: ScheduleItem[];
  dispatchedTrips: ScheduleItem[];
  tripsInProgress: ScheduleItem[];
  delayedTrips: ScheduleItem[];
  scheduledTrips: ScheduleItem[];
  completedTrips: ScheduleItem[];
  openExceptions: OperationalException[];
  unresolvedConflicts: ScheduleConflict[];
  activeBuses: Bus[];
  busesUnderMaintenance: Bus[];
  onDutyDrivers: Driver[];
  fleetUtilizationRate: number;
  driverDutyRate: number;
  dispatchRate: number;
  onTimeRate: number;
  routePerformanceData: Array<{ name: string; value: number }>;
  fleetStatusData: StatusDataItem[];
  tripStatusData: StatusDataItem[];
  driverStatusData: StatusDataItem[];

  // Handlers
  showToast: (msg: string) => void;
  handleUpdateTripStatus: (trip: ScheduleItem, status: ScheduleItem["status"]) => void;
  handleDispatchTrip: (trip: ScheduleItem) => void;
  updateDriver: (id: number, data: Omit<Driver, "id">) => void;

  // Modal openers
  setViewingTripDetails: (trip: ScheduleItem | null) => void;
  setViewingBus: (bus: Bus | null) => void;
  setViewingDriver: (driver: Driver | null) => void;
  setEmergencyAdjustmentOpen: (open: boolean) => void;
  setDriverAssignmentOpen: (open: boolean) => void;
  setAddUserOpen: (open: boolean) => void;
  setViewingLogs: (open: boolean) => void;
  setSelectedConflict: (conflict: ScheduleConflict | null) => void;
  setSelectedException: (exception: OperationalException | null) => void;
}
