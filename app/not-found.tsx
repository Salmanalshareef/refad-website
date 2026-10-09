import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/shared/Button";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  robots: { index: false, follow: false },
};

/**
 * Catches both notFound() calls and URLs that match no route at all.
 *
 * It renders inside the root layout, which carries no chrome of its own — the
 * route group that supplies the header and footer does not wrap this file — so
 * both are imported directly. Someone who lands here is lost, and the
 * navigation is the part of the page that actually helps.
 */
export default function NotFound() {
  return (
    <div className="public-shell flex flex-1 flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:py-28">
        <div className="w-full max-w-lg text-center">
          <p dir="ltr" className="text-6xl font-extrabold text-primary-200 sm:text-7xl">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-primary-900 sm:text-3xl">
            الصفحة غير موجودة
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            الرابط الذي فتحته غير صحيح، أو أن الصفحة لم تعد متاحة.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/">العودة إلى الرئيسية</Button>
            <Button href="/contact" variant="outline">
              تواصل معنا
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
