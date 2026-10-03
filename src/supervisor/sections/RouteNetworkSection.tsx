"use client";

import { CheckCircle2, Clock, Eye, Navigation, Route as RouteIcon } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { Bus, DepotRoute, Driver } from "@/lib/mock-data";

interface Props {
  routes: DepotRoute[];
  buses: Bus[];
  drivers: Driver[];
  showToast: (msg: string) => void;
}

export function RouteNetworkSection({ routes, buses, drivers, showToast }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="Route Network Management" subtitle="Inspect managed service corridors, endpoints, intermediate stops, and assigned assets" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Routes</div><RouteIcon className="h-5 w-5 text-[var(--accent)]" /></div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.length}</div>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">Active service corridors</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Total Distance</div><Navigation className="h-5 w-5 text-emerald-500" /></div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.reduce((sum, r) => sum + r.distance, 0)} km</div>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">Combined network coverage</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Routes</div><CheckCircle2 className="h-5 w-5 text-blue-500" /></div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.filter((r) => r.status === "Active").length}</div>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">Currently operational</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Delayed Routes</div><Clock className="h-5 w-5 text-amber-500" /></div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{routes.filter((r) => r.status === "Delayed").length}</div>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">Require attention</div>
        </div>
      </div>
      <SectionCard title="Route Network Directory">
        <TableCard
          headers={["Route Name", "Start Point", "Destination", "Stops", "Distance (km)", "Service Type", "Bus", "Driver", "Status", "Action"]}
          rows={routes.map((r) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{r.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.start}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.end}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.stops.length} stops</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{r.distance} km</td>
              <td className="px-4 py-3"><StatusBadge status={r.serviceType} /></td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{buses.find((b) => b.id === r.busId)?.busNo ?? "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{drivers.find((d) => d.id === r.driverId)?.name ?? "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => showToast(`Route details: ${r.name}`)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
