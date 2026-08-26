"use client";

import { type ReactNode, useEffect } from "react";

import { useUiStore } from "@/stores/ui-store";

const storageKey = "altrex-erp-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useUiStore((state) => state.themePreference);
  const setPreference = useUiStore((state) => state.setThemePreference);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "system" || stored === "light" || stored === "dark")
      setPreference(stored);
  }, [setPreference]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const theme =
        preference === "system"
          ? media.matches
            ? "dark"
            : "light"
          : preference;
      document.documentElement.dataset.theme = theme;
    };
    applyTheme();
    if (preference !== "system") return;
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [preference]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, preference);
  }, [preference]);

  return children;
}
