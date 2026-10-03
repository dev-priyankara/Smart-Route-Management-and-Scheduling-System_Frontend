"use client";

import { PageHeader, SectionCard } from "@/components/shell";

export function AdminSettingsSection() {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle="Configure system preferences and security settings" />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="General Settings" subtitle="System configuration options">
          <div className="space-y-4">
            {[
              { label: "System Name", value: "Smart Route Management and Scheduling System" },
              { label: "Version", value: "v1.0.0 (Production)" },
              { label: "Timezone", value: "Asia/Colombo (UTC+5:30)" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">{label}</div>
                <div className="text-sm text-[var(--text-secondary)]">{value}</div>
              </div>
            ))}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Maintenance Mode</div>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">Disabled</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security Settings" subtitle="Access control and security configuration">
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Two-Factor Authentication</div>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700">Optional</span>
            </div>
            {[
              { label: "Session Timeout", value: "24 hours" },
              { label: "Password Policy", value: "Minimum 8 characters, mixed case required" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">{label}</div>
                <div className="text-sm text-[var(--text-secondary)]">{value}</div>
              </div>
            ))}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">Data Encryption</div>
              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">AES-256 Enabled</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
