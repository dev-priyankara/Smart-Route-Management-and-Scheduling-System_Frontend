"use client";

import { ComponentType } from "react";

export interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "blue" | "green" | "amber" | "red" | "violet" | "indigo";
  onClick?: () => void;
}

const accentClasses = {
  blue: "bg-[var(--accent-soft)] text-[var(--accent)]",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
};

export function MetricCard({ label, value, change, icon: Icon, accent = "blue", onClick }: MetricCardProps) {
  const content = (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]" title={label}>
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{value}</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] pt-2 text-xs">
        <span className="shrink-0 font-medium text-[var(--text-muted)]">Status</span>
        <span className="truncate text-right font-medium text-[var(--accent)]" title={change}>
          {change}
        </span>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer transition hover:scale-[1.02]" role="button" tabIndex={0}>
        {content}
      </div>
    );
  }

  return content;
}