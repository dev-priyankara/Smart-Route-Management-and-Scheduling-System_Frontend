"use client";

import { useState } from "react";
import { Trash2, Wrench } from "lucide-react";
import { Modal, PageHeader, StatusBadge } from "@/components/shell";
import { OperationalException, supervisorExceptionsData } from "@/lib/mock-data";
import { usePersistentCollection } from "@/lib/use-persistent-collection";

export default function ExceptionsPage() {
  const { records: exceptions, updateRecord: updateException, removeRecord: removeException } =
    usePersistentCollection("srmss-exceptions", supervisorExceptionsData);
  const [viewException, setViewException] = useState<OperationalException | null>(null);
  const [note, setNote] = useState("");

  const resolve = (ex: OperationalException, resolutionNote: string) => {
    const { id, ...rest } = ex;
    updateException(id, { ...rest, status: "Resolved", resolutionNote: resolutionNote || "Resolved by admin" });
    setViewException(null);
  };

  const open = exceptions.filter(e => e.status !== "Resolved");
  const resolved = exceptions.filter(e => e.status === "Resolved");

  return (
    <div className="space-y-6">
      <PageHeader title="Exceptions &amp; Operational Issues" subtitle="Track and resolve operational exceptions" />

      {open.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-600">Open ({open.length})</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {open.map(ex => (
              <div key={ex.id} className="flex flex-col justify-between rounded-2xl border border-amber-300 bg-amber-50/60 dark:border-amber-400/30 dark:bg-amber-500/10 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-amber-600" /><span className="font-bold text-amber-900 dark:text-amber-200">{ex.type}: {ex.entity}</span></div>
                  <StatusBadge status={ex.status} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{ex.reason}</p>
                <div className="flex items-center justify-between border-t border-amber-200 pt-2">
                  <span className="text-[11px] text-[var(--text-muted)]">{ex.route} · {ex.time}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setNote(""); setViewException(ex); }} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--soft)]">Handle</button>
                    <button type="button" onClick={() => removeException(ex.id)} className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">Delete</button>
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
            {resolved.map(ex => (
              <div key={ex.id} className="flex items-start justify-between rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{ex.type}: {ex.entity}</div>
                  <p className="text-xs text-[var(--text-muted)]">{ex.route} · {ex.time}</p>
                  {ex.resolutionNote && <p className="text-xs text-emerald-600 mt-1">{ex.resolutionNote}</p>}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 whitespace-nowrap">Resolved</span>
                  <button type="button" onClick={() => removeException(ex.id)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-xs text-rose-600 hover:bg-rose-100"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!viewException} title="Handle Exception" onClose={() => setViewException(null)}>
        {viewException && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
              <div className="font-semibold text-amber-800">{viewException.type}: {viewException.entity}</div>
              <div className="text-xs text-amber-700 mt-1">{viewException.reason}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{viewException.route} · {viewException.time}</div>
            </div>
            <label className="block text-sm text-[var(--text-secondary)]">
              <span className="mb-1.5 block font-medium text-[var(--text-primary)]">Resolution Note</span>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Describe how this was resolved…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] resize-none" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setViewException(null)} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--soft)]">Cancel</button>
              <button type="button" onClick={() => resolve(viewException, note)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Resolve Exception</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
