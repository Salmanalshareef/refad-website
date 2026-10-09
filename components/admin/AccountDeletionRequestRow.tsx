"use client";

import { useState, useTransition } from "react";
import { UserX } from "lucide-react";
import {
  approveAccountDeletion,
  rejectAccountDeletion,
} from "@/app/actions/account-deletion";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import type { AccountDeletionRequestWithMember } from "@/types/db";

const STATUS_LABELS = {
  pending: "قيد المراجعة",
  approved: "تم تعطيل الحساب",
  rejected: "مرفوض",
} as const;

const STATUS_STYLES = {
  pending: "bg-gold-100 text-gold-600",
  approved: "bg-red-50 text-red-600",
  rejected: "bg-neutral-200 text-neutral-600",
} as const;

export function AccountDeletionRequestRow({
  request,
}: {
  request: AccountDeletionRequestWithMember;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div className="rounded-xl border border-red-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <UserX className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-primary-900">{request.member_name}</p>
              {/* Named explicitly: this queue is mostly registrations, and the
                  two call for opposite actions. */}
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                طلب حذف حساب
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  STATUS_STYLES[request.status]
                )}
              >
                {STATUS_LABELS[request.status]}
              </span>
            </div>
            <p dir="ltr" className="mt-0.5 text-start text-xs text-neutral-500">
              #{request.member_number} · {request.phone}
              {request.national_id ? ` · ${request.national_id}` : ""}
            </p>
            {request.reason && (
              <p className="mt-1.5 text-sm text-neutral-700">
                <span className="text-xs text-neutral-500">السبب: </span>
                {request.reason}
              </p>
            )}
            {request.admin_comment && (
              <p className="mt-1 text-xs text-neutral-500">
                ملاحظة الإدارة: {request.admin_comment}
              </p>
            )}
          </div>
        </div>

        {request.status === "pending" && !rejecting && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (
                  confirm(
                    `سيتم تعطيل حساب ${request.member_name} ومنعه من تسجيل الدخول. تبقى بياناته وسجله محفوظة. هل تريد المتابعة؟`
                  )
                ) {
                  startTransition(() => approveAccountDeletion(request.id));
                }
              }}
              className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
            >
              تعطيل الحساب
            </button>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
            >
              رفض الطلب
            </button>
          </div>
        )}
      </div>

      {rejecting && (
        <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="سبب الرفض (اختياري)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await rejectAccountDeletion(request.id, comment);
                  setRejecting(false);
                })
              }
              className="px-4! py-2! text-xs"
            >
              تأكيد الرفض
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRejecting(false)}
              className="px-4! py-2! text-xs"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
