"use client";

import { useState, useTransition } from "react";
import { Lock, Paperclip, Pencil } from "lucide-react";
import { MemberRequestTypeForm } from "@/components/admin/MemberRequestTypeForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  deleteMemberRequestType,
  toggleMemberRequestTypePublished,
} from "@/app/actions/admin/member-request-types";
import { cn } from "@/lib/utils";
import type { MemberRequestFieldKind, MemberRequestTypeWithFields } from "@/types/db";

const KIND_LABELS: Record<MemberRequestFieldKind, string> = {
  text: "نص",
  number: "أرقام",
  long_text: "نص طويل",
  applicant_name: "تلقائي",
};

export function MemberRequestTypeRow({ type }: { type: MemberRequestTypeWithFields }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <MemberRequestTypeForm type={type} onDone={() => setEditing(false)} />
      </div>
    );
  }

  const isBuiltIn = type.key !== null;

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-primary-900">{type.title}</p>
          {isBuiltIn && (
            <span
              title="نوع أساسي — يمكن تعديله أو إخفاؤه، ولا يمكن حذفه"
              className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
            >
              <Lock className="h-3 w-3" />
              أساسي
            </span>
          )}
          {type.collects_attachment && (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              <Paperclip className="h-3 w-3" />
              مرفق
            </span>
          )}
        </div>

        {type.fields.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {type.fields.map((field) => (
              <span
                key={field.id}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600"
              >
                {field.label}
                <span className="text-neutral-400">{KIND_LABELS[field.kind]}</span>
                {field.is_required && <span className="text-red-500">*</span>}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-neutral-500">لا توجد حقول</p>
        )}

        {type.notice && (
          <p className="mt-1.5 line-clamp-1 text-xs text-gold-700">تنبيه: {type.notice}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() => toggleMemberRequestTypePublished(type.id, !type.is_published))
          }
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
            type.is_published
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
              : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
          )}
        >
          {type.is_published ? "متاح للأعضاء" : "مخفي"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        {!isBuiltIn && (
          <DeleteButton
            action={() => deleteMemberRequestType(type.id)}
            confirmMessage="هل أنت متأكد من حذف نوع الطلب؟ الطلبات السابقة من هذا النوع ستبقى محفوظة."
          />
        )}
      </div>
    </div>
  );
}
