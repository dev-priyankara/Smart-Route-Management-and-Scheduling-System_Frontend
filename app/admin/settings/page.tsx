"use client";

import { useRouter } from "next/navigation";
import { History, UserCog, Users } from "lucide-react";
import { PageHeader } from "@/components/shell";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings &amp; Administration" subtitle="Access admin tools and register new users" />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <button type="button" onClick={() => router.push("/admin/register")}
          className="group flex flex-col gap-4 rounded-2xl border-2 border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)] p-6 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-sm group-hover:scale-105 transition">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <div className="text-base font-bold text-[var(--text-primary)]">Register New User</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">Create a new staff account — supervisor, clerk or admin</div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white w-fit">
            Open Register Page →
          </span>
        </button>

        <button type="button" onClick={() => router.push("/admin/profile")}
          className="group flex flex-col gap-4 rounded-2xl border-2 border-dashed border-violet-400/40 bg-violet-50/60 dark:bg-violet-500/10 p-6 text-left transition hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm group-hover:scale-105 transition">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-base font-bold text-[var(--text-primary)]">My Profile</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">View and update your admin profile details</div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white w-fit">
            Open Profile →
          </span>
        </button>
      </div>
    </div>
  );
}
