"use client";

import { useRef } from "react";
import { Download } from "lucide-react";

export function SubscriptionFilters({
  status,
  fiscalYear,
  fiscalYears,
}: {
  status: string;
  fiscalYear: string;
  fiscalYears: number[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      method="get"
      className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">الحالة</label>
          <select
            name="status"
            defaultValue={status}
            onChange={() => formRef.current?.requestSubmit()}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="all">الكل</option>
            <option value="pending">قيد المراجعة</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">السنة المالية</label>
          <select
            name="year"
            defaultValue={fiscalYear}
            onChange={() => formRef.current?.requestSubmit()}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="all">كل السنوات</option>
            {fiscalYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <a
        href={`/api/admin/subscriptions/export?status=${status}&year=${fiscalYear}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
      >
        <Download className="h-3.5 w-3.5" />
        تصدير إلى Excel
      </a>
    </form>
  );
}
