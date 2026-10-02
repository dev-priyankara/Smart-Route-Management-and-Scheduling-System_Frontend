"use client";

import { Bell, MoonStar, SlidersHorizontal } from "lucide-react";
import { AppShell, PageHeader } from "@/components/shell";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppShell title="Settings" subtitle="System preferences and operational display settings.">
      <PageHeader title="Settings" subtitle="Maintain the user interface and operational preferences" />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><MoonStar className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Appearance</h3>
              <p className="text-sm text-[var(--text-muted)]">Theme and interface appearance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <div>
                <div className="font-medium text-[var(--text-primary)]">Light / Dark mode</div>
                <div className="text-sm text-[var(--text-muted)]">Current mode: {theme === "light" ? "Light" : "Dark"}</div>
              </div>
              <button type="button" onClick={toggleTheme} className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-dark)]">Toggle</button>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3">
              <div>
                <div className="font-medium text-[var(--text-primary)]">Sidebar preference</div>
                <div className="text-sm text-[var(--text-muted)]">Desktop collapse support enabled</div>
              </div>
              <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)]">Default</button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Bell className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Notifications</h3>
              <p className="text-sm text-[var(--text-muted)]">Operational notifications preferences</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[var(--text-secondary)]">
            <label className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3"><span>Route delays</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" /></label>
            <label className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3"><span>Maintenance reminders</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" /></label>
            <label className="flex items-center justify-between rounded-xl bg-[var(--soft)] px-3 py-3"><span>Fuel threshold alerts</span><input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" /></label>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)] xl:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><SlidersHorizontal className="h-5 w-5" /></div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Profile display</h3>
              <p className="text-sm text-[var(--text-muted)]">Preferred depot interface presentation</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="font-medium text-[var(--text-primary)]">Home layout</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Operations dashboard</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="font-medium text-[var(--text-primary)]">Default map zoom</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Regional overview</div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft)] p-4">
              <div className="font-medium text-[var(--text-primary)]">Security</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">Role-based access ready</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
