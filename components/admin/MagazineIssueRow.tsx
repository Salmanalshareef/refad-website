"use client";

import { useTransition } from "react";
import { BookOpen } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteMagazineIssue, toggleMagazineIssuePublished } from "@/app/actions/admin/magazine";
import { cn } from "@/lib/utils";
import type { MagazineIssue } from "@/types/db";

export function MagazineIssueRow({ issue }: { issue: MagazineIssue }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 shrink-0 text-primary-700" />
        <div>
          <p className="font-medium text-primary-900">{issue.title}</p>
          <p className="text-xs text-neutral-500">
            {issue.issue_label ? `${issue.issue_label} — ` : ""}
            {issue.published_date}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => toggleMagazineIssuePublished(issue.id, !issue.is_published))
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
            issue.is_published
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {issue.is_published ? "منشور على الموقع" : "غير منشور"}
        </button>
        <DeleteButton action={() => deleteMagazineIssue(issue.id, issue.file_url)} />
      </div>
    </div>
  );
}
