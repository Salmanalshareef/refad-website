"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Newspaper, Pencil } from "lucide-react";
import { NewsItemForm } from "@/components/admin/NewsItemForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteNewsItem, setNewsItemAudience } from "@/app/actions/admin/news";
import { newsAudienceLabels, newsAudienceOptions } from "@/lib/labels/news";
import { cn } from "@/lib/utils";
import type { NewsAudience, NewsCategory, NewsItem } from "@/types/db";

const AUDIENCE_STYLES: Record<NewsAudience, string> = {
  none: "bg-neutral-200 text-neutral-600",
  members_only: "bg-gold-100 text-gold-600",
  site_and_members: "bg-primary-50 text-primary-700",
};

export function NewsItemRow({
  item,
  category,
}: {
  item: NewsItem;
  category: NewsCategory;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Without this the select renders the server value for the length of the
  // round trip, so a change visibly reverts before reappearing.
  const [audience, setAudience] = useOptimistic(item.audience);

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <NewsItemForm item={item} defaultCategory={category} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Newspaper className="h-5 w-5 shrink-0 text-primary-700" />
        <div className="min-w-0">
          <p className="font-medium text-primary-900">{item.title}</p>
          <p className="text-xs text-neutral-500">{item.published_date}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* One control for the whole decision: two booleans could disagree,
            and a row saying "not published to members" while members were
            reading it is what this replaces. */}
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">النشر</span>
          <select
            value={audience}
            disabled={isPending}
            onChange={(e) => {
              const next = e.target.value as NewsAudience;
              startTransition(() => {
                setAudience(next);
                return setNewsItemAudience(item.id, next);
              });
            }}
            className={cn(
              "rounded-full border-0 px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
              AUDIENCE_STYLES[audience]
            )}
          >
            {newsAudienceOptions.map((option) => (
              <option key={option} value={option}>
                {newsAudienceLabels[option]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        <DeleteButton action={() => deleteNewsItem(item.id)} />
      </div>
    </div>
  );
}
