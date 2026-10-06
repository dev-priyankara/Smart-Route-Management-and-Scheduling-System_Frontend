"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal, PageHeader, StatusBadge } from "@/components/shell";
import { ScheduleConflict, supervisorConflictsData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

export default function ConflictsPage() {
  const { records: conflicts, updateRecord: updateConflict, removeRecord: removeConflict } =
    usePersistentCollection("srmss-conflicts", supervisorConflictsData);
  const [viewConflict, setViewConflict] = useState<ScheduleConflict | null>(null);

  const resolve = (c: ScheduleConflict) => {
    const { id, ...rest } = c;
    updateConflict(id, { ...rest, status: "Resolved" });
    setViewConflict(null);
  };

  const unresolved = conflicts.filter(c => c.status === "Unresolved");
  const resolved = conflicts.filter(c => c.status === "Resolved");

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule Conflict Center" subtitle="Review and resolve scheduling conflicts" />

      {unresolved.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-rose-600">Unresolved ({unresolved.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {unresolved.map(c => (
              <div key={c.id} className="flex flex-col justify-between rounded-2xl border border-rose-300 bg-rose-50/60 dark:border-rose-400/30 dark:bg-rose-500/10 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-600" /><span className="font-bold text-rose-900 dark:text-rose-200">{c.resource}</span></div>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">{c.severity}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{c.reason}</p>
                <div className="flex items-center justify-between border-t border-rose-200 pt-2">
                  <span className="text-[11px] text-[var(--text-muted)]">{c.route} · {c.time}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewConflict(c)} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Details</button>
                    <button type="button" onClick={() => resolve(c)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Resolve</button>
                    <button type="button" onClick={() => removeConflict(c.id)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-600">Resolved ({resolved.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {resolved.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div><div className="font-medium text-[var(--text-primary)]">{c.resource}</div><p className="text-xs text-[var(--text-muted)]">{c.route} · {c.time}</p></div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Resolved</span>
                  <button type="button" onClick={() => removeConflict(c.id)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs text-rose-600 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conflicts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] py-16 text-center">
          <p className="text-[var(--text-muted)]">No conflicts recorded.</p>
        </div>
      )}

      <Modal open={!!viewConflict} title="Conflict Details" onClose={() => setViewConflict(null)}>
        {viewConflict && (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
              <div className="font-semibold text-rose-800">{viewConflict.resource}</div>
              <div className="text-xs text-rose-700 mt-1">{viewConflict.reason}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{viewConflict.route} · {viewConflict.time}</div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setViewConflict(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Close</button>
              <button type="button" onClick={() => resolve(viewConflict)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Mark Resolved</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
