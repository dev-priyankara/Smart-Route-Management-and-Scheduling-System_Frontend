"use client";

import Link from "next/link";
import { ComponentType } from "react";

export interface QuickActionCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
  href: string;
  className?: string;
}

export function QuickActionCard({ title, icon: Icon, description, href, className = "" }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 text-left shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-lg ${className}`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-base font-semibold text-[var(--text-primary)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--text-muted)]">{description}</div>
    </Link>
  );
}