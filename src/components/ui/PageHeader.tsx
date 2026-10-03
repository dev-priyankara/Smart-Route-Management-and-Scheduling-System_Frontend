"use client";

import { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}>
      <div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}