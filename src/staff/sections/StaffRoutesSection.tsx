"use client";

import { Eye } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, TableCard } from "@/components/shell";
import type { DepotRoute } from "@/lib/mock-data";

interface Props {
  routes: DepotRoute[];
  setViewingRoute: (route: DepotRoute | null) => void;
}

export function StaffRoutesSection({ routes, setViewingRoute }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="View Route Details" subtitle="Review all managed service corridors and their assigned resources" />
      <SectionCard title="Route Directory">
        <TableCard
          headers={["Route Name", "Start Point", "Destination", "Intermediate Stops", "Distance", "Service Type", "Status", "Action"]}
          rows={routes.map((route) => (
            <>
              <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{route.name}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{route.start}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{route.end}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{route.stops.join(", ") || "—"}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{route.distance} km</td>
              <td className="px-4 py-3"><StatusBadge status={route.serviceType} /></td>
              <td className="px-4 py-3"><StatusBadge status={route.status} /></td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => setViewingRoute(route)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--panel)]">
                  <Eye className="h-3.5 w-3.5" /> View Details
                </button>
              </td>
            </>
          ))}
        />
      </SectionCard>
    </div>
  );
}
