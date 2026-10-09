"use client";

import Link from "next/link";

/**
 * Portal errors stop here rather than bubbling to the root boundary, so the
 * member keeps the sidebar and the theme: the layout that renders PortalShell
 * sits above this boundary and is not re-rendered by it.
 */
export default function PortalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
      <h2 className="text-lg font-bold text-primary-900">حدث خطأ غير متوقع</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        تعذّر عرض هذه الصفحة. حاول مرة أخرى، وإذا تكرر الخطأ تواصل مع إدارة الصندوق.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => retry()}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/portal"
          className="inline-flex h-11 items-center justify-center rounded-full border border-primary-600 px-6 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
        >
          لوحة التحكم
        </Link>
      </div>

      {error.digest && (
        <p dir="ltr" className="mt-6 text-xs text-neutral-400">
          {error.digest}
        </p>
      )}
    </div>
  );
}
