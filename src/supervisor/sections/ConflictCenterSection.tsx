"use client";

import { AlertTriangle } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/shell";
import type { ScheduleConflict } from "@/lib/mock-data";

interface Props {
  conflicts: ScheduleConflict[];
  setSelectedConflict: (conflict: ScheduleConflict | null) => void;
}

export function ConflictCenterSection({ conflicts, setSelectedConflict }: Props) {
  const unresolved = conflicts.filter((c) => c.status === "Unresolved");
  const resolved = conflicts.filter((c) => c.status === "Resolved");

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule Conflict Center" subtitle="Review and resolve scheduling conflicts across the depot network" />

      {unresolved.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 mb-3">Unresolved Conflicts ({unresolved.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {unresolved.map((c) => (
              <div key={c.id} className="rounded-2xl border border-rose-300 bg-rose-50/60 p-4 dark:border-rose-400/30 dark:bg-rose-500/10">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                    <span className="font-bold text-rose-900 dark:text-rose-200">{c.resource}</span>
                  </div>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">{c.severity}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{c.reason}</p>
                <div className="flex items-center justify-between border-t border-rose-200 pt-2">
                  <span className="text-[11px] text-[var(--text-muted)]">{c.route} · {c.time}</span>
                  <button type="button" onClick={() => setSelectedConflict(c)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Resolve Conflict</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-3">Resolved Conflicts ({resolved.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {resolved.map((c) => (
              <div key={c.id} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[var(--text-primary)]">{c.resource}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-[var(--text-muted)]">{c.route} · {c.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflicts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] py-16 text-center">
          <p className="text-[var(--text-muted)]">No schedule conflicts recorded.</p>
        </div>
      )}
    </div>
  );
}
