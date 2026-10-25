"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProfileTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

/**
 * The three views of a member's account, one at a time.
 *
 * Every panel's content is rendered on the server and handed down as a prop,
 * so this component only decides which one is on screen. That keeps the forms
 * and the family data out of the client bundle; the tabs themselves are the
 * only thing that needs to be interactive.
 *
 * Panels are mounted and unmounted rather than hidden with CSS, so a
 * half-filled form is not quietly kept alive behind another tab.
 */
export function ProfileTabs({ tabs }: { tabs: ProfileTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      {/* Scrolls rather than wraps on a narrow screen: three Arabic labels do
          not fit across 375px, and a wrapped tab row reads as two rows of
          buttons rather than as one control. */}
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-neutral-200"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary-700 text-primary-800"
                  : "border-transparent text-neutral-600 hover:text-primary-700"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active?.id}`}
        aria-labelledby={`tab-${active?.id}`}
        className="pt-6"
      >
        {active?.content}
      </div>
    </div>
  );
}
