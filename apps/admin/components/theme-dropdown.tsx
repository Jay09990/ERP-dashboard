"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { useUiStore } from "@/stores/ui-store";

const themes = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export function ThemeDropdown() {
  const themePreference = useUiStore((state) => state.themePreference);
  const setThemePreference = useUiStore((state) => state.setThemePreference);
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme =
    themes.find((t) => t.value === themePreference) || themes[2];
  const CurrentIcon = currentTheme.icon;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        className="altrex-icon-button"
        aria-label={`Theme preference, currently ${themePreference}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`Theme: ${themePreference}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CurrentIcon size={20} />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="fixed inset-0 z-10 cursor-default border-none bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="menu"
            aria-label="Theme selection"
            className="absolute right-0 top-full z-20 mt-2 min-w-[140px] rounded-lg border border-[var(--altrex-border)] bg-[var(--altrex-surface)] p-1 shadow-lg"
          >
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isSelected = theme.value === themePreference;
              return (
                <button
                  key={theme.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--altrex-hover)] focus-visible:bg-[var(--altrex-hover)] focus-visible:outline-none"
                  onClick={() => {
                    setThemePreference(theme.value);
                    setIsOpen(false);
                  }}
                >
                  <Icon size={16} />
                  <span>{theme.label}</span>
                  {isSelected && <span className="ml-auto text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
