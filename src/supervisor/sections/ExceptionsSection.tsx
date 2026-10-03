"use client";

import { Wrench } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/shell";
import type { OperationalException } from "@/lib/mock-data";

interface Props {
  exceptions: OperationalException[];
  setSelectedException: (exception: OperationalException | null) => void;
}

export function ExceptionsSection({ exceptions, setSelectedException }: Props) {
  const open = exceptions.filter((e) => e.status !== "Resolved");
  const resolved = exceptions.filter((e) => e.status === "Resolved");

  return (
    <div className="space-y-6">
      <PageHeader title="Exceptions & Operational Issues" subtitle="Track and resolve operational exceptions and disruptions" />

      {open.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">Open Exceptions ({open.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {open.map((ex) => (
              <div key={ex.id} className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-amber-600" />
                    <span className="font-bold text-amber-900 dark:text-amber-200">{ex.type}: {ex.entity}</span>
                  </div>
                  <StatusBadge status={ex.status} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{ex.reason}</p>
                <div className="flex items-center justify-between border-t border-amber-200 pt-2">
                  <span className="text-[11px] text-[var(--text-muted)]">{ex.route} · {ex.time}</span>
                  <button type="button" onClick={() => setSelectedException(ex)} className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700">Handle Exception</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-3">Resolved Exceptions ({resolved.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {resolved.map((ex) => (
              <div key={ex.id} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[var(--text-primary)]">{ex.type}: {ex.entity}</span>
                  <StatusBadge status={ex.status} />
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-1">{ex.route} · {ex.time}</p>
                {ex.resolutionNote && <p className="text-xs text-emerald-600">{ex.resolutionNote}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
