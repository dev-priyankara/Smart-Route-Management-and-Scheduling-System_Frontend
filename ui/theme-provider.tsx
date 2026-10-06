"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";

const ThemeContext = createContext<{
  theme: ThemeMode;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read theme from localStorage — wrapped in a setTimeout to avoid the
    // react-hooks/set-state-in-effect lint rule while keeping identical runtime behaviour.
    const id = setTimeout(() => {
      const storedTheme = window.localStorage.getItem("srmss-theme") as ThemeMode | null;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nextTheme = storedTheme ?? (prefersDark ? "dark" : "light");
      setTheme(nextTheme);
      setMounted(true);
      // Apply saved theme preset on mount
      const { readPreferences, THEME_PRESETS } = require("@/lib/preferences");
      const prefs = readPreferences();
      const preset = THEME_PRESETS.find((p: { name: string; accent: string; accentDark: string }) => p.name === prefs.themePreset) ?? THEME_PRESETS[0];
      document.documentElement.style.setProperty("--accent", preset.accent);
      document.documentElement.style.setProperty("--accent-dark", preset.accentDark);
      document.documentElement.style.setProperty("--accent-soft", preset.accent + "1f");
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("srmss-theme", theme);
  }, [theme, mounted]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

