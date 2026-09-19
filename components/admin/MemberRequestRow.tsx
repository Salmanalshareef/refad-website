"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import { updateMemberRequest } from "@/app/actions/admin/member-requests";
import {
  memberRequestStatusLabels,
  memberRequestStatusStyles,
  memberRequestTypeLabels,
} from "@/lib/labels/member-requests";
import type { MemberRequestStatus, MemberRequestWithDetails } from "@/types/db";

export function MemberRequestRow({ request }: { request: MemberRequestWithDetails }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<MemberRequestStatus>(request.status);
  const [comment, setComment] = useState(request.admin_comment ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-start"
      >
        <div className="flex items-center gap-3">
          <Inbox className="h-5 w-5 shrink-0 text-primary-700" />
          <div>
            <p className="font-medium text-primary-900">
              {request.member_name}
              <span
                className={`ms-2 rounded-full px-2 py-0.5 text-xs font-semibold ${memberRequestStatusStyles[request.status]}`}
              >
                {memberRequestStatusLabels[request.status]}
              </span>
            </p>
            <p className="text-xs text-neutral-500">
              {request.type_title ?? memberRequestTypeLabels[request.type]}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
          {/* Answers are a snapshot taken at submission, so a field renamed
              later still reads here as the member saw it. */}
          {request.answers.length > 0 ? (
            <div className="grid gap-2 rounded-lg bg-neutral-50 p-3 text-sm sm:grid-cols-2">
              {request.answers.map((answer) => (
                <p key={answer.field_id} className="min-w-0">
                  <span className="text-xs text-neutral-500">{answer.label}: </span>
                  <span className="whitespace-pre-line">{answer.value}</span>
                </p>
              ))}
              <p>
                <span className="text-xs text-neutral-500">رقم هوية مقدّم الطلب: </span>
                <span dir="ltr">{request.applicant_national_id ?? "غير مسجل"}</span>
              </p>
            </div>
          ) : (
            request.details && <p className="text-sm text-neutral-700">{request.details}</p>
          )}

          {request.image_url && (
            <a href={request.image_url} target="_blank" rel="noopener noreferrer">
              <Image
                src={request.image_url}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-lg object-cover"
              />
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
                setStatus(e.target.value as MemberRequestStatus);
                setSaved(false);
              }}
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs"
            >
              {Object.entries(memberRequestStatusLabels).map(([value, label]) => (
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
                  await updateMemberRequest(request.id, status, comment);
                  setSaved(true);
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
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
