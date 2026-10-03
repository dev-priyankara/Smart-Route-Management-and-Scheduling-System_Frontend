export type DashboardPreferences = {
  accent: "#146cfa" | "#00866a" | "#d05a28" | "#a63f57";
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
      dashboardWidgets: { ...defaultPreferences.dashboardWidgets, ...parsed.dashboardWidgets },
      notifications: { ...defaultPreferences.notifications, ...parsed.notifications },
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: DashboardPreferences) {
  window.localStorage.setItem("srmss-preferences", JSON.stringify(preferences));
  window.dispatchEvent(new Event("srmss-preferences-changed"));
}
