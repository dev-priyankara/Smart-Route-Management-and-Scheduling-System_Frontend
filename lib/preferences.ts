export type ThemePresetName =
  | "Ocean Blue"
  | "Navy Professional"
  | "Slate Blue"
  | "Royal Blue"
  | "Midnight"
  | "Light Corporate";

export type ThemePreset = {
  name: ThemePresetName;
  accent: string;
  accentDark: string;
  description: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  { name: "Ocean Blue", accent: "#146cfa", accentDark: "#0d4ec9", description: "Clean dynamic azure blue theme" },
  { name: "Navy Professional", accent: "#0f172a", accentDark: "#020617", description: "Deep navy corporate look" },
  { name: "Slate Blue", accent: "#3b82f6", accentDark: "#1d4ed8", description: "Modern sleek slate blue" },
  { name: "Royal Blue", accent: "#2563eb", accentDark: "#1e40af", description: "Vibrant royal transport theme" },
  { name: "Midnight", accent: "#6366f1", accentDark: "#4338ca", description: "Indigo dark contrast theme" },
  { name: "Light Corporate", accent: "#0284c7", accentDark: "#0369a1", description: "Bright corporate cyan blue" },
];

export type DashboardPreferences = {
  accent: string;
  themePreset: ThemePresetName;
  sidebarCollapsed: boolean;
  compactTables: boolean;
  dashboardWidgets: {
    trips: boolean;
    liveStatus: boolean;
    quickActions: boolean;
  };
  notifications: {
    routeDelays: boolean;
    maintenance: boolean;
    fuelThreshold: boolean;
  };
};

export const defaultPreferences: DashboardPreferences = {
  accent: "#146cfa",
  themePreset: "Ocean Blue",
  sidebarCollapsed: false,
  compactTables: false,
  dashboardWidgets: { trips: true, liveStatus: true, quickActions: true },
  notifications: { routeDelays: true, maintenance: true, fuelThreshold: false },
};

export function readPreferences(): DashboardPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const saved = window.localStorage.getItem("srmss-preferences");
    if (!saved) return defaultPreferences;
    const parsed = JSON.parse(saved) as Partial<DashboardPreferences>;
    return {
      ...defaultPreferences,
      ...parsed,
      dashboardWidgets: { ...defaultPreferences.dashboardWidgets, ...parsed?.dashboardWidgets },
      notifications: { ...defaultPreferences.notifications, ...parsed?.notifications },
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: DashboardPreferences) {
  window.localStorage.setItem("srmss-preferences", JSON.stringify(preferences));
  window.dispatchEvent(new Event("srmss-preferences-changed"));
}

export function applyThemePreset(presetName: ThemePresetName) {
  const preset = THEME_PRESETS.find((p) => p.name === presetName) ?? THEME_PRESETS[0];
  document.documentElement.style.setProperty("--accent", preset.accent);
  document.documentElement.style.setProperty("--accent-dark", preset.accentDark);
  // accent-soft uses a hex with alpha — compute from accent
  document.documentElement.style.setProperty("--accent-soft", preset.accent + "1f");

  // Update sidebar background and other theme-aware variables for consistency
  const isDark = document.documentElement.classList.contains("dark");
  if (presetName === "Navy Professional" || presetName === "Midnight") {
    document.documentElement.style.setProperty("--sidebar-bg", isDark ? "#0f172a" : "#1e293b");
  } else {
    document.documentElement.style.setProperty("--sidebar-bg", isDark ? "#1e293b" : "#f8fafc");
  }

  // Persist the preference
  const prefs = readPreferences();
  prefs.themePreset = presetName;
  prefs.accent = preset.accent;
  savePreferences(prefs);
}

