"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronUp, HandHeart } from "lucide-react";
import { updateSupportRequest } from "@/app/actions/admin/support-requests";
import {
  supportRequestStatusLabels,
  supportRequestStatusStyles,
} from "@/lib/labels/support-requests";
import type { SupportRequestStatus, SupportRequestWithDetails } from "@/types/db";

export function SupportRequestRow({ request }: { request: SupportRequestWithDetails }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SupportRequestStatus>(request.status);
  const [comment, setComment] = useState(request.admin_comment ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-start"
      >
        <div className="flex items-center gap-3">
          <HandHeart className="h-5 w-5 shrink-0 text-primary-700" />
          <div>
            <p className="font-medium text-primary-900">
              {request.member_name}
              <span dir="ltr" className="ms-2 text-xs font-normal text-neutral-400">
                #{request.request_number}
              </span>
              <span
                className={`ms-2 rounded-full px-2 py-0.5 text-xs font-semibold ${supportRequestStatusStyles[request.status]}`}
              >
                {supportRequestStatusLabels[request.status]}
              </span>
            </p>
            <p className="text-xs text-neutral-500">
              {request.initiative_title ?? "خدمة"}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
          {request.description && (
            <p className="text-sm text-neutral-700">{request.description}</p>
          )}
          {request.attachment_url && (
            <a
              href={request.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-medium text-primary-700 hover:underline"
            >
              عرض المرفق
            </a>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              الحالة
            </label>
            <select
              value={status}
              disabled={isPending}
              onChange={(e) => {
                setStatus(e.target.value as SupportRequestStatus);
                setSaved(false);
              }}
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs"
            >
              {Object.entries(supportRequestStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              ملاحظة للعضو (تظهر له خصوصًا في حال الرفض)
            </label>
            <textarea
              value={comment}
              disabled={isPending}
              onChange={(e) => {
                setComment(e.target.value);
                setSaved(false);
              }}
              rows={2}
              placeholder="اكتب ملاحظة توضيحية للعضو..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await updateSupportRequest(request.id, status, comment);
                  setSaved(true);
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {isPending ? "جارٍ الحفظ..." : "تأكيد الحالة"}
            </button>
            {saved && !isPending && (
              <span className="text-xs font-medium text-primary-700">تم الحفظ.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
