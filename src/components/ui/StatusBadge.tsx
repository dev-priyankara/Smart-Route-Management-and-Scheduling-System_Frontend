"use client";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  "On Time": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "Delayed": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Completed": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Scheduled": "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  "Active": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Available": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "On Duty": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "Off Duty": "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  "Planned": "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  "Under Maintenance": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Out of Service": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "In Service": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "Overdue": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "Routine Maintenance": "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  "Corrective Maintenance": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Normal": "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
  "Express": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Rural Service": "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  "Supervisor": "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "Operational Staff": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Open": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "Resolved": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Unresolved": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "Warning": "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "Critical": "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
        ${statusStyles[status] ?? "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300"}
        ${className}
      `}
    >
      {status}
    </span>
  );
}