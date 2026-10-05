"use client";

import { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, BarChart3, Bus, CalendarDays, CheckCircle2,
  Clock, Download, Edit2, Eye, FileText, Gauge, History, LayoutDashboard,
  MapPin, Navigation, PencilLine, Phone, Plus, Route, Search, Settings,
  ShieldCheck, Trash2, UserCog, Users, Wrench, X, CheckCircle, XCircle,
  ArrowUpRight, ArrowDownRight, Minus, Zap, Award, Target, TrendingUp, TrendingDown, AlertCircle, Info, Lightbulb, Fuel
} from "lucide-react";
import { readPreferences, THEME_PRESETS, ThemePresetName, applyThemePreset } from "@/lib/preferences";
import {
  AppShell, MetricCard, Modal, PageHeader, PrimaryButton,
  SearchField, SectionCard, StatusBadge, TableCard, Toast,
} from "@/components/shell";
import {
  Bus as BusRecord, busData, DepotRoute, Driver as DriverRecord, driverData,
  OperationalException, routeData, ScheduleConflict, ScheduleItem,
  scheduleData, supervisorConflictsData, supervisorExceptionsData,
  maintenanceRecords, fuelRecords,
} from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type AdminUser = {
  id: number; name: string; email: string; role: string;
  department: string; status: "Active" | "Inactive" | "Pending" | "Resigned"; lastLogin: string;
};

type AdminDepot = {
  id: number; name: string; location: string; manager: string;
  buses: number; staff: number; status: "Active" | "Maintenance" | "Closed";
};

type ViewedRoute = DepotRoute & { assignedBusNo: string; assignedDriverName: string };

const TRIP_STATUSES: ScheduleItem["status"][] = ["Scheduled", "On Time", "Delayed", "Completed"];
const BUS_STATUSES: BusRecord["status"][] = ["Active", "In Service", "Under Maintenance", "Out of Service"];
const DRIVER_STATUSES: DriverRecord["status"][] = ["On Duty", "Available", "Off Duty"];
const ROLES = ["Administrator", "Supervisor", "Operational Staff"];
const DEPARTMENTS = ["Operations", "Maintenance", "Administration"];
const DEPOT_STATUSES = ["Active", "Maintenance"] as const;
const USER_STATUSES = ["All Users", "Active", "Pending", "Resigned"] as const;
const DEPOT_STATUS_FILTERS = ["All Status", "Active", "Closed"] as const;
const SERVICE_TYPES = ["Normal", "Express", "Rural Service"] as const;
const ROUTE_STATUSES = ["Active", "Planned", "Delayed", "Completed"] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InputRow({ label, required = true, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-[var(--text-secondary)]">
      <span className="mb-1.5 block font-medium text-[var(--text-primary)]">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition";

function ConfirmDeleteModal({ open, name, onConfirm, onClose }: { open: boolean; name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} title="Confirm Delete" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-[var(--text-secondary)]">
          Are you sure you want to delete <strong className="text-[var(--text-primary)]">{name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Delete</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Reporting & Analytics Module ─────────────────────────────────

type ReportPeriod = "weekly" | "monthly" | "custom";

type ReportingAnalyticsProps = {
  schedules: ScheduleItem[];
  routes: DepotRoute[];
  buses: BusRecord[];
  drivers: DriverRecord[];
  fuel: { id: number; date: string; busNo: string; route: string; fuelLiters: number; cost: number; remarks: string }[];
  maintenance: { id: number; vehicle: string; type: string; date: string; nextServiceDate: string; status: string; remarks: string }[];
  conflicts: ScheduleConflict[];
  exceptions: OperationalException[];
  onTimeRate: number;
};

function ReportingAnalyticsSection({
  schedules, routes, buses, drivers, fuel, maintenance, conflicts, exceptions, onTimeRate,
}: ReportingAnalyticsProps) {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [exporting, setExporting] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const dateRange = useMemo(() => {
    const end = new Date(today);
    const start = new Date(today);
    if (period === "weekly") {
      start.setDate(end.getDate() - 7);
    } else if (period === "monthly") {
      start.setMonth(end.getMonth() - 1);
    } else if (period === "custom" && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) };
    }
    return { start, end };
  }, [period, customStart, customEnd, todayStr]);

  const inRange = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    return d >= dateRange.start && d <= dateRange.end;
  }, [dateRange]);

  const filteredSchedules = useMemo(() =>
    schedules.filter((s) => inRange(s.date)),
    [schedules, inRange]
  );
  const filteredFuel = useMemo(() =>
    fuel.filter((f) => inRange(f.date)),
    [fuel, inRange]
  );
  const filteredMaintenance = useMemo(() =>
    maintenance.filter((m) => inRange(m.date)),
    [maintenance, inRange]
  );

  const tripMetrics = useMemo(() => {
    const total = filteredSchedules.length;
    const completed = filteredSchedules.filter((s) => s.status === "Completed").length;
    const onTime = filteredSchedules.filter((s) => s.status === "On Time").length;
    const delayed = filteredSchedules.filter((s) => s.status === "Delayed").length;
    const scheduled = filteredSchedules.filter((s) => s.status === "Scheduled").length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const punctualityRate = total ? Math.round(((completed + onTime) / total) * 100) : 0;
    return { total, completed, onTime, delayed, scheduled, completionRate, punctualityRate };
  }, [filteredSchedules]);

  const routePerformance = useMemo(() => {
    const byRoute = new Map<string, { total: number; completed: number; onTime: number; delayed: number }>();
    filteredSchedules.forEach((s) => {
      const entry = byRoute.get(s.routeName) || { total: 0, completed: 0, onTime: 0, delayed: 0 };
      entry.total++;
      if (s.status === "Completed") entry.completed++;
      if (s.status === "On Time") entry.onTime++;
      if (s.status === "Delayed") entry.delayed++;
      byRoute.set(s.routeName, entry);
    });
    return Array.from(byRoute.entries()).map(([name, data]) => ({
      name,
      ...data,
      completionRate: data.total ? Math.round((data.completed / data.total) * 100) : 0,
      punctualityRate: data.total ? Math.round(((data.completed + data.onTime) / data.total) * 100) : 0,
    })).sort((a, b) => b.punctualityRate - a.punctualityRate);
  }, [filteredSchedules]);

  const fuelTrends = useMemo(() => {
    const byDate = new Map<string, { liters: number; cost: number }>();
    filteredFuel.forEach((f) => {
      const entry = byDate.get(f.date) || { liters: 0, cost: 0 };
      entry.liters += f.fuelLiters;
      entry.cost += f.cost;
      byDate.set(f.date, entry);
    });
    return Array.from(byDate.entries())
      .map(([date, data]) => ({ date: date.slice(5), ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredFuel]);

  const fuelSummary = useMemo(() => {
    const totalLiters = filteredFuel.reduce((s, f) => s + f.fuelLiters, 0);
    const totalCost = filteredFuel.reduce((s, f) => s + f.cost, 0);
    const avgPerTrip = tripMetrics.total ? (totalLiters / tripMetrics.total).toFixed(1) : "0";
    const avgCostPerTrip = tripMetrics.total ? Math.round(totalCost / tripMetrics.total) : 0;
    return { totalLiters, totalCost, avgPerTrip, avgCostPerTrip };
  }, [filteredFuel, tripMetrics.total]);

  const fleetUtilization = useMemo(() => {
    const active = buses.filter((b) => b.status === "Active" || b.status === "In Service").length;
    const maintenanceCount = buses.filter((b) => b.status === "Under Maintenance").length;
    const outOfService = buses.filter((b) => b.status === "Out of Service").length;
    const utilizationRate = buses.length ? Math.round((active / buses.length) * 100) : 0;
    return { active, maintenanceCount, outOfService, utilizationRate, total: buses.length };
  }, [buses]);

  const maintenanceSummary = useMemo(() => {
    const completed = filteredMaintenance.filter((m) => m.status === "Completed").length;
    const scheduled = filteredMaintenance.filter((m) => m.status === "Scheduled").length;
    const overdue = filteredMaintenance.filter((m) => m.status === "Overdue").length;
    return { completed, scheduled, overdue, total: filteredMaintenance.length };
  }, [filteredMaintenance]);

  const weeklyTrend = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const byDay = new Map<string, { trips: number; completed: number; delayed: number }>();
    filteredSchedules.forEach((s) => {
      const dayName = days[new Date(s.date).getDay()];
      const entry = byDay.get(dayName) || { trips: 0, completed: 0, delayed: 0 };
      entry.trips++;
      if (s.status === "Completed") entry.completed++;
      if (s.status === "Delayed") entry.delayed++;
      byDay.set(dayName, entry);
    });
    return days.map((day) => {
      const data = byDay.get(day) || { trips: 0, completed: 0, delayed: 0 };
      return { day, ...data, completionRate: data.trips ? Math.round((data.completed / data.trips) * 100) : 0 };
    });
  }, [filteredSchedules]);

  const tripStatusDistribution = useMemo(() => [
    { name: "Completed", value: tripMetrics.completed, color: "#10B981" },
    { name: "On Time", value: tripMetrics.onTime, color: "#146CFA" },
    { name: "Delayed", value: tripMetrics.delayed, color: "#F59E0B" },
    { name: "Scheduled", value: tripMetrics.scheduled, color: "#8B5CF6" },
  ], [tripMetrics]);

  const insights = useMemo(() => {
    const list: { type: "positive" | "warning" | "info"; title: string; description: string }[] = [];

    if (tripMetrics.punctualityRate >= 90) {
      list.push({ type: "positive", title: "Excellent Punctuality", description: `Punctuality rate of ${tripMetrics.punctualityRate}% exceeds the 90% target. Current scheduling practices are effective.` });
    } else if (tripMetrics.punctualityRate >= 75) {
      list.push({ type: "info", title: "Good Punctuality", description: `Punctuality rate of ${tripMetrics.punctualityRate}% is within acceptable range. Monitor for improvement opportunities.` });
    } else {
      list.push({ type: "warning", title: "Punctuality Below Target", description: `Punctuality rate of ${tripMetrics.punctualityRate}% is below the 75% threshold. Review scheduling and resource allocation.` });
    }

    if (tripMetrics.delayed > 0) {
      list.push({ type: "warning", title: "Delayed Trips Detected", description: `${tripMetrics.delayed} trips were delayed in this period. Investigate root causes such as traffic, vehicle issues, or driver availability.` });
    }

    if (fuelSummary.totalLiters > 0) {
      list.push({ type: "info", title: "Fuel Efficiency", description: `Average fuel consumption is ${fuelSummary.avgPerTrip} L per trip (LKR ${fuelSummary.avgCostPerTrip.toLocaleString()} per trip). Total consumption: ${fuelSummary.totalLiters} L.` });
    }

    if (maintenanceSummary.overdue > 0) {
      list.push({ type: "warning", title: "Overdue Maintenance", description: `${maintenanceSummary.overdue} maintenance tasks are overdue. Immediate attention required to prevent vehicle breakdowns.` });
    }

    if (fleetUtilization.utilizationRate < 70) {
      list.push({ type: "info", title: "Fleet Underutilized", description: `Fleet utilization at ${fleetUtilization.utilizationRate}%. Consider reallocating vehicles to high-demand routes.` });
    } else if (fleetUtilization.utilizationRate > 90) {
      list.push({ type: "warning", title: "Fleet Near Capacity", description: `Fleet utilization at ${fleetUtilization.utilizationRate}%. Limited spare capacity for emergency dispatch.` });
    }

    const unresolvedConflicts = conflicts.filter((c) => c.status === "Unresolved").length;
    if (unresolvedConflicts > 0) {
      list.push({ type: "warning", title: "Unresolved Conflicts", description: `${unresolvedConflicts} scheduling conflicts remain unresolved. Address to improve operational efficiency.` });
    }

    const openExceptions = exceptions.filter((e) => e.status !== "Resolved").length;
    if (openExceptions > 0) {
      list.push({ type: "info", title: "Open Exceptions", description: `${openExceptions} operational exceptions are currently open. Track resolution progress.` });
    }

    if (routePerformance.length > 0) {
      const bestRoute = routePerformance[0];
      const worstRoute = routePerformance[routePerformance.length - 1];
      if (bestRoute && worstRoute && bestRoute.name !== worstRoute.name) {
        list.push({ type: "positive", title: "Route Performance Gap", description: `Best performing route: ${bestRoute.name} (${bestRoute.punctualityRate}%). Lowest: ${worstRoute.name} (${worstRoute.punctualityRate}%). Consider replicating best practices.` });
      }
    }

    return list;
  }, [tripMetrics, fuelSummary, maintenanceSummary, fleetUtilization, conflicts, exceptions, routePerformance]);

  const periodLabel = period === "weekly" ? "Weekly" : period === "monthly" ? "Monthly" : "Custom";
  const rangeLabel = `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const exportPDF = useCallback(() => {
    setExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const accent: [number, number, number] = [20, 108, 250];
      const dark: [number, number, number] = [30, 41, 59];
      const muted: [number, number, number] = [100, 116, 139];
      const green: [number, number, number] = [16, 185, 129];
      const amber: [number, number, number] = [245, 158, 11];
      const rose: [number, number, number] = [239, 68, 68];

      const addFooter = (pageNum: number, totalPages: number) => {
        const pages = pdf.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(...muted);
          pdf.text("Smart Route Management & Scheduling System (SRMSS)", margin, pageHeight - 8);
          pdf.text(`Page ${i} of ${pages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
          pdf.text("Confidential - For Management Review & Sustainability Reporting", pageWidth / 2, pageHeight - 8, { align: "center" });
        }
      };

      const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - margin - 10) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };

      // ── Report Header ──
      pdf.setFillColor(...accent);
      pdf.rect(0, 0, pageWidth, 28, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("SRMSS OPERATIONAL REPORT", margin, 12);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${periodLabel} Performance Report`, margin, 19);
      pdf.text(`Reporting Period: ${rangeLabel}`, margin, 24);
      y = 36;

      // Generated info
      pdf.setTextColor(...dark);
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
      y += 8;

      // ── KPI Summary ──
      checkPageBreak(30);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Executive Summary", margin, y);
      y += 4;

      autoTable(pdf, {
        startY: y,
        head: [["Total Trips", "Completion Rate", "Punctuality Rate", "Delayed Trips"]],
        body: [[
          String(tripMetrics.total),
          `${tripMetrics.completionRate}%`,
          `${tripMetrics.punctualityRate}%`,
          String(tripMetrics.delayed),
        ]],
        theme: "striped",
        headStyles: { fillColor: accent, fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 10, fontStyle: "bold", textColor: dark },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 4 },
      });
      y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ── Trip Completion Trend ──
      checkPageBreak(50);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Trip Completion Trend (by Day)", margin, y);
      y += 4;

      const trendRows = weeklyTrend
        .filter((d) => d.trips > 0)
        .map((d) => [d.day, String(d.trips), String(d.completed), String(d.delayed), `${d.completionRate}%`]);
      if (trendRows.length > 0) {
        autoTable(pdf, {
          startY: y,
          head: [["Day", "Total Trips", "Completed", "Delayed", "Completion %"]],
          body: trendRows,
          theme: "striped",
          headStyles: { fillColor: accent, fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: margin, right: margin },
        });
        y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(...muted);
        pdf.text("No trip data for this period.", margin, y);
        y += 8;
      }

      // ── Trip Status Distribution ──
      checkPageBreak(40);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Trip Status Distribution", margin, y);
      y += 4;

      autoTable(pdf, {
        startY: y,
        head: [["Status", "Count", "Percentage"]],
        body: [
          ["Completed", String(tripMetrics.completed), `${tripMetrics.total ? Math.round((tripMetrics.completed / tripMetrics.total) * 100) : 0}%`],
          ["On Time", String(tripMetrics.onTime), `${tripMetrics.total ? Math.round((tripMetrics.onTime / tripMetrics.total) * 100) : 0}%`],
          ["Delayed", String(tripMetrics.delayed), `${tripMetrics.total ? Math.round((tripMetrics.delayed / tripMetrics.total) * 100) : 0}%`],
          ["Scheduled", String(tripMetrics.scheduled), `${tripMetrics.total ? Math.round((tripMetrics.scheduled / tripMetrics.total) * 100) : 0}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: accent, fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });
      y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ── Route Performance ──
      checkPageBreak(50);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Route Performance Analysis", margin, y);
      y += 4;

      if (routePerformance.length > 0) {
        autoTable(pdf, {
          startY: y,
          head: [["Route", "Trips", "Completed", "On Time", "Delayed", "Punctuality %", "Completion %"]],
          body: routePerformance.map((r) => [
            r.name,
            String(r.total),
            String(r.completed),
            String(r.onTime),
            String(r.delayed),
            `${r.punctualityRate}%`,
            `${r.completionRate}%`,
          ]),
          theme: "striped",
          headStyles: { fillColor: accent, fontSize: 8 },
          styles: { fontSize: 8, cellPadding: 3 },
          margin: { left: margin, right: margin },
          columnStyles: { 0: { cellWidth: 42 } },
        });
        y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      } else {
        pdf.setFontSize(9);
        pdf.setTextColor(...muted);
        pdf.text("No route data for this period.", margin, y);
        y += 8;
      }

      // ── Fuel Consumption ──
      checkPageBreak(50);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Fuel Consumption Trends", margin, y);
      y += 4;

      if (fuelTrends.length > 0) {
        autoTable(pdf, {
          startY: y,
          head: [["Date", "Fuel (Liters)", "Cost (LKR)"]],
          body: fuelTrends.map((f) => [f.date, String(f.liters), f.cost.toLocaleString()]),
          theme: "striped",
          headStyles: { fillColor: amber, fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: margin, right: margin },
        });
        y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      }

      // Fuel summary
      checkPageBreak(30);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Fuel Summary", margin, y);
      y += 4;
      autoTable(pdf, {
        startY: y,
        head: [["Total Fuel", "Total Cost", "Avg per Trip", "Avg Cost/Trip"]],
        body: [[
          `${fuelSummary.totalLiters} L`,
          `LKR ${fuelSummary.totalCost.toLocaleString()}`,
          `${fuelSummary.avgPerTrip} L`,
          `LKR ${fuelSummary.avgCostPerTrip.toLocaleString()}`,
        ]],
        theme: "striped",
        headStyles: { fillColor: amber, fontSize: 9 },
        bodyStyles: { fontSize: 9, fontStyle: "bold" },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 4 },
      });
      y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ── Fleet Utilization ──
      checkPageBreak(40);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Fleet Utilization", margin, y);
      y += 4;

      autoTable(pdf, {
        startY: y,
        head: [["Category", "Count", "Percentage"]],
        body: [
          ["Active / In Service", String(fleetUtilization.active), `${fleetUtilization.total ? Math.round((fleetUtilization.active / fleetUtilization.total) * 100) : 0}%`],
          ["Under Maintenance", String(fleetUtilization.maintenanceCount), `${fleetUtilization.total ? Math.round((fleetUtilization.maintenanceCount / fleetUtilization.total) * 100) : 0}%`],
          ["Out of Service", String(fleetUtilization.outOfService), `${fleetUtilization.total ? Math.round((fleetUtilization.outOfService / fleetUtilization.total) * 100) : 0}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: green, fontSize: 9 },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: margin, right: margin },
      });
      y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...accent);
      pdf.text(`Fleet Utilization Rate: ${fleetUtilization.utilizationRate}%`, margin, y);
      y += 8;

      // ── Maintenance Summary ──
      checkPageBreak(40);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Maintenance Summary", margin, y);
      y += 4;

      autoTable(pdf, {
        startY: y,
        head: [["Completed", "Scheduled", "Overdue", "Total Records"]],
        body: [[
          String(maintenanceSummary.completed),
          String(maintenanceSummary.scheduled),
          String(maintenanceSummary.overdue),
          String(maintenanceSummary.total),
        ]],
        theme: "striped",
        headStyles: { fillColor: maintenanceSummary.overdue > 0 ? rose : green, fontSize: 9 },
        bodyStyles: { fontSize: 10, fontStyle: "bold" },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 4 },
      });
      y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // ── Data-Driven Insights ──
      checkPageBreak(40);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...dark);
      pdf.text("Data-Driven Insights", margin, y);
      y += 6;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      insights.forEach((insight) => {
        checkPageBreak(16);
        const color = insight.type === "positive" ? green : insight.type === "warning" ? amber : accent;
        pdf.setTextColor(...color);
        pdf.setFont("helvetica", "bold");
        pdf.text(`[${insight.type.toUpperCase()}] ${insight.title}`, margin, y);
        y += 4;
        pdf.setTextColor(...dark);
        pdf.setFont("helvetica", "normal");
        const lines = pdf.splitTextToSize(insight.description, contentWidth - 4);
        pdf.text(lines, margin + 2, y);
        y += lines.length * 4 + 4;
      });

      if (insights.length === 0) {
        pdf.setTextColor(...muted);
        pdf.text("No insights available for this period.", margin, y);
      }

      // ── Footer ──
      addFooter(1, pdf.getNumberOfPages());

      pdf.save(`SRMSS_Report_${period}_${todayStr}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setExporting(false);
    }
  }, [period, todayStr, tripMetrics, routePerformance, weeklyTrend, fuelTrends, fuelSummary, fleetUtilization, maintenanceSummary, insights, rangeLabel, periodLabel]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle={`${periodLabel} report - ${rangeLabel}`}
        action={
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={exportPDF} disabled={exporting}>
              <Download className="mr-1.5 h-4 w-4" />{exporting ? "Generating..." : "Export PDF"}
            </PrimaryButton>
          </div>
        }
      />

      <div className="space-y-6 bg-white p-6 rounded-2xl">
        <div className="border-b border-slate-200 pb-4 mb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-700">
            <BarChart3 className="h-4 w-4" /> SRMSS OPERATIONAL REPORT
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">{periodLabel} Performance Report</h2>
          {/* suppressHydrationWarning: the "Generated" timestamp is a live clock value,
              so the server and client renders can differ by a second. */}
          <p className="text-sm text-slate-500" suppressHydrationWarning>Reporting Period: {rangeLabel} | Generated: {new Date().toLocaleString()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["weekly", "monthly", "custom"] as ReportPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                period === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p === "weekly" ? "Weekly" : p === "monthly" ? "Monthly" : "Custom Range"}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700"
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Trips", value: String(tripMetrics.total), sub: `${periodLabel.toLowerCase()} schedule`, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Completion Rate", value: `${tripMetrics.completionRate}%`, sub: `${tripMetrics.completed} completed`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Punctuality Rate", value: `${tripMetrics.punctualityRate}%`, sub: "On-time + completed", icon: Gauge, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Delayed Trips", value: String(tripMetrics.delayed), sub: tripMetrics.delayed > 0 ? "Requires attention" : "All on time", icon: Clock, color: tripMetrics.delayed > 0 ? "text-amber-600" : "text-emerald-600", bg: tripMetrics.delayed > 0 ? "bg-amber-50" : "bg-emerald-50" },
          ].map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
                  <div className={`mt-1 text-3xl font-bold ${color}`}>{value}</div>
                  <div className="mt-1 text-xs text-slate-500">{sub}</div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Trip Completion Trend</h3>
            <p className="text-xs text-slate-400 mb-4">Daily trip completion rates</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#146CFA" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#146CFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="trips" stroke="#146CFA" strokeWidth={2} fillOpacity={1} fill="url(#colorTrips)" name="Total Trips" />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} fill="transparent" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Trip Status Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Breakdown of all scheduled trips</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tripStatusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {tripStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800">Route Performance Analysis</h3>
          <p className="text-xs text-slate-400 mb-4">Punctuality and completion rates by corridor</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routePerformance} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} width={130} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="punctualityRate" name="Punctuality %" fill="#146CFA" radius={[0, 6, 6, 0]} />
                <Bar dataKey="completionRate" name="Completion %" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {["Route", "Trips", "Completed", "On Time", "Delayed", "Punctuality", "Completion"].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routePerformance.map((r) => (
                  <tr key={r.name} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-3 py-2 text-slate-600">{r.total}</td>
                    <td className="px-3 py-2 text-emerald-600 font-medium">{r.completed}</td>
                    <td className="px-3 py-2 text-blue-600 font-medium">{r.onTime}</td>
                    <td className="px-3 py-2 text-amber-600 font-medium">{r.delayed}</td>
                    <td className="px-3 py-2 font-bold text-slate-800">{r.punctualityRate}%</td>
                    <td className="px-3 py-2 font-bold text-slate-800">{r.completionRate}%</td>
                  </tr>
                ))}
                {routePerformance.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">No route data for this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Fuel Consumption Trends</h3>
            <p className="text-xs text-slate-400 mb-4">Daily fuel usage and cost</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="liters" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Liters" />
                  <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Cost (LKR)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Fuel Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Total Fuel", value: `${fuelSummary.totalLiters} L`, icon: Gauge, color: "text-amber-600" },
                { label: "Total Cost", value: `LKR ${fuelSummary.totalCost.toLocaleString()}`, icon: TrendingUp, color: "text-rose-600" },
                { label: "Avg per Trip", value: `${fuelSummary.avgPerTrip} L`, icon: Target, color: "text-blue-600" },
                { label: "Avg Cost/Trip", value: `LKR ${fuelSummary.avgCostPerTrip.toLocaleString()}`, icon: BarChart3, color: "text-indigo-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Fleet Utilization</h3>
            <p className="text-xs text-slate-400 mb-4">{fleetUtilization.utilizationRate}% of fleet active</p>
            <div className="space-y-3">
              {[
                { label: "Active / In Service", value: fleetUtilization.active, total: fleetUtilization.total, color: "bg-emerald-500" },
                { label: "Under Maintenance", value: fleetUtilization.maintenanceCount, total: fleetUtilization.total, color: "bg-amber-500" },
                { label: "Out of Service", value: fleetUtilization.outOfService, total: fleetUtilization.total, color: "bg-rose-500" },
              ].map(({ label, value, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{label}</span>
                    <span className="font-bold text-slate-800">{value} / {total}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: total ? `${(value / total) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{fleetUtilization.utilizationRate}%</div>
              <div className="text-xs text-blue-600">Fleet Utilization Rate</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800">Maintenance Summary</h3>
            <p className="text-xs text-slate-400 mb-4">{maintenanceSummary.total} records in period</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Completed", value: maintenanceSummary.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Scheduled", value: maintenanceSummary.scheduled, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Overdue", value: maintenanceSummary.overdue, color: "text-rose-600", bg: "bg-rose-50" },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`rounded-xl ${bg} p-4 text-center`}>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs font-medium text-slate-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
            {maintenanceSummary.overdue > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700">{maintenanceSummary.overdue} maintenance tasks are overdue. Schedule immediate service to prevent breakdowns.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Data-Driven Insights</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl border p-4 ${
                  insight.type === "positive"
                    ? "border-emerald-200 bg-emerald-50"
                    : insight.type === "warning"
                    ? "border-amber-200 bg-amber-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                {insight.type === "positive" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : insight.type === "warning" ? (
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600 shrink-0" />
                )}
                <div>
                  <div className={`text-sm font-semibold ${
                    insight.type === "positive" ? "text-emerald-800" : insight.type === "warning" ? "text-amber-800" : "text-blue-800"
                  }`}>{insight.title}</div>
                  <p className={`text-xs mt-1 ${
                    insight.type === "positive" ? "text-emerald-700" : insight.type === "warning" ? "text-amber-700" : "text-blue-700"
                  }`}>{insight.description}</p>
                </div>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                No insights available for this period
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Smart Route Management & Scheduling System (SRMSS)</span>
            <span>Confidential - For Management Review & Sustainability Reporting</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSection = searchParams.get("section");

  // Initialize with URL section or "overview" - consistent between server and client
  const initialSection = urlSection || "overview";
  const [currentSection, setCurrentSection] = useState(initialSection);

  useEffect(() => {
    // Sync currentSection with URL when it changes
    if (urlSection && urlSection !== currentSection) {
      setCurrentSection(urlSection);
    } else if (!urlSection && currentSection !== "overview") {
      setCurrentSection("overview");
    }
  }, [urlSection, currentSection]);

  const navigateSection = useCallback((sec: string) => {
    setCurrentSection(sec);
    localStorage.setItem("srmss-manager-section", sec);
    router.push(sec === "overview" ? "/manager" : `/admin?section=${sec}`);
  }, [router]);

  // ── Persistent collections ──
  const { records: schedules, addRecord: addSchedule, updateRecord: updateSchedule, removeRecord: removeSchedule } =
    usePersistentCollection("srmss-schedules", scheduleData);
  const { records: routes, addRecord: addRoute, updateRecord: updateRoute, removeRecord: removeRoute } =
    usePersistentCollection("srmss-routes", routeData);
  const { records: buses, addRecord: addBus, updateRecord: updateBus, removeRecord: removeBus } =
    usePersistentCollection("srmss-buses", busData);
  const { records: drivers, addRecord: addDriver, updateRecord: updateDriver, removeRecord: removeDriver } =
    usePersistentCollection("srmss-drivers", driverData);
  const { records: conflicts, addRecord: addConflict, updateRecord: updateConflict, removeRecord: removeConflict } =
    usePersistentCollection("srmss-conflicts", supervisorConflictsData);
  const { records: exceptions, addRecord: addException, updateRecord: updateException, removeRecord: removeException } =
    usePersistentCollection("srmss-exceptions", supervisorExceptionsData);
  const { records: maintenance, addRecord: addMaintenance, updateRecord: updateMaintenance, removeRecord: removeMaintenance } =
    usePersistentCollection("srmss-maintenance", maintenanceRecords);
  const { records: fuel, addRecord: addFuel, updateRecord: updateFuel, removeRecord: removeFuel } =
    usePersistentCollection("srmss-fuel-records", fuelRecords);

  // ── Local state collections ──
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 1, name: "A. De Silva", email: "depot.admin@srmss.lk", role: "Supervisor", department: "Operations", status: "Active", lastLogin: "2026-10-03 08:15" },
    { id: 2, name: "K. Bandara", email: "depot.clerk@srmss.lk", role: "Operational Staff", department: "Operations", status: "Active", lastLogin: "2026-10-03 07:45" },
    { id: 3, name: "M. Perera", email: "m.perera@srmss.lk", role: "Supervisor", department: "Maintenance", status: "Active", lastLogin: "2026-10-02 16:30" },
    { id: 4, name: "S. Fernando", email: "s.fernando@srmss.lk", role: "Operational Staff", department: "Operations", status: "Inactive", lastLogin: "2026-09-28 14:20" },
    { id: 5, name: "R. Wickramasinghe", email: "r.wickrama@srmss.lk", role: "Supervisor", department: "Operations", status: "Pending", lastLogin: "Never" },
    { id: 6, name: "N. Rajapaksa", email: "n.rajapaksa@srmss.lk", role: "Operational Staff", department: "Maintenance", status: "Pending", lastLogin: "Never" },
    { id: 7, name: "D. Gunasekara", email: "d.gunasekara@srmss.lk", role: "Supervisor", department: "Administration", status: "Resigned", lastLogin: "2026-08-15 10:30" },
  ]);

  const [depots, setDepots] = useState<AdminDepot[]>([
    { id: 1, name: "Central Bus Depot", location: "Colombo", manager: "A. De Silva", buses: 12, staff: 8, status: "Active" },
    { id: 2, name: "Kandy Depot", location: "Kandy", manager: "M. Perera", buses: 8, staff: 5, status: "Active" },
    { id: 3, name: "Galle Depot", location: "Galle", manager: "R. Silva", buses: 6, staff: 4, status: "Active" },
    { id: 4, name: "Negombo Depot", location: "Negombo", manager: "T. Kumara", buses: 10, staff: 6, status: "Maintenance" },
    { id: 5, name: "Matara Depot", location: "Matara", manager: "P. Silva", buses: 4, staff: 3, status: "Closed" },
  ]);

  // ── Toast ──
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Search state ──
  const [search, setSearch] = useState("");

  // ── Filter states ──
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "pending" | "resigned">("all");
  const [depotCityFilter, setDepotCityFilter] = useState<string>("all");
  const [depotStatusFilter, setDepotStatusFilter] = useState<"all" | "active" | "closed">("all");

  // ── Computed data ──
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSchedules = useMemo(() =>
    schedules.filter((s) => s.date === todayStr).sort((a, b) => a.departureTime.localeCompare(b.departureTime)),
    [schedules, todayStr]
  );
  const activeBuses = useMemo(() => buses.filter((b) => b.status === "Active" || b.status === "In Service"), [buses]);
  const onDutyDrivers = useMemo(() => drivers.filter((d) => d.status === "On Duty"), [drivers]);
  const openExceptions = useMemo(() => exceptions.filter((e) => e.status !== "Resolved"), [exceptions]);
  const unresolvedConflicts = useMemo(() => conflicts.filter((c) => c.status === "Unresolved"), [conflicts]);
  const dispatchedTrips = useMemo(() => todaysSchedules.filter((s) => s.status === "On Time" || s.status === "Completed"), [todaysSchedules]);
  const tripsInProgress = useMemo(() => todaysSchedules.filter((s) => s.status === "On Time"), [todaysSchedules]);
  const delayedTrips = useMemo(() => todaysSchedules.filter((s) => s.status === "Delayed"), [todaysSchedules]);
  const scheduledTrips = useMemo(() => todaysSchedules.filter((s) => s.status === "Scheduled"), [todaysSchedules]);
  const completedTrips = useMemo(() => schedules.filter((s) => s.status === "Completed"), [schedules]);
  const busesUnderMaintenance = useMemo(() => buses.filter((b) => b.status === "Under Maintenance" || b.status === "Out of Service"), [buses]);
  const fleetUtilizationRate = buses.length ? Math.round((activeBuses.length / buses.length) * 100) : 0;
  const driverDutyRate = drivers.length ? Math.round((onDutyDrivers.length / drivers.length) * 100) : 0;
  const dispatchRate = todaysSchedules.length ? Math.round((dispatchedTrips.length / todaysSchedules.length) * 100) : 0;
  const onTimeRate = dispatchedTrips.length ? Math.round((tripsInProgress.length / dispatchedTrips.length) * 100) : 0;

  // ── Theme state ──
  const [currentThemePreset, setCurrentThemePreset] = useState<ThemePresetName>("Ocean Blue");
  useEffect(() => {
    const saved = readPreferences().themePreset;
    if (saved !== currentThemePreset) {
      setCurrentThemePreset(saved);
      applyThemePreset(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleThemeChange = (presetName: ThemePresetName) => {
    setCurrentThemePreset(presetName);
    applyThemePreset(presetName);
    showToast(`Dashboard theme changed to ${presetName}`);
  };

  // ── Computed filter options ──
  const depotCities = useMemo(() => [...new Set(depots.map((d) => d.location))].sort(), [depots]);

  // ── Control Board computed metrics ──
  const activeRoutesCount = useMemo(() => routes.filter((r) => r.status === "Active").length, [routes]);
  const activeBusesCount = useMemo(() => buses.filter((b) => b.status === "Active" || b.status === "In Service").length, [buses]);
  const emergencyAvailableBuses = useMemo(() => {
    // Buses that are Active and not currently assigned to an active route
    const activeRouteBusIds = new Set(routes.filter((r) => r.status === "Active").map((r) => r.busId));
    return buses.filter((b) => (b.status === "Active" || b.status === "In Service") && !activeRouteBusIds.has(b.id)).length;
  }, [buses, routes]);
  const availableDriversCount = useMemo(() => drivers.filter((d) => d.status === "Available").length, [drivers]);
  const routeCompletedBuses = useMemo(() => {
    // Buses assigned to routes with "Completed" status
    const completedRouteBusIds = new Set(routes.filter((r) => r.status === "Completed").map((r) => r.busId));
    return buses.filter((b) => completedRouteBusIds.has(b.id)).length;
  }, [buses, routes]);

  // ── Modal state (unified pattern: null = closed, object = open) ──
  // User modals
  const [userModal, setUserModal] = useState<{ mode: "add" | "edit" | "view"; data?: AdminUser } | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Supervisor", department: "Operations", status: "Active" as "Active" | "Inactive" | "Pending" | "Resigned" });

  // Depot modals
  const [depotModal, setDepotModal] = useState<{ mode: "add" | "edit" | "view"; data?: AdminDepot } | null>(null);
  const [deleteDepot, setDeleteDepot] = useState<AdminDepot | null>(null);
  const [depotForm, setDepotForm] = useState({ name: "", location: "", manager: "", buses: "0", staff: "0", status: "Active" as "Active" | "Maintenance" | "Closed" });

  // Bus modals
  const [busModal, setBusModal] = useState<{ mode: "add" | "edit" | "view"; data?: BusRecord } | null>(null);
  const [deleteBus, setDeleteBus] = useState<BusRecord | null>(null);
  const [busForm, setBusForm] = useState({ busNo: "", registration: "", seatingCapacity: "44", mileage: "0", status: "Active" as BusRecord["status"] });

  // Driver modals
  const [driverModal, setDriverModal] = useState<{ mode: "add" | "edit" | "view"; data?: DriverRecord } | null>(null);
  const [deleteDriver, setDeleteDriver] = useState<DriverRecord | null>(null);
  const [driverForm, setDriverForm] = useState({ name: "", licenseNumber: "", phone: "", assignedRoute: routeData[0]?.name || "", workingHours: "06:00 - 14:00", status: "Available" as DriverRecord["status"] });

  // Route modals
  const [routeModal, setRouteModal] = useState<{ mode: "add" | "edit" | "view"; data?: ViewedRoute } | null>(null);
  const [deleteRoute, setDeleteRoute] = useState<DepotRoute | null>(null);
  const [routeForm, setRouteForm] = useState({ name: "", start: "", end: "", distance: "0", stops: "", serviceType: "Normal" as typeof SERVICE_TYPES[number], status: "Planned" as typeof ROUTE_STATUSES[number] });

  // Schedule modals
  const [schedModal, setSchedModal] = useState<{ mode: "add" | "edit" | "view"; data?: ScheduleItem } | null>(null);
  const [deleteSched, setDeleteSched] = useState<ScheduleItem | null>(null);
  const [schedForm, setSchedForm] = useState({ routeName: routes[0]?.name || "", busNo: buses[0]?.busNo || "", driver: drivers[0]?.name || "", departureTime: "07:00", arrivalTime: "10:00", date: todayStr, serviceType: "Normal" as typeof SERVICE_TYPES[number], status: "Scheduled" as ScheduleItem["status"] });

  // Conflict / Exception modals
  const [viewConflict, setViewConflict] = useState<ScheduleConflict | null>(null);
  const [deleteConflictItem, setDeleteConflictItem] = useState<ScheduleConflict | null>(null);
  const [viewException, setViewException] = useState<OperationalException | null>(null);
  const [deleteExceptionItem, setDeleteExceptionItem] = useState<OperationalException | null>(null);

  // Maintenance modals
  const [maintModal, setMaintModal] = useState<{ mode: "add" | "edit" | "view"; data?: typeof maintenanceRecords[number] } | null>(null);
  const [deleteMaint, setDeleteMaint] = useState<typeof maintenanceRecords[number] | null>(null);
  const [maintForm, setMaintForm] = useState({ vehicle: buses[0]?.busNo || "", type: "Routine Maintenance" as "Routine Maintenance" | "Corrective Maintenance", date: todayStr, nextServiceDate: "", status: "Scheduled" as "Completed" | "Scheduled" | "Overdue", remarks: "" });

  // Fuel modals
  const [fuelModal, setFuelModal] = useState<{ mode: "add" | "edit" | "view"; data?: typeof fuelRecords[number] } | null>(null);
  const [deleteFuelItem, setDeleteFuelItem] = useState<typeof fuelRecords[number] | null>(null);
  const [fuelForm, setFuelForm] = useState({ busNo: buses[0]?.busNo || "", route: routes[0]?.name || "", fuelLiters: "", cost: "", date: todayStr, remarks: "" });

  // Misc
  const [viewingLogs, setViewingLogs] = useState(false);
  const [tripDetailModal, setTripDetailModal] = useState<ScheduleItem | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ scheduleId: "", reason: "Emergency Road Closure", newDepartureTime: "08:00", newArrivalTime: "10:35", remarks: "" });

  // ── Fuel & Maintenance modals ──
  const [fmTab, setFmTab] = useState<"fuel" | "maintenance">("fuel");
  const [fmSearch, setFmSearch] = useState("");
  const [fmModal, setFmModal] = useState<{ mode: "add" | "edit" | "view"; type: "fuel" | "maintenance"; data?: typeof fuelRecords[number] | typeof maintenanceRecords[number] } | null>(null);
  const [deleteFmItem, setDeleteFmItem] = useState<{ type: "fuel" | "maintenance"; id: number } | null>(null);
  const [fmForm, setFmForm] = useState({
    date: todayStr,
    busNo: buses[0]?.busNo || "",
    route: routes[0]?.name || "",
    fuelLiters: "",
    cost: "",
    vehicle: buses[0]?.busNo || "",
    type: "Routine Maintenance" as "Routine Maintenance" | "Corrective Maintenance",
    nextServiceDate: "",
    status: "Scheduled" as "Completed" | "Scheduled" | "Overdue",
    remarks: "",
  });

  // ── User CRUD ──
  const openAddUser = () => { setUserForm({ name: "", email: "", role: "Supervisor", department: "Operations", status: "Active" }); setUserModal({ mode: "add" }); };
  const openEditUser = (u: AdminUser) => { setUserForm({ name: u.name, email: u.email, role: u.role, department: u.department, status: u.status }); setUserModal({ mode: "edit", data: u }); };
  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) return showToast("Name and email are required", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) return showToast("Enter a valid email address", "error");
    if (userModal?.mode === "add") {
      setUsers(prev => [...prev, { id: Math.max(0, ...prev.map(u => u.id)) + 1, ...userForm, lastLogin: "Never" }]);
      showToast(`User ${userForm.name} added successfully`);
    } else if (userModal?.data) {
      setUsers(prev => prev.map(u => u.id === userModal.data!.id ? { ...u, ...userForm } : u));
      showToast(`User ${userForm.name} updated`);
    }
    setUserModal(null);
  };
  const confirmDeleteUser = () => {
    if (!deleteUser) return;
    setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    showToast(`User ${deleteUser.name} removed`);
    setDeleteUser(null);
  };

  // ── Depot CRUD ──
  const openAddDepot = () => { setDepotForm({ name: "", location: "", manager: "", buses: "0", staff: "0", status: "Active" }); setDepotModal({ mode: "add" }); };
  const openEditDepot = (d: AdminDepot) => { setDepotForm({ name: d.name, location: d.location, manager: d.manager, buses: String(d.buses), staff: String(d.staff), status: d.status }); setDepotModal({ mode: "edit", data: d }); };
  const saveDepot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depotForm.name.trim() || !depotForm.location.trim()) return showToast("Name and location are required", "error");
    const built = { name: depotForm.name, location: depotForm.location, manager: depotForm.manager, buses: Number(depotForm.buses), staff: Number(depotForm.staff), status: depotForm.status };
    if (depotModal?.mode === "add") {
      setDepots(prev => [...prev, { id: Math.max(0, ...prev.map(d => d.id)) + 1, ...built }]);
      showToast(`Depot ${depotForm.name} added`);
    } else if (depotModal?.data) {
      setDepots(prev => prev.map(d => d.id === depotModal.data!.id ? { ...d, ...built } : d));
      showToast(`Depot ${depotForm.name} updated`);
    }
    setDepotModal(null);
  };

  // ── Bus CRUD ──
  const openAddBus = () => { setBusForm({ busNo: "", registration: "", seatingCapacity: "44", mileage: "0", status: "Active" }); setBusModal({ mode: "add" }); };
  const openEditBus = (b: BusRecord) => { setBusForm({ busNo: b.busNo, registration: b.registration, seatingCapacity: String(b.seatingCapacity), mileage: String(b.mileage), status: b.status }); setBusModal({ mode: "edit", data: b }); };
  const saveBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.busNo.trim() || !busForm.registration.trim()) return showToast("Bus No and Registration are required", "error");
    const built = { busNo: busForm.busNo, registration: busForm.registration, seatingCapacity: Number(busForm.seatingCapacity), mileage: Number(busForm.mileage), status: busForm.status, maintenanceHistory: [] };
    if (busModal?.mode === "add") { addBus(built); showToast(`Bus ${busForm.busNo} added`); }
    else if (busModal?.data) { updateBus(busModal.data.id, { ...busModal.data, ...built }); showToast(`Bus ${busForm.busNo} updated`); }
    setBusModal(null);
  };

  // ── Driver CRUD ──
  const openAddDriver = () => { setDriverForm({ name: "", licenseNumber: "", phone: "", assignedRoute: routes[0]?.name || "", workingHours: "06:00 - 14:00", status: "Available" }); setDriverModal({ mode: "add" }); };
  const openEditDriver = (d: DriverRecord) => { setDriverForm({ name: d.name, licenseNumber: d.licenseNumber, phone: d.phone, assignedRoute: d.assignedRoute, workingHours: d.workingHours, status: d.status }); setDriverModal({ mode: "edit", data: d }); };
  const saveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForm.name.trim() || !driverForm.licenseNumber.trim()) return showToast("Name and license number are required", "error");
    if (driverModal?.mode === "add") { addDriver({ ...driverForm }); showToast(`Driver ${driverForm.name} added`); }
    else if (driverModal?.data) { updateDriver(driverModal.data.id, { ...driverModal.data, ...driverForm }); showToast(`Driver ${driverForm.name} updated`); }
    setDriverModal(null);
  };

  // ── Route CRUD ──
  const openAddRoute = () => { setRouteForm({ name: "", start: "", end: "", distance: "0", stops: "", serviceType: "Normal", status: "Planned" }); setRouteModal({ mode: "add" }); };
  const openEditRoute = (r: DepotRoute) => {
    setRouteForm({ name: r.name, start: r.start, end: r.end, distance: String(r.distance), stops: r.stops.join(", "), serviceType: r.serviceType, status: r.status });
    setRouteModal({ mode: "edit", data: { ...r, assignedBusNo: buses.find(b => b.id === r.busId)?.busNo ?? "—", assignedDriverName: drivers.find(d => d.id === r.driverId)?.name ?? "—" } });
  };
  const saveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.name.trim() || !routeForm.start.trim() || !routeForm.end.trim()) return showToast("Name, start and end are required", "error");
    const built = { name: routeForm.name, start: routeForm.start, end: routeForm.end, distance: Number(routeForm.distance), stops: routeForm.stops.split(",").map(s => s.trim()).filter(Boolean), serviceType: routeForm.serviceType, status: routeForm.status, color: "#146CFA", busId: 1, driverId: 1 };
    if (routeModal?.mode === "add") { addRoute(built); showToast(`Route ${routeForm.name} added`); }
    else if (routeModal?.data) { updateRoute(routeModal.data.id, { ...routeModal.data, ...built }); showToast(`Route ${routeForm.name} updated`); }
    setRouteModal(null);
  };

  // ── Schedule CRUD ──
  const openAddSched = () => { setSchedForm({ routeName: routes[0]?.name || "", busNo: buses[0]?.busNo || "", driver: drivers[0]?.name || "", departureTime: "07:00", arrivalTime: "10:00", date: todayStr, serviceType: "Normal", status: "Scheduled" }); setSchedModal({ mode: "add" }); };
  const openEditSched = (s: ScheduleItem) => { setSchedForm({ routeName: s.routeName, busNo: s.busNo, driver: s.driver, departureTime: s.departureTime, arrivalTime: s.arrivalTime, date: s.date, serviceType: s.serviceType, status: s.status }); setSchedModal({ mode: "edit", data: s }); };
  const saveSched = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedForm.routeName || !schedForm.busNo || !schedForm.driver) return showToast("Route, Bus and Driver are required", "error");
    const built = { routeId: routes.find(r => r.name === schedForm.routeName)?.id || 1, routeName: schedForm.routeName, busNo: schedForm.busNo, driver: schedForm.driver, departureTime: schedForm.departureTime, arrivalTime: schedForm.arrivalTime, date: schedForm.date, serviceType: schedForm.serviceType, status: schedForm.status };
    if (schedModal?.mode === "add") { addSchedule(built); showToast("Schedule added"); }
    else if (schedModal?.data) { updateSchedule(schedModal.data.id, { ...schedModal.data, ...built }); showToast("Schedule updated"); }
    setSchedModal(null);
  };

  // ── Maintenance CRUD ──
  const openAddMaint = () => { setMaintForm({ vehicle: buses[0]?.busNo || "", type: "Routine Maintenance", date: todayStr, nextServiceDate: "", status: "Scheduled", remarks: "" }); setMaintModal({ mode: "add" }); };
  const openEditMaint = (m: typeof maintenanceRecords[number]) => { setMaintForm({ vehicle: m.vehicle, type: m.type, date: m.date, nextServiceDate: m.nextServiceDate, status: m.status, remarks: m.remarks }); setMaintModal({ mode: "edit", data: m }); };
  const saveMaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintForm.vehicle || !maintForm.date) return showToast("Vehicle and date are required", "error");
    const built = { vehicle: maintForm.vehicle, type: maintForm.type, date: maintForm.date, nextServiceDate: maintForm.nextServiceDate || maintForm.date, status: maintForm.status, remarks: maintForm.remarks };
    if (maintModal?.mode === "add") { addMaintenance(built); showToast("Maintenance record added"); }
    else if (maintModal?.data) { updateMaintenance(maintModal.data.id, { ...maintModal.data, ...built }); showToast("Maintenance record updated"); }
    setMaintModal(null);
  };

  // ── Fuel CRUD ──
  const openAddFuel = () => { setFuelForm({ busNo: buses[0]?.busNo || "", route: routes[0]?.name || "", fuelLiters: "", cost: "", date: todayStr, remarks: "" }); setFuelModal({ mode: "add" }); };
  const openEditFuel = (f: typeof fuelRecords[number]) => { setFuelForm({ busNo: f.busNo, route: f.route, fuelLiters: String(f.fuelLiters), cost: String(f.cost), date: f.date, remarks: f.remarks }); setFuelModal({ mode: "edit", data: f }); };
  const saveFuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelForm.busNo || !fuelForm.fuelLiters) return showToast("Bus and fuel liters are required", "error");
    const built = { busNo: fuelForm.busNo, route: fuelForm.route, fuelLiters: Number(fuelForm.fuelLiters), cost: Number(fuelForm.cost), date: fuelForm.date, remarks: fuelForm.remarks };
    if (fuelModal?.mode === "add") { addFuel(built); showToast("Fuel record added"); }
    else if (fuelModal?.data) { updateFuel(fuelModal.data.id, { ...fuelModal.data, ...built }); showToast("Fuel record updated"); }
    setFuelModal(null);
  };

  // ── Conflict / Exception resolution ──
  const resolveConflict = (c: ScheduleConflict) => { const { id, ...rest } = c; updateConflict(id, { ...rest, status: "Resolved" }); showToast(`Conflict for ${c.route} resolved`); setViewConflict(null); };
  const resolveException = (ex: OperationalException, note: string) => { const { id, ...rest } = ex; updateException(id, { ...rest, status: "Resolved", resolutionNote: note || "Resolved by admin" }); showToast(`Exception on ${ex.route} resolved`); setViewException(null); };

  // ── Emergency adjustment ──
  const applyEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    const target = schedules.find(s => s.id === Number(emergencyForm.scheduleId));
    if (!target) return showToast("Schedule not found", "error");
    const { id, ...rest } = target;
    updateSchedule(id, { ...rest, departureTime: emergencyForm.newDepartureTime, arrivalTime: emergencyForm.newArrivalTime, status: "Delayed" });
    addException({ type: "Schedule Disruption", route: target.routeName, entity: `Bus ${target.busNo}`, time: emergencyForm.newDepartureTime, reason: `${emergencyForm.reason} — ${emergencyForm.remarks}`, status: "In Progress" });
    setEmergencyOpen(false);
    showToast(`Emergency adjustment applied to ${target.routeName}`);
  };

  // ── KPI metrics ──
  const summaryMetrics = [
    { label: "Scheduled Trips", value: String(todaysSchedules.length), change: "Today's timetable", icon: CalendarDays, accent: "blue" as const },
    { label: "Dispatched", value: String(dispatchedTrips.length), change: `${dispatchRate}% dispatch rate`, icon: CheckCircle2, accent: "green" as const },
    { label: "In Progress", value: String(tripsInProgress.length), change: "En route", icon: Route, accent: "blue" as const },
    { label: "Delayed", value: String(delayedTrips.length), change: delayedTrips.length ? "Requires action" : "All on time", icon: Clock, accent: delayedTrips.length > 0 ? "amber" as const : "green" as const },
    { label: "Active Fleet", value: String(activeBuses.length), change: `${fleetUtilizationRate}% utilization`, icon: Bus, accent: "green" as const },
    { label: "On-Duty Drivers", value: String(onDutyDrivers.length), change: `${driverDutyRate}% coverage`, icon: Users, accent: "blue" as const },
    { label: "Open Exceptions", value: String(openExceptions.length), change: `${unresolvedConflicts.length} conflicts`, icon: AlertTriangle, accent: openExceptions.length > 0 ? "red" as const : "green" as const },
    { label: "On-Time Rate", value: `${onTimeRate}%`, change: "Punctuality index", icon: Gauge, accent: onTimeRate >= 85 ? "green" as const : onTimeRate >= 65 ? "amber" as const : "red" as const },
  ];

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
    { id: "fuel-maintenance", label: "Fuel & Maintenance", icon: Fuel },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
  ];

  const routePerformanceData = [
    { name: "Colombo - Kandy", value: 92 }, { name: "Galle - Matara", value: 88 },
    { name: "Kandy - Matale", value: 84 }, { name: "Negombo - Colombo", value: 90 },
    { name: "Kurunegala - Puttalam", value: 79 },
  ];

  // ── Resolution note ref for exception modal ──
  const [exceptionNote, setExceptionNote] = useState("");

  return (
    <AppShell title="System Administrator Dashboard" subtitle="Complete system management, user administration, and depot oversight">
      {/* Toast */}
      <div className={`fixed bottom-5 right-5 z-[9999] transition-all duration-300 ${toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
        <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl ${toast?.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
          {toast?.type === "error" ? <XCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          {toast?.msg}
        </div>
      </div>

      {/* ══════════ OVERVIEW ══════════ */}
      {currentSection === "overview" && (
        <div className="space-y-6">

          {/* Section Tabs — overview only */}
          <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => navigateSection(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  currentSection === id ? "bg-[var(--accent)] text-white shadow-sm" : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-secondary)] hover:bg-[var(--soft)] hover:text-[var(--text-primary)]"
                }`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>

          {/* ── Admin Banner ── */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--sidebar-bg)] via-[#0d2a46] to-[var(--sidebar-bg)] p-6 text-white shadow-xl">
            {/* decorative rings */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
            <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  <ShieldCheck className="h-4 w-4" /> ADMINISTRATOR CONTROL PANEL
                </div>
                <h2 className="text-2xl font-bold">Complete System Overview &amp; Management</h2>
                <p className="text-sm text-slate-300 max-w-xl">Full visibility across routes, fleet, schedules, drivers, conflicts, fuel, maintenance and all depot operations.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[`${routes.length} Routes`, `${buses.length} Buses`, `${drivers.length} Drivers`, `${depots.length} Depots`].map(tag => (
                    <span key={tag} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button type="button" onClick={() => setViewingLogs(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur-sm">
                  <History className="h-4 w-4" /> System Logs
                </button>
              </div>
            </div>
          </div>

          {/* ── Live Stats Bar ── */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Current Time", value: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { label: new Date().toLocaleDateString("en-US", { weekday: "long" }), value: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
               { label: "Active Depots", value: `${depots.filter(d => d.status === "Active").length} / ${depots.length}`, icon: MapPin, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
              { label: "Active Routes", value: `${routes.filter(r => r.status === "Active").length} of ${routes.length}`, icon: Route, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3.5">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[var(--text-muted)] truncate">{label}</div>
                  <div className="font-bold text-[var(--text-primary)] truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── KPI Cards (8 metrics) ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryMetrics.map(m => <MetricCard key={m.label} {...m} />)}
          </div>

          {/* ── Row 1: Fleet + Drivers + Routes ── */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Fleet Utilization */}
            <SectionCard title="Fleet Status" subtitle={`${buses.length} total vehicles`}>
              <div className="space-y-3">
                {[
                  { label: "Active / In Service", count: activeBuses.length, total: buses.length, color: "bg-emerald-500" },
                  { label: "Under Maintenance", count: buses.filter(b => b.status === "Under Maintenance").length, total: buses.length, color: "bg-amber-500" },
                  { label: "Out of Service", count: buses.filter(b => b.status === "Out of Service").length, total: buses.length, color: "bg-rose-500" },
                ].map(({ label, count, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                      <span>{label}</span>
                      <span className="font-bold text-[var(--text-primary)]">{count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--soft)]">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: total ? `${(count / total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <div className="text-3xl font-bold text-[var(--text-primary)]">{fleetUtilizationRate}%</div>
                  <div className="text-xs text-[var(--text-muted)]">Fleet Utilization Rate</div>
                </div>
              </div>
            </SectionCard>

            {/* Driver Status */}
            <SectionCard title="Driver Roster" subtitle={`${drivers.length} total drivers`}>
              <div className="space-y-3">
                {[
                  { label: "On Duty", count: onDutyDrivers.length, color: "bg-blue-500", text: "text-blue-600" },
                  { label: "Available", count: drivers.filter(d => d.status === "Available").length, color: "bg-emerald-500", text: "text-emerald-600" },
                  { label: "Off Duty", count: drivers.filter(d => d.status === "Off Duty").length, color: "bg-slate-400", text: "text-slate-500" },
                ].map(({ label, count, color, text }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-3 w-3 rounded-full ${color}`} />
                      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                    </div>
                    <span className={`text-lg font-bold ${text}`}>{count}</span>
                  </div>
                ))}
                <div className="pt-1 text-center">
                  <div className="text-3xl font-bold text-[var(--text-primary)]">{driverDutyRate}%</div>
                  <div className="text-xs text-[var(--text-muted)]">Duty Coverage Rate</div>
                </div>
              </div>
            </SectionCard>

            {/* Route Performance */}
            <SectionCard title="Route Performance" subtitle="On-time % by corridor">
              <div className="space-y-2.5">
                {routePerformanceData.map(r => (
                  <div key={r.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[var(--text-secondary)] truncate max-w-[140px]">{r.name}</span>
                      <span className={`font-bold ${r.value >= 88 ? "text-emerald-600" : r.value >= 80 ? "text-amber-600" : "text-rose-600"}`}>{r.value}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--soft)]">
                      <div className={`h-full rounded-full transition-all duration-700 ${r.value >= 88 ? "bg-emerald-500" : r.value >= 80 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${r.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Row 2: Today's Trips + Alerts + Depot Snapshot ── */}
          <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr_1fr]">
            {/* Today's Trips */}
            <SectionCard title="Today's Control Board" subtitle={`${todaysSchedules.length} trips scheduled`}
              action={<button type="button" onClick={() => navigateSection("control")} className="text-xs font-semibold text-[var(--accent)] hover:underline">Full Board →</button>}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
                    <tr>
                      {["Time", "Route", "Bus", "Status", ""].map(h => <th key={h} className="px-3 py-2.5 font-medium first:pl-4 last:pr-4">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {todaysSchedules.slice(0, 7).map(trip => (
                      <tr key={trip.id} className="border-t border-[var(--border)] hover:bg-[var(--soft)] transition">
                        <td className="px-3 py-2.5 pl-4 font-semibold text-[var(--text-primary)]">{trip.departureTime}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)] max-w-[130px] truncate">{trip.routeName}</td>
                        <td className="px-3 py-2.5 text-[var(--text-muted)] text-xs">{trip.busNo}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={trip.status} /></td>
                        <td className="px-3 py-2.5 pr-4">
                          <button type="button" onClick={() => setTripDetailModal(trip)} className="rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {todaysSchedules.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No trips scheduled for today</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Alerts */}
            <SectionCard title="System Alerts" subtitle="Action required">
              <div className="space-y-2.5">
                {unresolvedConflicts.length > 0 && (
                  <button type="button" onClick={() => navigateSection("conflicts")} className="w-full text-left rounded-xl border border-rose-300 bg-rose-50/60 dark:border-rose-400/30 dark:bg-rose-500/10 p-3 hover:bg-rose-50 transition">
                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300"><AlertTriangle className="h-4 w-4 shrink-0" />{unresolvedConflicts.length} Schedule Conflicts</div>
                    <p className="text-xs text-rose-600/80 dark:text-rose-400/70 mt-0.5">Click to resolve →</p>
                  </button>
                )}
                {openExceptions.length > 0 && (
                  <button type="button" onClick={() => navigateSection("exceptions")} className="w-full text-left rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-400/30 dark:bg-amber-500/10 p-3 hover:bg-amber-50 transition">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300"><Wrench className="h-4 w-4 shrink-0" />{openExceptions.length} Open Exceptions</div>
                    <p className="text-xs text-amber-600/80 mt-0.5">Click to handle →</p>
                  </button>
                )}
                {busesUnderMaintenance.length > 0 && (
                  <button type="button" onClick={() => navigateSection("fleet")} className="w-full text-left rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 hover:bg-[var(--panel)] transition">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><Bus className="h-4 w-4 shrink-0" />{busesUnderMaintenance.length} Buses in Maintenance</div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">View fleet →</p>
                  </button>
                )}
                {unresolvedConflicts.length === 0 && openExceptions.length === 0 && busesUnderMaintenance.length === 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-500/10 p-5 text-center">
                    <CheckCircle className="h-9 w-9 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">All Systems Operational</p>
                    <p className="text-xs text-emerald-600/70 mt-0.5">No active alerts</p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Depot Snapshot */}
            <SectionCard title="Depot Snapshot" subtitle="Depot status overview">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Depot Overview</div>
                <div className="space-y-2">
                  {depots.slice(0, 3).map(d => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{d.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{d.buses} buses · {d.staff} staff</div>
                      </div>
                      <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${d.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Row 3: Schedules Summary + Maintenance Alerts + Fuel ── */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Schedule Status */}
            <SectionCard title="Schedule Summary" subtitle="All scheduled trips">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { label: "Total", value: schedules.length, color: "text-[var(--text-primary)]" },
                  { label: "Completed", value: completedTrips.length, color: "text-emerald-600" },
                  { label: "Delayed", value: delayedTrips.length, color: "text-amber-600" },
                  { label: "Scheduled", value: scheduledTrips.length, color: "text-blue-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3 text-center">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => navigateSection("schedules")} className="w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
                Manage Timetable →
              </button>
            </SectionCard>

            {/* Maintenance Alerts */}
            <SectionCard title="Maintenance Status" subtitle={`${maintenance.length} records`}>
              <div className="space-y-2.5">
                {[
                  { label: "Overdue", count: maintenance.filter(m => m.status === "Overdue").length, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-400/20" },
                  { label: "Scheduled", count: maintenance.filter(m => m.status === "Scheduled").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-400/20" },
                  { label: "Completed", count: maintenance.filter(m => m.status === "Completed").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-400/20" },
                ].map(({ label, count, color, bg, border }) => (
                  <div key={label} className={`flex items-center justify-between rounded-xl border ${border} ${bg} px-4 py-2.5`}>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                    <span className={`text-xl font-bold ${color}`}>{count}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => navigateSection("reports")} className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--soft)] py-2.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition">
                View Reports →
              </button>
            </SectionCard>

            {/* Fuel Records */}
            <SectionCard title="Fuel Records" subtitle={`${fuel.length} total log entries`}>
              <div className="space-y-2">
                {fuel.slice(0, 4).map(f => (
                  <div key={f.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{f.busNo} — {f.route}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{f.date}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-[var(--accent)]">{f.fuelLiters} L</div>
                      <div className="text-[11px] text-[var(--text-muted)]">LKR {f.cost.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {fuel.length === 0 && <div className="py-6 text-center text-sm text-[var(--text-muted)]">No fuel records yet</div>}
              </div>
            </SectionCard>
          </div>

          {/* ── Row 4: Recent Exceptions + Conflict Summary ── */}
          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard title="Recent Exceptions" subtitle={`${openExceptions.length} open`}
              action={<button type="button" onClick={() => navigateSection("exceptions")} className="text-xs font-semibold text-[var(--accent)] hover:underline">View All →</button>}>
              {openExceptions.length === 0
                ? <div className="py-6 text-center text-sm text-[var(--text-muted)]">No open exceptions</div>
                : <div className="space-y-2">{openExceptions.slice(0, 3).map(ex => (
                    <div key={ex.id} className="rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-500/10 px-3 py-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{ex.type}</span>
                        <StatusBadge status={ex.status} />
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">{ex.entity} — {ex.route}</div>
                    </div>
                  ))}</div>
              }
            </SectionCard>

            <SectionCard title="Conflict Summary" subtitle={`${unresolvedConflicts.length} unresolved`}
              action={<button type="button" onClick={() => navigateSection("conflicts")} className="text-xs font-semibold text-[var(--accent)] hover:underline">View All →</button>}>
              {unresolvedConflicts.length === 0
                ? <div className="py-6 text-center"><CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" /><div className="text-sm text-[var(--text-muted)]">No active conflicts</div></div>
                : <div className="space-y-2">{unresolvedConflicts.slice(0, 3).map(c => (
                    <div key={c.id} className="rounded-xl border border-rose-200 bg-rose-50/60 dark:border-rose-400/20 dark:bg-rose-500/10 px-3 py-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-rose-800 dark:text-rose-300">{c.resource}</span>
                        <span className="inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">{c.severity}</span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">{c.route} · {c.time}</div>
                    </div>
                  ))}</div>
              }
            </SectionCard>
          </div>
        </div>
      )}

      {/* ══════════ USER MANAGEMENT ══════════ */}
      {currentSection === "users" && (
        <div className="space-y-6">
          <PageHeader title="User Management" subtitle="Manage system users, roles and permissions" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total Users", value: users.length, color: "text-[var(--text-primary)]" },
              { label: "Active", value: users.filter(u => u.status === "Active").length, color: "text-emerald-600" },
              { label: "Supervisors", value: users.filter(u => u.role === "Supervisor").length, color: "text-blue-600" },
              { label: "Resigned", value: users.filter(u => u.status === "Resigned").length, color: "text-rose-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
          <SectionCard title="User Directory">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search by name, email, role…" /></div>
              <div className="min-w-[180px]">
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as "all" | "active" | "pending" | "resigned")}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="resigned">Resigned</option>
                </select>
              </div>
            </div>
            <TableCard
              headers={["Name", "Email", "Role", "Department", "Status", "Last Login", "Actions"]}
              rows={users
                .filter((u) => {
                  const matchesSearch = `${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(search.toLowerCase());
                  const matchesStatus =
                    userStatusFilter === "all" ||
                    (userStatusFilter === "active" && u.status === "Active") ||
                    (userStatusFilter === "pending" && u.status === "Pending") ||
                    (userStatusFilter === "resigned" && u.status === "Resigned");
                  return matchesSearch && matchesStatus;
                })
                .map((u) => (
                  <>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{u.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{u.department}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${u.status === "Active" ? "bg-emerald-100 text-emerald-700" : u.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>{u.status}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setUserModal({ mode: "view", data: u })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                        <button type="button" onClick={() => openEditUser(u)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                      </div>
                    </td>
                  </>
                ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ DEPOT MANAGEMENT ══════════ */}
      {currentSection === "depots" && (
        <div className="space-y-6">
          <PageHeader title="Depot Management" subtitle="Manage depot locations and staff" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total Depots", value: depots.length, color: "text-[var(--text-primary)]" },
              { label: "Active", value: depots.filter(d => d.status === "Active").length, color: "text-emerald-600" },
              { label: "Total Buses", value: depots.reduce((s, d) => s + d.buses, 0), color: "text-blue-600" },
              { label: "Total Staff", value: depots.reduce((s, d) => s + d.staff, 0), color: "text-amber-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
          <SectionCard title="Depot Directory">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search depots…" /></div>
              <div className="min-w-[180px]">
                <select
                  value={depotCityFilter}
                  onChange={(e) => setDepotCityFilter(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                >
                  <option value="all">All Cities</option>
                  {depotCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[180px]">
                <select
                  value={depotStatusFilter}
                  onChange={(e) => setDepotStatusFilter(e.target.value as "all" | "active" | "closed")}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <TableCard
              headers={["Depot Name", "Location", "Manager", "Buses", "Staff", "Status", "Actions"]}
              rows={depots
                .filter((d) => {
                  const matchesSearch = `${d.name} ${d.location} ${d.manager}`.toLowerCase().includes(search.toLowerCase());
                  const matchesCity = depotCityFilter === "all" || d.location === depotCityFilter;
                  const matchesStatus = depotStatusFilter === "all" || (depotStatusFilter === "active" && d.status === "Active") || (depotStatusFilter === "closed" && d.status === "Closed");
                  return matchesSearch && matchesCity && matchesStatus;
                })
                .map((d) => (
                  <>
                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{d.location}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{d.manager}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.buses}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.staff}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${d.status === "Active" ? "bg-emerald-100 text-emerald-700" : d.status === "Maintenance" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setDepotModal({ mode: "view", data: d })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                        <button type="button" onClick={() => openEditDepot(d)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                      </div>
                    </td>
                  </>
                ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ CONTROL BOARD ══════════ */}
      {currentSection === "control" && (
        <div className="space-y-6">
          <PageHeader title="Operational Control Board" subtitle="Real-time monitoring of fleet, routes, drivers, and depot operations" />
          
          {/* Operational Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Active Routes */}
            <SectionCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Routes</div>
                  <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{activeRoutesCount}</div>
                  <div className="mt-1 text-xs text-emerald-600">Currently operational</div>
                </div>
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Route className="h-6 w-6" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateSection("routes")}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition"
              >
                <MapPin className="h-3.5 w-3.5" /> View on Map
              </button>
            </SectionCard>

            {/* Active Buses */}
            <SectionCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Buses</div>
                  <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{activeBusesCount}</div>
                  <div className="mt-1 text-xs text-emerald-600">In service / Active</div>
                </div>
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Bus className="h-6 w-6" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateSection("fleet")}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition"
              >
                <Eye className="h-3.5 w-3.5" /> View Details
              </button>
            </SectionCard>

            {/* Emergency Available Buses */}
            <SectionCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Emergency Available</div>
                  <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{emergencyAvailableBuses}</div>
                  <div className="mt-1 text-xs text-amber-600">Ready for emergency dispatch</div>
                </div>
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateSection("fleet")}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition"
              >
                <Eye className="h-3.5 w-3.5" /> View List
              </button>
            </SectionCard>

            {/* Available Drivers */}
            <SectionCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Available Drivers</div>
                  <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{availableDriversCount}</div>
                  <div className="mt-1 text-xs text-emerald-600">Ready for assignment</div>
                </div>
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateSection("drivers")}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition"
              >
                <Eye className="h-3.5 w-3.5" /> View List
              </button>
            </SectionCard>

            {/* Route-Completed Buses */}
            <SectionCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Route Completed</div>
                  <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{routeCompletedBuses}</div>
                  <div className="mt-1 text-xs text-blue-600">Buses finished assigned routes</div>
                </div>
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateSection("fleet")}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition"
              >
                <Eye className="h-3.5 w-3.5" /> View Details
              </button>
            </SectionCard>

            {/* On-Time Performance */}
            <SectionCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">On-Time Rate</div>
                  <div className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{onTimeRate}%</div>
                  <div className="mt-1 text-xs text-emerald-600">Trip punctuality index</div>
                </div>
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <Gauge className="h-6 w-6" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateSection("reports")}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--panel)] transition"
              >
                <BarChart3 className="h-3.5 w-3.5" /> View Report
              </button>
            </SectionCard>
          </div>

          {/* Active Routes Map View */}
          <SectionCard title="Active Routes — Geographic View" subtitle="Click 'View on Map' above to open Google Maps with all active routes">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes.filter((r) => r.status === "Active").map((route) => (
                <div key={route.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 hover:border-[var(--accent)]/40 transition">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[var(--text-primary)] truncate">{route.name}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{route.start} → {route.end}</div>
                    </div>
                    <StatusBadge status={route.status} />
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                    <div className="flex justify-between"><span>Bus:</span><span className="font-medium text-[var(--text-primary)]">{buses.find((b) => b.id === route.busId)?.busNo ?? "Unassigned"}</span></div>
                    <div className="flex justify-between"><span>Driver:</span><span className="font-medium text-[var(--text-primary)]">{drivers.find((d) => d.id === route.driverId)?.name ?? "Unassigned"}</span></div>
                    <div className="flex justify-between"><span>Distance:</span><span className="font-medium text-[var(--text-primary)]">{route.distance} km</span></div>
                    <div className="flex justify-between"><span>Stops:</span><span className="font-medium text-[var(--text-primary)]">{route.stops.length}</span></div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/${[route.start, ...route.stops, route.end].map((place) => encodeURIComponent(place)).join("/")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--soft)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)] transition"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Open in Google Maps
                  </a>
                </div>
              ))}
              {routes.filter((r) => r.status === "Active").length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--soft)] py-12 text-center">
                  <Route className="h-12 w-12 mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-secondary)]">No active routes at the moment</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Active Trip Operations Table (Preserved from original) */}
          <SectionCard title="Active Trip Operations" subtitle="All today's scheduled trips with live status controls">
            <TableCard
              headers={["Departure","Route","Bus","Driver","Type","Status","Action","Details"]}
              rows={todaysSchedules.map(trip => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{trip.departureTime}<div className="text-xs text-[var(--text-muted)]">Arr: {trip.arrivalTime}</div></td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{trip.routeName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{trip.driver}</td>
                  <td className="px-4 py-3"><StatusBadge status={trip.serviceType} /></td>
                  <td className="px-4 py-3">
                    <select value={trip.status} onChange={e => { const { id, ...rest } = trip; updateSchedule(id, { ...rest, status: e.target.value as ScheduleItem["status"] }); showToast(`Status updated to ${e.target.value}`); }}
                      className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" aria-label={`Status for ${trip.routeName}`}>
                      {TRIP_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {trip.status === "Scheduled" && <button type="button" onClick={() => { const { id, ...rest } = trip; updateSchedule(id, { ...rest, status: "On Time" }); showToast(`${trip.routeName} dispatched`); }} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Dispatch</button>}
                    {trip.status === "Delayed" && <button type="button" onClick={() => { setEmergencyForm(f => ({ ...f, scheduleId: String(trip.id) })); setEmergencyOpen(true); }} className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700">Mitigate</button>}
                  </td>
                  <td className="px-4 py-3"><button type="button" onClick={() => setTripDetailModal(trip)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" /></button></td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ VEHICLE FLEET ══════════ */}
      {currentSection === "fleet" && (
        <div className="space-y-6">
          <PageHeader title="Vehicle Fleet Management" subtitle="Fleet monitoring and operational readiness overview" />

          {/* Bus Animation Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] py-4">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute bottom-2 left-0 text-4xl bus-anim">🚌</div>
            </div>
            <div className="px-4 py-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fleet in Motion</div>
              <div className="text-sm text-[var(--text-secondary)]">Active buses moving across all routes</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total Fleet", value: buses.length, color: "text-[var(--text-primary)]" },
              { label: "Active / In Service", value: activeBuses.length, color: "text-emerald-600" },
              { label: "Under Maintenance", value: buses.filter(b => b.status === "Under Maintenance").length, color: "text-amber-600" },
              { label: "Out of Service", value: buses.filter(b => b.status === "Out of Service").length, color: "text-rose-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
          <SectionCard title="Fleet Roster">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px] max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search bus, registration…" /></div>
            </div>
            <TableCard
              headers={["Bus No","Registration","Capacity","Mileage","Status","Maintenance Note","Actions"]}
              rows={buses.filter(b => `${b.busNo} ${b.registration} ${b.status}`.toLowerCase().includes(search.toLowerCase())).map(b => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{b.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{b.registration}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{b.seatingCapacity} seats</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{b.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{b.maintenanceHistory[0] || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setBusModal({ mode: "view", data: b })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                      <button type="button" onClick={() => openEditBus(b)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                    </div>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ DRIVER ROSTER ══════════ */}
      {currentSection === "drivers" && (
        <div className="space-y-6">
          <PageHeader title="Driver Roster" subtitle="Review driver roster, contact information, and assignments" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total Drivers", value: drivers.length, color: "text-[var(--text-primary)]" },
              { label: "On Duty", value: onDutyDrivers.length, color: "text-blue-600" },
              { label: "Available", value: drivers.filter(d => d.status === "Available").length, color: "text-emerald-600" },
              { label: "Off Duty", value: drivers.filter(d => d.status === "Off Duty").length, color: "text-slate-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
          <SectionCard title="Driver Directory">
            <div className="mb-4 max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search driver, license, route…" /></div>
            <TableCard
              headers={["Driver ID","Driver Name","Phone","License No","Insurance Date","Assigned Bus","Assigned Route","Status","Actions"]}
              rows={drivers.filter(d => `${d.name} ${d.licenseNumber} ${d.assignedRoute} ${d.status}`.toLowerCase().includes(search.toLowerCase())).map(d => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.id}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{d.name}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" /><span className="text-[var(--text-secondary)]">{d.phone}</span></div></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{d.licenseNumber}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{d.insuranceDate || "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find(b => b.id === d.assignedBusId)?.busNo ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{d.assignedRoute}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setDriverModal({ mode: "view", data: d })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                      <button type="button" onClick={() => openEditDriver(d)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                    </div>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ ROUTE NETWORK ══════════ */}
      {currentSection === "routes" && (
        <div className="space-y-6">
          <PageHeader title="Route Network" subtitle="Full management of all service corridors" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total Routes", value: routes.length, color: "text-[var(--text-primary)]" },
              { label: "Active", value: routes.filter(r => r.status === "Active").length, color: "text-emerald-600" },
              { label: "Total Distance", value: `${routes.reduce((s, r) => s + r.distance, 0)} km`, color: "text-blue-600" },
              { label: "Delayed", value: routes.filter(r => r.status === "Delayed").length, color: "text-amber-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{label}</div>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
          <SectionCard title="Route Directory">
            <div className="mb-4 max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search route, start, destination…" /></div>
            <TableCard
              headers={["Route Name","Start","End","Distance","Stops","Service","Bus","Driver","Status","Actions"]}
              rows={routes.filter(r => `${r.name} ${r.start} ${r.end} ${r.status}`.toLowerCase().includes(search.toLowerCase())).map(r => (
                <>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{r.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.start}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.end}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.distance} km</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{r.stops.length}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.serviceType} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find(b => b.id === r.busId)?.busNo ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{drivers.find(d => d.id === r.driverId)?.name ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setRouteModal({ mode: "view", data: { ...r, assignedBusNo: buses.find(b => b.id === r.busId)?.busNo ?? "—", assignedDriverName: drivers.find(d => d.id === r.driverId)?.name ?? "—" } })} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]"><Eye className="h-3.5 w-3.5" />View</button>
                      <button type="button" onClick={() => openEditRoute(r)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"><PencilLine className="h-3.5 w-3.5" />Edit</button>
                    </div>
                  </td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ TIMETABLE ══════════ */}
      {currentSection === "schedules" && (
        <div className="space-y-6">
          <PageHeader title="Timetable" subtitle="View all scheduled trips across all depots" />
          <SectionCard title="Complete Timetable">
            <div className="mb-4 max-w-sm"><SearchField value={search} onChange={setSearch} placeholder="Search route, bus, driver, date…" /></div>
            <TableCard
              headers={["Date","Departure","Arrival","Route","Bus","Driver","Type","Status"]}
              rows={schedules.filter(s => `${s.routeName} ${s.busNo} ${s.driver} ${s.date} ${s.status}`.toLowerCase().includes(search.toLowerCase())).map(s => (
                <>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{s.date}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{s.departureTime}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{s.arrivalTime}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{s.routeName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{s.busNo}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{s.driver}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.serviceType} /></td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                </>
              ))}
            />
          </SectionCard>
        </div>
      )}

      {/* ══════════ CONFLICT CENTER ══════════ */}
      {currentSection === "conflicts" && (
        <div className="space-y-6">
          <PageHeader title="Schedule Conflict Center" subtitle="Review and resolve scheduling conflicts" />
          {conflicts.filter(c => c.status === "Unresolved").length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-rose-600">Unresolved ({conflicts.filter(c => c.status === "Unresolved").length})</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {conflicts.filter(c => c.status === "Unresolved").map(c => (
                  <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-rose-300 bg-rose-50/60 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-600" /><span className="font-bold text-rose-900 dark:text-rose-200">{c.resource}</span></div>
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">{c.severity}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">{c.reason}</p>
                    <div className="flex items-center justify-between border-t border-rose-200 pt-2">
                      <span className="text-[11px] text-[var(--text-muted)]">{c.route} · {c.time}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setViewConflict(c)} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Details</button>
                        <button type="button" onClick={() => resolveConflict(c)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Resolve</button>
                        <button type="button" onClick={() => setDeleteConflictItem(c)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {conflicts.filter(c => c.status === "Resolved").length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">Resolved ({conflicts.filter(c => c.status === "Resolved").length})</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {conflicts.filter(c => c.status === "Resolved").map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                    <div><div className="font-medium text-[var(--text-primary)]">{c.resource}</div><p className="text-xs text-[var(--text-muted)]">{c.route} · {c.time}</p></div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Resolved</span>
                      <button type="button" onClick={() => setDeleteConflictItem(c)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs text-rose-600 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {conflicts.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] py-16 text-center"><p className="text-[var(--text-muted)]">No conflicts recorded.</p></div>}
        </div>
      )}

      {/* ══════════ EXCEPTIONS ══════════ */}
      {currentSection === "exceptions" && (
        <div className="space-y-6">
          <PageHeader title="Exceptions &amp; Operational Issues" subtitle="Track and resolve operational exceptions" />
          {exceptions.filter(e => e.status !== "Resolved").length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-600">Open ({exceptions.filter(e => e.status !== "Resolved").length})</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {exceptions.filter(e => e.status !== "Resolved").map(ex => (
                  <div key={ex.id} className="flex flex-col justify-between rounded-2xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
                    <div className="flex items-start justify-between gap-2 mb-2"><div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-amber-600" /><span className="font-bold text-amber-900 dark:text-amber-200">{ex.type}: {ex.entity}</span></div><StatusBadge status={ex.status} /></div>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">{ex.reason}</p>
                    <div className="flex items-center justify-between border-t border-amber-200 pt-2">
                      <span className="text-[11px] text-[var(--text-muted)]">{ex.route} · {ex.time}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setExceptionNote(""); setViewException(ex); }} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Handle</button>
                        <button type="button" onClick={() => setDeleteExceptionItem(ex)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {exceptions.filter(e => e.status === "Resolved").length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">Resolved ({exceptions.filter(e => e.status === "Resolved").length})</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {exceptions.filter(e => e.status === "Resolved").map(ex => (
                  <div key={ex.id} className="flex items-start justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                    <div><div className="font-medium text-[var(--text-primary)]">{ex.type}: {ex.entity}</div><p className="text-xs text-[var(--text-muted)]">{ex.route} · {ex.time}</p>{ex.resolutionNote && <p className="text-xs text-emerald-600 mt-1">{ex.resolutionNote}</p>}</div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 whitespace-nowrap">Resolved</span>
                      <button type="button" onClick={() => setDeleteExceptionItem(ex)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs text-rose-600 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

{/* ══════════ REPORTS ══════════ */}
      {currentSection === "reports" && (
        <ReportingAnalyticsSection
          schedules={schedules}
          routes={routes}
          buses={buses}
          drivers={drivers}
          fuel={fuel}
          maintenance={maintenance}
          conflicts={conflicts}
          exceptions={exceptions}
          onTimeRate={onTimeRate}
        />
      )}

      {/* ══════════ SYSTEM SETTINGS ══════════ */}
      {currentSection === "settings" && (
        <div className="space-y-6">
          <PageHeader title="System Settings" subtitle="System configuration" />
          <SectionCard title="No Active Settings" subtitle="All system configurations have been removed">
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--soft)] py-12 text-center">
              <Settings className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-sm text-[var(--text-muted)]">No settings are currently available.</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Configuration options will be added in a future update.</p>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ══════════════════════════════════════
          ALL MODALS
      ══════════════════════════════════════ */}

      {/* System Logs */}
      <Modal open={viewingLogs} title="System Activity Logs" onClose={() => setViewingLogs(false)}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {[
            { time: "2026-10-03 08:15:22", msg: "Admin login from 192.168.1.45" },
            { time: "2026-10-03 08:12:05", msg: "User K. Bandara logged in" },
            { time: "2026-10-03 07:45:18", msg: "Schedule updated: Colombo - Kandy (NP-2201)" },
            { time: "2026-10-03 07:30:00", msg: "System backup completed successfully" },
            { time: "2026-10-03 07:15:42", msg: "Maintenance alert generated: GL-1188" },
            { time: "2026-10-03 06:50:10", msg: "Bus NP-2201 dispatched on Colombo - Kandy" },
            { time: "2026-10-03 06:45:00", msg: "Daily timetable loaded: 7 trips scheduled" },
          ].map(({ time, msg }) => (
            <div key={time} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-3">
              <div className="text-xs text-[var(--text-muted)]">{time}</div>
              <div className="text-sm text-[var(--text-primary)]">{msg}</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Trip Detail */}
      <Modal open={!!tripDetailModal} title="Trip Details" onClose={() => setTripDetailModal(null)}>
        {tripDetailModal && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Route</div><div className="text-lg font-bold text-[var(--text-primary)]">{tripDetailModal.routeName}</div></div>
              <StatusBadge status={tripDetailModal.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Departure", tripDetailModal.departureTime], ["Arrival", tripDetailModal.arrivalTime], ["Bus", tripDetailModal.busNo], ["Driver", tripDetailModal.driver], ["Date", tripDetailModal.date], ["Service Type", tripDetailModal.serviceType]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Emergency Adjustment */}
      <Modal open={emergencyOpen} title="Emergency Schedule Adjustment" onClose={() => setEmergencyOpen(false)}>
        <form onSubmit={applyEmergency} className="space-y-4">
          <InputRow label="Schedule">
            <select value={emergencyForm.scheduleId} onChange={e => setEmergencyForm(f => ({ ...f, scheduleId: e.target.value }))} className={inputCls}>
              {schedules.map(s => <option key={s.id} value={s.id}>{s.routeName} — {s.departureTime} ({s.date})</option>)}
            </select>
          </InputRow>
          <InputRow label="Reason"><input value={emergencyForm.reason} onChange={e => setEmergencyForm(f => ({ ...f, reason: e.target.value }))} className={inputCls} /></InputRow>
          <div className="grid gap-3 sm:grid-cols-2">
            <InputRow label="New Departure"><input type="time" value={emergencyForm.newDepartureTime} onChange={e => setEmergencyForm(f => ({ ...f, newDepartureTime: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="New Arrival"><input type="time" value={emergencyForm.newArrivalTime} onChange={e => setEmergencyForm(f => ({ ...f, newArrivalTime: e.target.value }))} className={inputCls} /></InputRow>
          </div>
          <InputRow label="Remarks" required={false}><input value={emergencyForm.remarks} onChange={e => setEmergencyForm(f => ({ ...f, remarks: e.target.value }))} className={inputCls} /></InputRow>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEmergencyOpen(false)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
            <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">Apply Adjustment</button>
          </div>
        </form>
      </Modal>

      {/* ── User modals ── */}
      <Modal open={userModal?.mode === "view"} title="User Details" onClose={() => setUserModal(null)}>
        {userModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">User</div><div className="text-xl font-bold text-[var(--text-primary)]">{userModal.data.name}</div></div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${userModal.data.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{userModal.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Email", userModal.data.email], ["Role", userModal.data.role], ["Department", userModal.data.department], ["Last Login", userModal.data.lastLogin]] as [string,string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)] break-all">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (userModal?.data) openEditUser(userModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]">Edit</button><button type="button" onClick={() => setUserModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>

      <Modal open={userModal?.mode === "add" || userModal?.mode === "edit"} title={userModal?.mode === "add" ? "Add New User" : "Edit User"} onClose={() => setUserModal(null)}>
        <form onSubmit={saveUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow label="Full Name"><input required value={userForm.name} onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Full name" /></InputRow>
            <InputRow label="Email Address"><input required type="email" value={userForm.email} onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="user@srmss.lk" /></InputRow>
            <InputRow label="Role"><select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></InputRow>
            <InputRow label="Department"><select value={userForm.department} onChange={e => setUserForm(f => ({ ...f, department: e.target.value }))} className={inputCls}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></InputRow>
            <InputRow label="Status"><select value={userForm.status} onChange={e => setUserForm(f => ({ ...f, status: e.target.value as "Active" | "Inactive" }))} className={inputCls}><option>Active</option><option>Inactive</option></select></InputRow>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setUserModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{userModal?.mode === "add" ? "Add User" : "Save Changes"}</button></div>
        </form>
      </Modal>
      <ConfirmDeleteModal open={!!deleteUser} name={deleteUser?.name ?? ""} onConfirm={confirmDeleteUser} onClose={() => setDeleteUser(null)} />

      {/* ── Depot modals ── */}
      <Modal open={depotModal?.mode === "view"} title="Depot Details" onClose={() => setDepotModal(null)}>
        {depotModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3">
              <div><div className="text-xs text-[var(--text-muted)] uppercase">Depot</div><div className="text-xl font-bold text-[var(--text-primary)]">{depotModal.data.name}</div></div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${depotModal.data.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{depotModal.data.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([["Location", depotModal.data.location], ["Manager", depotModal.data.manager], ["Assigned Buses", `${depotModal.data.buses} vehicles`], ["Staff Count", `${depotModal.data.staff} personnel`]] as [string,string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (depotModal?.data) openEditDepot(depotModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setDepotModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>
      <Modal open={depotModal?.mode === "add" || depotModal?.mode === "edit"} title={depotModal?.mode === "add" ? "Add Depot" : "Edit Depot"} onClose={() => setDepotModal(null)}>
        <form onSubmit={saveDepot} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow label="Depot Name"><input required value={depotForm.name} onChange={e => setDepotForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Colombo Central Depot" /></InputRow>
            <InputRow label="Location"><input required value={depotForm.location} onChange={e => setDepotForm(f => ({ ...f, location: e.target.value }))} className={inputCls} placeholder="City" /></InputRow>
            <InputRow label="Manager Name"><input value={depotForm.manager} onChange={e => setDepotForm(f => ({ ...f, manager: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Status"><select value={depotForm.status} onChange={e => setDepotForm(f => ({ ...f, status: e.target.value as "Active" | "Maintenance" }))} className={inputCls}>{DEPOT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
            <InputRow label="Buses Assigned"><input type="number" min="0" value={depotForm.buses} onChange={e => setDepotForm(f => ({ ...f, buses: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Staff Count"><input type="number" min="0" value={depotForm.staff} onChange={e => setDepotForm(f => ({ ...f, staff: e.target.value }))} className={inputCls} /></InputRow>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setDepotModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{depotModal?.mode === "add" ? "Add Depot" : "Save Changes"}</button></div>
        </form>
      </Modal>
      <ConfirmDeleteModal open={!!deleteDepot} name={deleteDepot?.name ?? ""} onConfirm={() => { if (!deleteDepot) return; setDepots(p => p.filter(d => d.id !== deleteDepot.id)); showToast(`Depot ${deleteDepot.name} removed`); setDeleteDepot(null); }} onClose={() => setDeleteDepot(null)} />

      {/* ── Bus modals ── */}
      <Modal open={busModal?.mode === "view"} title="Bus Details" onClose={() => setBusModal(null)}>
        {busModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3"><div><div className="text-xs text-[var(--text-muted)] uppercase">Fleet No</div><div className="text-xl font-bold text-[var(--text-primary)]">{busModal.data.busNo}</div></div><StatusBadge status={busModal.data.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["Registration", busModal.data.registration], ["Seating Capacity", `${busModal.data.seatingCapacity} seats`], ["Mileage", `${busModal.data.mileage.toLocaleString()} km`], ["Status", busModal.data.status]] as [string,string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            {busModal.data.maintenanceHistory.length > 0 && <div className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)] mb-2">Maintenance History</div>{busModal.data.maintenanceHistory.map((h, i) => <div key={i} className="text-xs text-[var(--text-secondary)]">• {h}</div>)}</div>}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (busModal?.data) openEditBus(busModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setBusModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>
      <Modal open={busModal?.mode === "add" || busModal?.mode === "edit"} title={busModal?.mode === "add" ? "Add Bus" : "Edit Bus"} onClose={() => setBusModal(null)}>
        <form onSubmit={saveBus} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow label="Fleet / Bus No"><input required value={busForm.busNo} onChange={e => setBusForm(f => ({ ...f, busNo: e.target.value }))} className={inputCls} placeholder="e.g. NP-2201" /></InputRow>
            <InputRow label="Registration No."><input required value={busForm.registration} onChange={e => setBusForm(f => ({ ...f, registration: e.target.value }))} className={inputCls} placeholder="e.g. CAB-1456" /></InputRow>
            <InputRow label="Seating Capacity"><input type="number" min="1" value={busForm.seatingCapacity} onChange={e => setBusForm(f => ({ ...f, seatingCapacity: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Mileage (km)"><input type="number" min="0" value={busForm.mileage} onChange={e => setBusForm(f => ({ ...f, mileage: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Status"><select value={busForm.status} onChange={e => setBusForm(f => ({ ...f, status: e.target.value as BusRecord["status"] }))} className={inputCls}>{BUS_STATUSES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setBusModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{busModal?.mode === "add" ? "Add Bus" : "Save Changes"}</button></div>
        </form>
      </Modal>
      <ConfirmDeleteModal open={!!deleteBus} name={deleteBus?.busNo ?? ""} onConfirm={() => { if (!deleteBus) return; removeBus(deleteBus.id); showToast(`Bus ${deleteBus.busNo} removed`); setDeleteBus(null); }} onClose={() => setDeleteBus(null)} />

      {/* ── Driver modals ── */}
      <Modal open={driverModal?.mode === "view"} title="Driver Profile" onClose={() => setDriverModal(null)}>
        {driverModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3"><div><div className="text-xs text-[var(--text-muted)] uppercase">Driver</div><div className="text-xl font-bold text-[var(--text-primary)]">{driverModal.data.name}</div></div><StatusBadge status={driverModal.data.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["License No.", driverModal.data.licenseNumber], ["Phone", driverModal.data.phone], ["Assigned Route", driverModal.data.assignedRoute], ["Working Hours", driverModal.data.workingHours]] as [string,string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (driverModal?.data) openEditDriver(driverModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setDriverModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>
      <Modal open={driverModal?.mode === "add" || driverModal?.mode === "edit"} title={driverModal?.mode === "add" ? "Add Driver" : "Edit Driver"} onClose={() => setDriverModal(null)}>
        <form onSubmit={saveDriver} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow label="Full Name"><input required value={driverForm.name} onChange={e => setDriverForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. S. Perera" /></InputRow>
            <InputRow label="License Number"><input required value={driverForm.licenseNumber} onChange={e => setDriverForm(f => ({ ...f, licenseNumber: e.target.value }))} className={inputCls} placeholder="e.g. B-1598" /></InputRow>
            <InputRow label="Phone"><input type="tel" value={driverForm.phone} onChange={e => setDriverForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="077-xxx-xxxx" /></InputRow>
            <InputRow label="Assigned Route"><select value={driverForm.assignedRoute} onChange={e => setDriverForm(f => ({ ...f, assignedRoute: e.target.value }))} className={inputCls}>{routes.map(r => <option key={r.id}>{r.name}</option>)}</select></InputRow>
            <InputRow label="Working Hours"><input value={driverForm.workingHours} onChange={e => setDriverForm(f => ({ ...f, workingHours: e.target.value }))} className={inputCls} placeholder="06:00 - 14:00" /></InputRow>
            <InputRow label="Status"><select value={driverForm.status} onChange={e => setDriverForm(f => ({ ...f, status: e.target.value as DriverRecord["status"] }))} className={inputCls}>{DRIVER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setDriverModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{driverModal?.mode === "add" ? "Add Driver" : "Save Changes"}</button></div>
        </form>
      </Modal>
      <ConfirmDeleteModal open={!!deleteDriver} name={deleteDriver?.name ?? ""} onConfirm={() => { if (!deleteDriver) return; removeDriver(deleteDriver.id); showToast(`Driver ${deleteDriver.name} removed`); setDeleteDriver(null); }} onClose={() => setDeleteDriver(null)} />

      {/* ── Route modals ── */}
      <Modal open={routeModal?.mode === "view"} title="Route Details" onClose={() => setRouteModal(null)}>
        {routeModal?.data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] p-3"><div><div className="text-xs text-[var(--text-muted)] uppercase">Route</div><div className="text-xl font-bold text-[var(--text-primary)]">{routeModal.data.name}</div></div><StatusBadge status={routeModal.data.status} /></div>
            <div className="grid grid-cols-2 gap-3">
              {([["Start Point", routeModal.data.start], ["Destination", routeModal.data.end], ["Distance", `${routeModal.data.distance} km`], ["Service Type", routeModal.data.serviceType], ["Assigned Bus", routeModal.data.assignedBusNo], ["Assigned Driver", routeModal.data.assignedDriverName]] as [string,string][]).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)]">{k}</div><div className="font-semibold text-[var(--text-primary)]">{v}</div></div>
              ))}
            </div>
            {routeModal.data.stops.length > 0 && <div className="rounded-xl border border-[var(--border)] p-3"><div className="text-xs text-[var(--text-muted)] mb-2">Intermediate Stops ({routeModal.data.stops.length})</div><div className="flex flex-wrap gap-2">{routeModal.data.stops.map(s => <span key={s} className="rounded-full bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]">{s}</span>)}</div></div>}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => { if (routeModal?.data) openEditRoute(routeModal.data); }} className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)]">Edit</button><button type="button" onClick={() => setRouteModal(null)} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white">Close</button></div>
          </div>
        )}
      </Modal>
      <Modal open={routeModal?.mode === "add" || routeModal?.mode === "edit"} title={routeModal?.mode === "add" ? "Add Route" : "Edit Route"} onClose={() => setRouteModal(null)}>
        <form onSubmit={saveRoute} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow label="Route Name"><input required value={routeForm.name} onChange={e => setRouteForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Colombo - Kandy" /></InputRow>
            <InputRow label="Distance (km)"><input type="number" min="0" value={routeForm.distance} onChange={e => setRouteForm(f => ({ ...f, distance: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Start Point"><input required value={routeForm.start} onChange={e => setRouteForm(f => ({ ...f, start: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Destination"><input required value={routeForm.end} onChange={e => setRouteForm(f => ({ ...f, end: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Service Type"><select value={routeForm.serviceType} onChange={e => setRouteForm(f => ({ ...f, serviceType: e.target.value as typeof SERVICE_TYPES[number] }))} className={inputCls}>{SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
            <InputRow label="Status"><select value={routeForm.status} onChange={e => setRouteForm(f => ({ ...f, status: e.target.value as typeof ROUTE_STATUSES[number] }))} className={inputCls}>{ROUTE_STATUSES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
          </div>
          <InputRow label="Intermediate Stops" required={false}><input value={routeForm.stops} onChange={e => setRouteForm(f => ({ ...f, stops: e.target.value }))} className={inputCls} placeholder="Comma-separated: Kelaniya, Kurunegala" /></InputRow>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setRouteModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{routeModal?.mode === "add" ? "Add Route" : "Save Changes"}</button></div>
        </form>
      </Modal>
      <ConfirmDeleteModal open={!!deleteRoute} name={deleteRoute?.name ?? ""} onConfirm={() => { if (!deleteRoute) return; removeRoute(deleteRoute.id); showToast(`Route ${deleteRoute.name} removed`); setDeleteRoute(null); }} onClose={() => setDeleteRoute(null)} />

      {/* ── Schedule modals ── */}
      <Modal open={schedModal?.mode === "add" || schedModal?.mode === "edit"} title={schedModal?.mode === "add" ? "Add Schedule" : "Edit Schedule"} onClose={() => setSchedModal(null)}>
        <form onSubmit={saveSched} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputRow label="Route"><select value={schedForm.routeName} onChange={e => setSchedForm(f => ({ ...f, routeName: e.target.value }))} className={inputCls}>{routes.map(r => <option key={r.id}>{r.name}</option>)}</select></InputRow>
            <InputRow label="Bus"><select value={schedForm.busNo} onChange={e => setSchedForm(f => ({ ...f, busNo: e.target.value }))} className={inputCls}>{buses.map(b => <option key={b.id}>{b.busNo}</option>)}</select></InputRow>
            <InputRow label="Driver"><select value={schedForm.driver} onChange={e => setSchedForm(f => ({ ...f, driver: e.target.value }))} className={inputCls}>{drivers.map(d => <option key={d.id}>{d.name}</option>)}</select></InputRow>
            <InputRow label="Date"><input type="date" value={schedForm.date} onChange={e => setSchedForm(f => ({ ...f, date: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Departure Time"><input type="time" value={schedForm.departureTime} onChange={e => setSchedForm(f => ({ ...f, departureTime: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Arrival Time"><input type="time" value={schedForm.arrivalTime} onChange={e => setSchedForm(f => ({ ...f, arrivalTime: e.target.value }))} className={inputCls} /></InputRow>
            <InputRow label="Service Type"><select value={schedForm.serviceType} onChange={e => setSchedForm(f => ({ ...f, serviceType: e.target.value as typeof SERVICE_TYPES[number] }))} className={inputCls}>{SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
            <InputRow label="Status"><select value={schedForm.status} onChange={e => setSchedForm(f => ({ ...f, status: e.target.value as ScheduleItem["status"] }))} className={inputCls}>{TRIP_STATUSES.map(s => <option key={s}>{s}</option>)}</select></InputRow>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setSchedModal(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="submit" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">{schedModal?.mode === "add" ? "Add Schedule" : "Save Changes"}</button></div>
        </form>
      </Modal>
      <ConfirmDeleteModal open={!!deleteSched} name={`${deleteSched?.routeName} (${deleteSched?.departureTime})`} onConfirm={() => { if (!deleteSched) return; removeSchedule(deleteSched.id); showToast("Schedule removed"); setDeleteSched(null); }} onClose={() => setDeleteSched(null)} />

      {/* ── Conflict detail ── */}
      <Modal open={!!viewConflict} title="Conflict Details" onClose={() => setViewConflict(null)}>
        {viewConflict && (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3"><div className="font-semibold text-rose-800">{viewConflict.resource}</div><div className="text-xs text-rose-700 mt-1">{viewConflict.reason}</div><div className="text-xs text-[var(--text-muted)] mt-1">{viewConflict.route} · {viewConflict.time}</div></div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setViewConflict(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Close</button><button type="button" onClick={() => resolveConflict(viewConflict)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Mark Resolved</button></div>
          </div>
        )}
      </Modal>
      <ConfirmDeleteModal open={!!deleteConflictItem} name={deleteConflictItem?.resource ?? ""} onConfirm={() => { if (!deleteConflictItem) return; removeConflict(deleteConflictItem.id); showToast("Conflict record removed"); setDeleteConflictItem(null); }} onClose={() => setDeleteConflictItem(null)} />

      {/* ── Exception handle ── */}
      <Modal open={!!viewException} title="Handle Exception" onClose={() => setViewException(null)}>
        {viewException && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3"><div className="font-semibold text-amber-800">{viewException.type}: {viewException.entity}</div><div className="text-xs text-amber-700 mt-1">{viewException.reason}</div><div className="text-xs text-[var(--text-muted)] mt-1">{viewException.route} · {viewException.time}</div></div>
            <InputRow label="Resolution Note" required={false}>
              <textarea rows={3} value={exceptionNote} onChange={e => setExceptionNote(e.target.value)} placeholder="Describe how this was resolved…" className={`${inputCls} resize-none`} />
            </InputRow>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setViewException(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button><button type="button" onClick={() => resolveException(viewException, exceptionNote)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Resolve Exception</button></div>
          </div>
        )}
      </Modal>
      <ConfirmDeleteModal open={!!deleteExceptionItem} name={`${deleteExceptionItem?.type}: ${deleteExceptionItem?.entity}`} onConfirm={() => { if (!deleteExceptionItem) return; removeException(deleteExceptionItem.id); showToast("Exception record removed"); setDeleteExceptionItem(null); }} onClose={() => setDeleteExceptionItem(null)} />

    </AppShell>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[var(--text-muted)]">Loading admin dashboard…</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
