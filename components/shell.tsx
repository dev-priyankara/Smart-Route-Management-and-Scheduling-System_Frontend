"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, Bus, CalendarDays, ChevronDown, Fuel, LayoutDashboard, LogOut, Menu, MoonStar, Route, Settings, Search, ShieldCheck, SunMedium, Users, BarChart3, ArrowRight, Plus, MoreHorizontal, X, MapPinned, CheckCircle2, AlertTriangle, Truck, Wrench, ClipboardList, PencilLine, Trash2, Gauge, Navigation } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme-provider";
import { operationalStaffSidebarItems, sidebarItems } from "@/lib/mock-data";
import { readPreferences } from "@/lib/preferences";

const navIconMap = {
  LayoutDashboard,
  Route,
  CalendarDays,
  Activity,
  Bus,
  Users,
  Fuel,
  Wrench,
  BarChart3,
  Settings,
};

function subscribeToDemoRole(onChange: () => void) {
  window.addEventListener("srmss-demo-role-changed", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("srmss-demo-role-changed", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getDemoRole() {
  return window.localStorage.getItem("srmss-demo-role") ?? "depot-supervisor";
}

function getServerDemoRole() {
  return "depot-supervisor";
}

function subscribeToNavigationSearch(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getNavigationSearch() {
  return window.location.search;
}

function getServerNavigationSearch() {
  return "";
}

function IconFromName({ name }: { name: string }) {
  const Component = navIconMap[name as keyof typeof navIconMap] ?? LayoutDashboard;
  return <Component className="h-4 w-4" />;
}

export function AppShell({ children, title, subtitle, actions, navigationItems }: { children: React.ReactNode; title?: string; subtitle?: string; actions?: React.ReactNode; navigationItems?: typeof sidebarItems }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const demoRole = useSyncExternalStore(subscribeToDemoRole, getDemoRole, getServerDemoRole);
  const navigationSearch = useSyncExternalStore(subscribeToNavigationSearch, getNavigationSearch, getServerNavigationSearch);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const applyPreferences = () => {
      const preferences = readPreferences();
      const darkAccent: Record<string, string> = { "#146cfa": "#0d4ec9", "#00866a": "#00634d", "#d05a28": "#a8421b", "#a63f57": "#853047" };
      document.documentElement.style.setProperty("--accent", preferences.accent);
      document.documentElement.style.setProperty("--accent-dark", darkAccent[preferences.accent] ?? "#0d4ec9");
      document.documentElement.style.setProperty("--accent-soft", `${preferences.accent}1f`);
      document.documentElement.classList.toggle("compact-tables", preferences.compactTables);
      setSidebarCollapsed(preferences.sidebarCollapsed);
    };
    applyPreferences();
    window.addEventListener("srmss-preferences-changed", applyPreferences);
    return () => window.removeEventListener("srmss-preferences-changed", applyPreferences);
  }, []);

  const navItems = navigationItems ?? (demoRole === "operational-staff" ? operationalStaffSidebarItems : sidebarItems);
  const query = new URLSearchParams(navigationSearch);
  const selectedLogTab = query.get("tab") ?? (query.get("action") === "maintenance" ? "maintenance" : "fuel");
  const selectedSection = query.get("section") ?? "";

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) => {
      const [itemPath, itemSearch] = item.href.split("?");
      if (itemSearch) {
        const itemParams = new URLSearchParams(itemSearch);
        const itemSec = itemParams.get("section");
        const itemTab = itemParams.get("tab");
        if (itemSec && itemSec === selectedSection) return true;
        if (itemTab && itemTab === selectedLogTab) return true;
        return false;
      }
      return pathname === itemPath && !selectedSection;
    });
    return match?.label ?? "Dashboard";
  }, [navItems, pathname, selectedLogTab, selectedSection]);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] text-[var(--text-on-dark)] shadow-xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${sidebarCollapsed ? "w-20" : "w-72"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white shadow-sm">SR</div>
              {!sidebarCollapsed && (
                <div>
                  <div className="text-lg font-bold tracking-tight">SRMSS</div>
                  <div className="text-[10px] text-slate-300">Smart Route Management</div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="hidden rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/5 lg:inline-flex"
              onClick={() => setSidebarCollapsed((state) => !state)}
              aria-label="Toggle sidebar"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ArrowRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
            </button>
          </div>

          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {navItems.map((item) => {
              const [itemPath, itemSearch] = item.href.split("?");
              let isActive = false;
              if (itemSearch) {
                const itemParams = new URLSearchParams(itemSearch);
                const itemSec = itemParams.get("section");
                const itemTab = itemParams.get("tab");
                if (itemSec && itemSec === selectedSection && pathname === itemPath) isActive = true;
                else if (itemTab && itemTab === selectedLogTab && pathname === itemPath) isActive = true;
              } else {
                isActive = (pathname === itemPath || (pathname.startsWith(`${itemPath}/`) && itemPath !== "/")) && !selectedSection;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-[var(--accent)] text-white shadow-sm" : "text-slate-300 hover:bg-white/5 hover:text-white"} ${sidebarCollapsed ? "justify-center" : ""}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <IconFromName name={item.icon} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={`border-t border-white/10 p-3 ${sidebarCollapsed ? "px-2" : ""}`}>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("srmss-demo-auth");
                  window.localStorage.removeItem("srmss-demo-role");
                  window.dispatchEvent(new Event("srmss-demo-role-changed"));
                  window.location.href = "/login";
                }
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {sidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button type="button" className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-[var(--text-secondary)] lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Operations</div>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">{title ?? activeLabel}</h1>
                </div>
              </div>

              <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
                <label className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-secondary)] shadow-sm">
                  <Search className="h-4 w-4" />
                  <input type="text" placeholder="Search routes, buses, drivers..." className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                </label>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button type="button" className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-[var(--text-primary)] transition hover:bg-[var(--soft)]" aria-label="Notifications" title="Notifications">
                  <Bell className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-[var(--text-primary)] transition hover:bg-[var(--soft)]" aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme}>
                  {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                </button>
                <div className="hidden items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
                    {demoRole === "operational-staff" ? "KB" : "AD"}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {demoRole === "operational-staff" ? "K. Bandara" : "A. De Silva"}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {demoRole === "operational-staff" ? "Operational Staff / Depot Clerk" : "Depot Administrator"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--border)] px-4 py-2 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <span>Home</span>
                  <span>/</span>
                  <span className="font-medium text-[var(--text-primary)]">{activeLabel}</span>
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {subtitle && <div className="mb-6 text-[var(--text-secondary)]">{subtitle}</div>}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function SectionCard({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)] ${className}`}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
            {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function MetricCard({ label, value, change, icon: Icon, accent = "blue" }: { label: string; value: string; change: string; icon: typeof LayoutDashboard; accent?: "blue" | "green" | "amber" | "red" }) {
  const accentClasses = {
    blue: "bg-[var(--accent-soft)] text-[var(--accent)]",
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">{value}</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-muted)]">Trend</span>
        <span className="font-medium text-[var(--accent)]">{change}</span>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "On Time": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    "Delayed": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    "Completed": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    "Scheduled": "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    "Active": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    "Available": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    "On Duty": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    "Off Duty": "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    "Planned": "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    "Under Maintenance": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    "Out of Service": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    "In Service": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    "Overdue": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    "Routine Maintenance": "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    "Corrective Maintenance": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    "Normal": "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
    "Express": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    "Rural Service": "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  };

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300"}`}>{status}</span>;
}

export function PrimaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-dark)] ${className}`}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--soft)] ${className}`}>
      {children}
    </button>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--panel)] text-[var(--accent)] shadow-sm">
        <ClipboardList className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-secondary)] shadow-sm">
      <Search className="h-4 w-4" />
      <input value={value} onChange={(event) => onChange(event.target.value)} type="text" placeholder={placeholder} className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
    </label>
  );
}

export function TableCard({ headers, rows, emptyTitle, emptyDescription }: { headers: string[]; rows: React.ReactNode[]; emptyTitle?: string; emptyDescription?: string }) {
  if (!rows.length) {
    return <EmptyState title={emptyTitle ?? "No records found"} description={emptyDescription ?? "There are currently no matching records to display."} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-[var(--border)] text-[var(--text-primary)]">
              {row}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ open, title, subtitle, onClose, children }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
            {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] hover:bg-[var(--soft)]" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmationModal({ open, title, message, onConfirm, onClose }: { open: boolean; title: string; message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </Modal>
  );
}

export function InputField({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]" />
    </label>
  );
}

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function MapCard({ routeName, start, end, stops }: { routeName: string; start: string; end: string; stops: string[] }) {
  const destination = [...stops, end].join(" to ");
  const mapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(start)}&daddr=${encodeURIComponent(destination)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/${[start, ...stops, end].map((place) => encodeURIComponent(place)).join("/")}`;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{routeName}</h3>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Route map</p>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]">
          <MapPinned className="h-3.5 w-3.5" /> Route view
        </a>
      </div>
      <iframe
        title={`Google Maps route: ${routeName}`}
        src={mapUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full rounded-xl border-0"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{start} to {end}</span>
        <span>{stops.length} intermediate stops</span>
      </div>
    </div>
  );
}

export function FilterButton({ label }: { label: string }) {
  return (
    <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--soft)]">
      {label}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

export function ChartCard({ title, subtitle, className, children }: { title: string; subtitle?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)] ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300">
      {message}
    </div>
  );
}

export function QuickActionCard({ title, icon: Icon, description, href }: { title: string; icon: typeof Plus; description: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-lg">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-base font-semibold text-[var(--text-primary)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--text-muted)]">{description}</div>
    </Link>
  );
}

export { Bell, Bus, CalendarDays, ChevronDown, Fuel, LayoutDashboard, LogOut, Menu, MoonStar, Route, Settings, Search, ShieldCheck, SunMedium, Users, BarChart3, ArrowRight, Plus, MoreHorizontal, X, MapPinned, CheckCircle2, AlertTriangle, Truck, Wrench, Navigation };
