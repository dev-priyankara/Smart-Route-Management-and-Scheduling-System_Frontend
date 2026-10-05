"use client";

import { Settings } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shell";

type Props = {
  currentThemePreset: string;
  handleThemeChange: (presetName: string) => void;
};

export function AdminSettingsSection({ currentThemePreset, handleThemeChange }: Props) {
  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle="System configuration" />
      <SectionCard title="No Active Settings" subtitle="All system configurations have been removed">
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--soft)] py-12 text-center">
          <Settings className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-sm text-[var(--text-muted)]">No settings are currently available.</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Configuration options will be added in a future update.</p>
        </div>
      </SectionCard>
    </div>
  );
}
