"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applyTheme,
  getThemeServerSnapshot,
  getThemeSnapshot,
  setThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "النظام", icon: Monitor },
];

export function ThemeSwitcher() {
  // The saved preference is not readable on the server, so it is read through
  // an external store: "system" until the client has it. The inline head script
  // has already applied the right theme by then, so nothing flashes.
  const preference = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  // While following the system, track changes to it for as long as that holds.
  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  return (
    <div
      role="radiogroup"
      aria-label="مظهر الواجهة"
      className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setThemePreference(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-neutral-50 text-primary-800 shadow-sm"
                : "text-neutral-600 hover:text-neutral-800"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
