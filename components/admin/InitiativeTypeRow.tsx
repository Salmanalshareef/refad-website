"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { InitiativeTypeForm } from "@/components/admin/InitiativeTypeForm";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  deleteInitiativeType,
  toggleInitiativeTypePublished,
  toggleInitiativeTypeRequestable,
} from "@/app/actions/admin/initiative-types";
import { cn } from "@/lib/utils";
import type { InitiativeType } from "@/types/db";

export function InitiativeTypeRow({
  type,
  subServiceCount,
}: {
  type: InitiativeType;
  subServiceCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <InitiativeTypeForm type={type} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <span className="image-plate flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <InitiativeIcon src={type.icon} size={20} />
        </span>
        <div>
          <p className="font-medium text-primary-900">{type.title}</p>
          <p className="text-xs text-neutral-500">
            {subServiceCount} {subServiceCount === 1 ? "خدمة فرعية" : "خدمات فرعية"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              toggleInitiativeTypePublished(type.id, !type.is_published)
            )
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
            type.is_published
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {type.is_published ? "منشور على الموقع" : "غير منشور"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              toggleInitiativeTypeRequestable(type.id, !type.is_requestable)
            )
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
            type.is_requestable
              ? "bg-gold-100 text-gold-700 hover:bg-gold-200"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {type.is_requestable ? "متاح لتقديم الطلبات" : "غير متاح للطلب"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        <DeleteButton
          action={() => deleteInitiativeType(type.id)}
          confirmMessage={
            subServiceCount > 0
              ? `سيؤدي حذف هذا النوع إلى حذف ${subServiceCount} من الخدمات الفرعية التابعة له أيضًا. هل أنت متأكد؟`
              : "هل أنت متأكد من الحذف؟"
          }
        />
      </div>
    </div>
  );
}
