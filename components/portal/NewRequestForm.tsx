"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  createDraftSupportRequest,
  deleteDraftSupportRequest,
  submitSupportRequest,
} from "@/app/actions/support-requests";
import { Button } from "@/components/shared/Button";
import type { Initiative, InitiativeType, Profile } from "@/types/db";

export function NewRequestForm({
  profile,
  types,
  initiatives,
}: {
  profile: Profile;
  types: InitiativeType[];
  initiatives: Initiative[];
}) {
  const [draft, setDraft] = useState<{ id: string; requestNumber: number } | null>(null);
  const [draftError, setDraftError] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedInitiativeId, setSelectedInitiativeId] = useState("");
  const draftIdRef = useRef<string | null>(null);
  const submittedRef = useRef(false);

  const [state, action, pending] = useActionState(submitSupportRequest, undefined);

  useEffect(() => {
    let cancelled = false;
    createDraftSupportRequest()
      .then((result) => {
        if (cancelled || !result) return;
        draftIdRef.current = result.id;
        setDraft({ id: result.id, requestNumber: result.request_number });
      })
      .catch(() => setDraftError(true));

    return () => {
      cancelled = true;
      const id = draftIdRef.current;
      if (id && !submittedRef.current) {
        deleteDraftSupportRequest(id).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    function handleBeforeUnload() {
      const id = draftIdRef.current;
      if (id && !submittedRef.current) {
        navigator.sendBeacon(
          "/api/support-requests/draft",
          new Blob([JSON.stringify({ id })], { type: "application/json" })
        );
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (state?.success) {
    submittedRef.current = true;
  }

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const subServices = selectedTypeId
    ? initiatives.filter((i) => i.initiative_type_id === selectedTypeId && i.is_requestable)
    : [];
  const selectedInitiative = initiatives.find((i) => i.id === selectedInitiativeId) ?? null;

  if (state?.success) {
    return (
      <div className="space-y-3 rounded-lg border border-primary-200 bg-primary-50 p-6 text-center">
        <p className="text-sm font-medium text-primary-800">تم إرسال طلبك بنجاح.</p>
        <p className="text-2xl font-extrabold text-primary-900" dir="ltr">
          #{state.requestNumber}
        </p>
        <Link
          href="/portal/services"
          className="inline-block text-sm font-medium text-primary-700 hover:underline"
        >
          العودة إلى المبادرات
        </Link>
      </div>
    );
  }

  if (draftError) {
    return (
      <p className="text-sm font-medium text-red-600">تعذر بدء طلب جديد، حاول مرة أخرى.</p>
    );
  }

  if (!draft) {
    return <p className="text-sm text-neutral-600">جارٍ التحضير...</p>;
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="draft_id" value={draft.id} />

      <p className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
        هذا طلب غير مكتمل — إذا غادرت هذه الصفحة دون الضغط على "إرسال الطلب" فلن يتم
        حفظه ولن يُحتسب كطلب.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">مقدّم الطلب</p>
          <p className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600">
            {profile.full_name}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">الرقم التعريفي</p>
          <p
            dir="ltr"
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600"
          >
            #{profile.member_number}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">رقم الهوية الوطنية</p>
          <p
            dir="ltr"
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600"
          >
            {profile.national_id ?? "غير مسجل"}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">تاريخ الطلب</p>
          <p
            dir="ltr"
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600"
          >
            {today}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">رقم الطلب (مسودة)</p>
          <p
            dir="ltr"
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-600"
          >
            #{draft.requestNumber}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="type_id" className="mb-1.5 block text-sm font-medium text-neutral-800">
          اختر المبادرة
        </label>
        <select
          id="type_id"
          value={selectedTypeId}
          onChange={(e) => {
            setSelectedTypeId(e.target.value);
            setSelectedInitiativeId("");
          }}
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="" disabled>
            اختر مبادرة
          </option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="initiative_id" className="mb-1.5 block text-sm font-medium text-neutral-800">
          اختر الخدمة الفرعية
        </label>
        <select
          id="initiative_id"
          name="initiative_id"
          value={selectedInitiativeId}
          onChange={(e) => setSelectedInitiativeId(e.target.value)}
          required
          disabled={!selectedTypeId}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-400"
        >
          <option value="" disabled>
            {selectedTypeId ? "اختر خدمة فرعية" : "اختر مبادرة أولًا"}
          </option>
          {subServices.map((initiative) => (
            <option key={initiative.id} value={initiative.id}>
              {initiative.title}
            </option>
          ))}
        </select>
      </div>

      {selectedInitiative?.requirements && (
        <div className="rounded-lg border border-gold-200 bg-gold-50 p-4">
          <p className="text-sm font-semibold text-gold-800">المتطلبات</p>
          <p className="mt-1 text-sm text-gold-700">{selectedInitiative.requirements}</p>
        </div>
      )}

      <div>
        <label htmlFor="attachment_file" className="mb-1.5 block text-sm font-medium text-neutral-800">
          إرفاق مستند (اختياري)
        </label>
        <input
          id="attachment_file"
          name="attachment_file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="terms_accepted" required className="mt-1" />
        أقر بالاطلاع على الشروط والأحكام وأوافق عليها.
      </label>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
}
