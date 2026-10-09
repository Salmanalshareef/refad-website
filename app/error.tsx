"use client";

import Link from "next/link";

/**
 * Covers the public site. Deliberately self-contained: if the thrown error
 * came from shared chrome, rendering that same chrome inside the boundary
 * would throw again and escalate to global-error, so this page imports no
 * header, footer or data.
 *
 * In production `error.message` is a generic string — Next withholds the real
 * one to avoid leaking server details to the browser. `error.digest` is the
 * hash that matches it to the Vercel runtime log, which is why it is shown.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:py-28">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          تعذّر عرض هذه الصفحة. حاول مرة أخرى، وإذا تكرر الخطأ تواصل معنا.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => retry()}
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-primary-600 px-6 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
          >
            العودة إلى الرئيسية
          </Link>
        </div>

        {error.digest && (
          <p dir="ltr" className="mt-8 text-xs text-neutral-400">
            {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
