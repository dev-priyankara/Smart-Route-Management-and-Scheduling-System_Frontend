"use client";

import { useEffect, useState } from "react";
import { Bell, Check, LayoutDashboard, MoonStar, RotateCcw, SlidersHorizontal } from "lucide-react";
import { AppShell, PageHeader, PrimaryButton, SecondaryButton } from "@/components/shell";
import { useTheme } from "@/components/theme-provider";
import { DashboardPreferences, defaultPreferences, readPreferences, savePreferences } from "@/lib/preferences";

const accents: { name: string; value: DashboardPreferences["accent"] }[] = [
  { name: "Ocean blue", value: "#146cfa" },
  { name: "Teal", value: "#00866a" },
  { name: "Terracotta", value: "#d05a28" },
  { name: "Berry", value: "#a63f57" },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => setPreferences(readPreferences()), []);

  const updatePreference = (update: (current: DashboardPreferences) => DashboardPreferences) => {
    setPreferences(update);
    setSaved(false);
  };

  const applyPreferences = () => {
    savePreferences(preferences);
    setSaved(true);
  };

  return (
    <AppShell title="Settings" subtitle="System preferences and operational display settings.">
      <PageHeader
        title="Settings"
        subtitle="Configure the workspace used by depot administrators"
        action={<div className="flex items-center gap-2">{saved && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check className="h-4 w-4" /> Saved</span>}<SecondaryButton onClick={() => { setPreferences(defaultPreferences); savePreferences(defaultPreferences); setSaved(true); }}><RotateCcw className="mr-2 h-4 w-4" /> Reset</SecondaryButton><PrimaryButton onClick={applyPreferences}>Apply settings</PrimaryButton></div>}
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="border-b border-[var(--border)] pb-7 xl:border-b-0 xl:border-r xl:pr-8">
          <div className="mb-5 flex items-center gap-3"><MoonStar className="h-5 w-5 text-[var(--accent)]" /><div><h3 className="font-semibold text-[var(--text-primary)]">Appearance</h3><p className="text-sm text-[var(--text-muted)]">Theme and workspace color</p></div></div>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4"><div><div className="font-medium text-[var(--text-primary)]">Color mode</div><div className="text-sm text-[var(--text-muted)]">Currently {theme} mode</div></div><button type="button" onClick={toggleTheme} aria-label="Toggle color theme" className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 text-[var(--text-primary)]"><MoonStar className="h-4 w-4" /></button></div>
            <fieldset><legend className="mb-3 text-sm font-medium text-[var(--text-primary)]">Accent color</legend><div className="flex flex-wrap gap-3">{accents.map((accent) => <button key={accent.value} type="button" onClick={() => updatePreference((current) => ({ ...current, accent: accent.value }))} aria-label={accent.name} aria-pressed={preferences.accent === accent.value} title={accent.name} className={`h-9 w-9 rounded-full border-2 ${preferences.accent === accent.value ? "border-[var(--text-primary)] ring-2 ring-[var(--border)]" : "border-transparent"}`} style={{ backgroundColor: accent.value }} />)}</div></fieldset>
          </div>
        </section>

        <section className="border-b border-[var(--border)] pb-7 xl:border-b-0">
          <div className="mb-5 flex items-center gap-3"><SlidersHorizontal className="h-5 w-5 text-[var(--accent)]" /><div><h3 className="font-semibold text-[var(--text-primary)]">Workspace layout</h3><p className="text-sm text-[var(--text-muted)]">Tune the operations interface</p></div></div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 text-sm"><span><span className="block font-medium text-[var(--text-primary)]">Start with collapsed sidebar</span><span className="text-[var(--text-muted)]">Use a compact navigation rail</span></span><input type="checkbox" checked={preferences.sidebarCollapsed} onChange={(event) => updatePreference((current) => ({ ...current, sidebarCollapsed: event.target.checked }))} className="h-4 w-4 accent-[var(--accent)]" /></label>
            <label className="flex items-center justify-between gap-4 py-3 text-sm"><span><span className="block font-medium text-[var(--text-primary)]">Compact tables</span><span className="text-[var(--text-muted)]">Show more rows at once</span></span><input type="checkbox" checked={preferences.compactTables} onChange={(event) => updatePreference((current) => ({ ...current, compactTables: event.target.checked }))} className="h-4 w-4 accent-[var(--accent)]" /></label>
          </div>
        </section>

        <section className="border-b border-[var(--border)] pb-7">
          <div className="mb-5 flex items-center gap-3"><LayoutDashboard className="h-5 w-5 text-[var(--accent)]" /><div><h3 className="font-semibold text-[var(--text-primary)]">Dashboard modules</h3><p className="text-sm text-[var(--text-muted)]">Choose which panels appear on the dashboard</p></div></div>
          <div className="space-y-3 text-sm">
            {([{ key: "trips", label: "Today's trips" }, { key: "liveStatus", label: "Live trip status" }, { key: "quickActions", label: "Quick actions" }] as const).map(({ key, label }) => <label key={key} className="flex items-center justify-between border-b border-[var(--border)] py-3 text-[var(--text-primary)]">{label}<input type="checkbox" checked={preferences.dashboardWidgets[key]} onChange={(event) => updatePreference((current) => ({ ...current, dashboardWidgets: { ...current.dashboardWidgets, [key]: event.target.checked } }))} className="h-4 w-4 accent-[var(--accent)]" /></label>)}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center gap-3"><Bell className="h-5 w-5 text-[var(--accent)]" /><div><h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3><p className="text-sm text-[var(--text-muted)]">Operational alert preferences</p></div></div>
          <div className="space-y-3 text-sm">
            {([{ key: "routeDelays", label: "Route delays" }, { key: "maintenance", label: "Maintenance reminders" }, { key: "fuelThreshold", label: "Fuel threshold alerts" }] as const).map(({ key, label }) => <label key={key} className="flex items-center justify-between border-b border-[var(--border)] py-3 text-[var(--text-primary)]">{label}<input type="checkbox" checked={preferences.notifications[key]} onChange={(event) => updatePreference((current) => ({ ...current, notifications: { ...current.notifications, [key]: event.target.checked } }))} className="h-4 w-4 accent-[var(--accent)]" /></label>)}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
