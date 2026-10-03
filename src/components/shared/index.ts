/**
 * src/components/shared/index.ts — barrel for @/components/shared
 *
 * Exports AppShell + all UI primitives, ThemeProvider, RecordDialog,
 * and sidebar nav items for convenient use across feature areas.
 */

export {
  AppShell,
  SectionCard,
  MetricCard,
  StatusBadge,
  PrimaryButton,
  SecondaryButton,
  EmptyState,
  SearchField,
  TableCard,
  Modal,
  ConfirmationModal,
  InputField,
  SelectField,
  PageHeader,
  MapCard,
  FilterButton,
  ChartCard,
  Toast,
  QuickActionCard,
  sidebarItems,
  adminSidebarItems,
  operationalStaffSidebarItems,
} from "./AppShell";

export type { NavItem } from "./AppShell";

export { ThemeProvider, useTheme } from "./ThemeProvider";
export type { ThemeMode } from "./ThemeProvider";

export { RecordDialog } from "./RecordDialog";
export type { RecordField } from "./RecordDialog";
