"use client";

import { ReactNode } from "react";

export interface TableCardProps {
  headers: string[];
  rows: ReactNode[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function TableCard({ headers, rows, emptyTitle, emptyDescription, className = "" }: TableCardProps) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--soft)] px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--panel)] text-[var(--accent)] shadow-sm">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{emptyTitle ?? "No records found"}</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{emptyDescription ?? "There are currently no matching records to display."}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] ${className}`}>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--soft)] text-[var(--text-muted)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
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