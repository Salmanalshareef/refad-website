"use client";

import { useState, useTransition } from "react";
import { Newspaper, Pencil } from "lucide-react";
import { NewsItemForm } from "@/components/admin/NewsItemForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteNewsItem, toggleNewsItemPublished } from "@/app/actions/admin/news";
import { cn } from "@/lib/utils";
import type { NewsCategory, NewsItem } from "@/types/db";

export function NewsItemRow({
  item,
  category,
}: {
  item: NewsItem;
  category: NewsCategory;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <NewsItemForm item={item} defaultCategory={category} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <Newspaper className="h-5 w-5 shrink-0 text-primary-700" />
        <div>
          <p className="font-medium text-primary-900">{item.title}</p>
          <p className="text-xs text-neutral-500">{item.published_date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => toggleNewsItemPublished(item.id, !item.is_published))
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
            item.is_published
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {item.is_published ? "منشور على الموقع" : "غير منشور"}
        </button>
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
