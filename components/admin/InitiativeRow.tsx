"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { InitiativeForm } from "@/components/admin/InitiativeForm";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  deleteInitiative,
  toggleInitiativePublished,
  toggleInitiativeRequestable,
} from "@/app/actions/admin/initiatives";
import { cn } from "@/lib/utils";
import type { Initiative, InitiativeType } from "@/types/db";

export function InitiativeRow({
  initiative,
  types,
  typeName,
  typeIsRequestable,
}: {
  initiative: Initiative;
  types: InitiativeType[];
  typeName: string;
  typeIsRequestable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <InitiativeForm initiative={initiative} types={types} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <InitiativeIcon src={initiative.icon} size={20} />
        </div>
        <div>
          <p className="mb-0.5 text-xs font-semibold text-gold-600">{typeName}</p>
          <p className="font-medium text-primary-900">{initiative.title}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => toggleInitiativePublished(initiative.id, !initiative.is_published))
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
            initiative.is_published
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {initiative.is_published ? "منشور للأعضاء" : "غير منشور"}
        </button>
        <button
          type="button"
          disabled={isPending || !typeIsRequestable}
          title={
            !typeIsRequestable
              ? "النوع غير متاح للطلب حاليًا — لا يمكن تفعيل هذه الخدمة قبل تفعيل النوع."
              : undefined
          }
          onClick={() =>
            startTransition(() =>
              toggleInitiativeRequestable(initiative.id, !initiative.is_requestable)
            )
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            initiative.is_requestable
              ? "bg-gold-100 text-gold-700 hover:bg-gold-200"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {initiative.is_requestable ? "متاح لتقديم الطلبات" : "غير متاح للطلب"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        <DeleteButton action={() => deleteInitiative(initiative.id)} />
      </div>
    </div>
  );
}
