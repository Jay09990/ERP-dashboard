"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentTheme =
    themes.find((t) => t.value === themePreference) || themes[2];
  const CurrentIcon = currentTheme.icon;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="altrex-icon-button"
        aria-label={`Theme: ${themePreference}`}
        title={`Theme: ${themePreference}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CurrentIcon size={20} />
      </button>

      {isOpen && (
        <>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop overlay for click-to-dismiss */}
          <div
            className="fixed inset-0 z-10"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="menu"
            aria-label="Select theme"
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
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--altrex-hover)]"
                  onClick={() => {
                    setThemePreference(theme.value);
                    setIsOpen(false);
                  }}
                >
                  <Icon size={16} />
                  <span>{theme.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-xs" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
