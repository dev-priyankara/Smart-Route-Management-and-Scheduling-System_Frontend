"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PencilLine, Plus, Trash2, Eye, Route as RouteIcon } from "lucide-react";
import { AppShell, FilterButton, MapCard, PageHeader, PrimaryButton, SearchField, SecondaryButton, StatusBadge, TableCard, ConfirmationModal } from "@/components/shell";
import { routeData } from "@/lib/mock-data";

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const filteredRoutes = useMemo(() => {
    return routeData.filter((route) => {
      const matchesSearch = `${route.name} ${route.start} ${route.end}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = selectedStatus === "All" || route.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [search, selectedStatus]);

  const previewRoute = filteredRoutes[0] ?? routeData[0];

  return (
    <AppShell title="Route Planning" subtitle="Create, modify and manage routes.">
      <PageHeader
        title="Routes"
        subtitle="Operational route overview"
        action={
          <Link href="/routes/planning">
            <PrimaryButton>
              <Plus className="mr-2 h-4 w-4" /> Add Route
            </PrimaryButton>
          </Link>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-lg">
          <SearchField value={search} onChange={setSearch} placeholder="Search routes" />
        </div>
        <div className="flex items-center gap-3">
          <FilterButton label="Filter" />
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Delayed">Delayed</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)]">
            <MapCard routeName={previewRoute.name} start={previewRoute.start} end={previewRoute.end} stops={previewRoute.stops} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow-soft)]">
            <TableCard
              headers={["Route", "Start", "Destination", "Stops", "Distance", "Service Type", "Bus", "Driver", "Status", "Actions"]}
              rows={filteredRoutes.map((route) => (
                <>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{route.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.start}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.end}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.stops.length}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{route.distance} km</td>
                  <td className="px-4 py-3"><StatusBadge status={route.serviceType} /></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">NP-2201</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">S. Perera</td>
                  <td className="px-4 py-3"><StatusBadge status={route.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link href="/routes/planning" className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--soft)]" title="Edit">
                        <PencilLine className="h-4 w-4" />
                      </Link>
                      <button type="button" className="rounded-lg border border-[var(--border)] p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete" onClick={() => setPendingDelete(route.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </>
              ))}
              emptyTitle="No routes found"
              emptyDescription="Try adjusting your route search or filters."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Route Overview</h3>
                <p className="text-sm text-[var(--text-muted)]">Service coverage</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Longest route</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Colombo - Kandy</div>
                <div className="mt-1 text-sm text-[var(--text-muted)]">142 km · Express</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Coverage</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">5 corridors</div>
                <div className="mt-1 text-sm text-[var(--text-muted)]">Urban, coastal and rural service range</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={pendingDelete !== null}
        title="Delete route"
        message="This action removes the selected route from the front-end mock dataset. Do you want to continue?"
        onConfirm={() => {
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </AppShell>
  );
}
