"use client";

import { Eye, Search, Settings } from "lucide-react";
import { PageHeader, SectionCard, TableCard } from "@/components/shell";
import { useMemo, useState } from "react";
import type { AdminSectionProps } from "../types";

type Props = Pick<AdminSectionProps, "mockDepots" | "showToast">;

export function DepotManagementSection({ mockDepots, showToast }: Props) {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");

  // Dynamic city list from depot locations
  const depotCities = useMemo(() => {
    const cities = new Set<string>();
    mockDepots.forEach((d) => {
      // Extract city from location (last part after comma)
      const parts = d.location.split(",").map((p) => p.trim());
      if (parts.length > 0) cities.add(parts[parts.length - 1]);
    });
    return Array.from(cities).sort();
  }, [mockDepots]);

  const filteredDepots = mockDepots.filter((d) => {
    const matchesSearch = `${d.name} ${d.location} ${d.manager}`.toLowerCase().includes(search.toLowerCase());
    const city = d.location.split(",").map((p) => p.trim()).pop();
    const matchesCity = cityFilter === "all" || city === cityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && d.status === "Active") ||
      (statusFilter === "closed" && d.status === "Closed");
    return matchesSearch && matchesCity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Depot Management"
        subtitle="Manage depot locations, assign managers, and monitor depot performance"
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
          <div className="text-3xl font-bold text-emerald-600">{mockDepots.filter((d) => d.status === "Active").length}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Operational depots</div>
        </div>
      </div>

      <SectionCard title="Depot Directory">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search depot, location, manager..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] pl-10 pr-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
          </div>
          <div className="min-w-[160px]">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              <option value="all">All Cities</option>
              {depotCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "closed")}
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
          rows={filteredDepots.map((depot) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{depot.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{depot.location}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{depot.manager}</td>
              <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{depot.buses}</td>
              <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{depot.staff}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${depot.status === "Active" ? "bg-emerald-100 text-emerald-700" : depot.status === "Maintenance" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                  {depot.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => showToast(`Viewing: ${depot.name}`)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </button>
                  <button type="button" onClick={() => showToast(`Managing depot: ${depot.name}`)} className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--panel)]">
                    <Settings className="h-3.5 w-3.5 mr-1" /> Manage
                  </button>
                </div>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
