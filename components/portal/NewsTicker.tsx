"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import type { NewsItem } from "@/types/db";

/**
 * A marquee needs its content twice over: the track scrolls exactly one copy's
 * width and snaps back, which reads as continuous only if a second copy is
 * already in view at the moment it resets.
 *
 * With very few items a single copy is narrower than the strip, so the reset
 * would be visible as a gap. Repeating until there is enough to cover the
 * strip keeps it seamless whether there are three items or thirty.
 */
const MIN_ITEMS_PER_COPY = 6;

export function NewsTicker({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  const copy: NewsItem[] = [];
  while (copy.length < MIN_ITEMS_PER_COPY) copy.push(...items);

  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
      <div className="flex shrink-0 items-center gap-2 border-e border-neutral-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-800">
        <Megaphone className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline">آخر الأخبار</span>
      </div>

      <div className="news-ticker group relative flex-1 overflow-hidden py-2.5">
        <div className="news-ticker-track flex w-max items-center gap-8">
          {[0, 1].map((pass) => (
            <div key={pass} className="flex items-center gap-8" aria-hidden={pass === 1}>
              {copy.map((item, index) => (
                <Link
                  key={`${pass}-${item.id}-${index}`}
                  href={
                    item.category === "fund"
                      ? "/media-center/fund-news"
                      : "/media-center/family-news"
                  }
                  // The second copy exists only to make the loop seamless.
                  // Hidden from the tree, so it must be out of the tab order
                  // too — focus landing on it would scroll to nothing.
                  tabIndex={pass === 1 ? -1 : undefined}
                  className="flex shrink-0 items-center gap-2 text-sm text-neutral-700 hover:text-primary-700"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  {item.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
