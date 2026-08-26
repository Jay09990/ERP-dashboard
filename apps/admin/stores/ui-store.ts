import { create } from "zustand";

export type ThemePreference = "system" | "light" | "dark";

type UiState = {
  sidebarCollapsed: boolean;
  themePreference: ThemePreference;
  toggleSidebar: () => void;
  cycleTheme: () => void;
  setThemePreference: (preference: ThemePreference) => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  themePreference: "system",
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  cycleTheme: () =>
    set((state) => ({
      themePreference:
        state.themePreference === "system"
          ? "light"
          : state.themePreference === "light"
            ? "dark"
            : "system",
    })),
  setThemePreference: (themePreference) => set({ themePreference }),
}));
