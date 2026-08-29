"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const refadFundLinks = [
  { href: "/refad-fund/about", label: "عن الصندوق" },
  { href: "/refad-fund/board-of-trustees", label: "مجلس الأمناء" },
  { href: "/refad-fund/initiatives", label: "المبادرات" },
  { href: "/refad-fund/reports", label: "التقارير" },
];

const mediaCenterLinks = [
  { href: "/media-center/family-news", label: "أخبار الأسرة" },
  { href: "/media-center/fund-news", label: "أخبار الصندوق" },
  { href: "/media-center/videos", label: "مكتبة الفيديو" },
  { href: "/media-center/magazine", label: "مجلة الأسرة" },
];

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/about-family", label: "عن الأسرة" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-website.png"
              alt="عائلة آل معجب"
              width={140}
              height={140}
              className="h-[140px] w-[140px] object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
            >
              الرئيسية
            </Link>
            <Link
              href="/about-family"
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
            >
              عن الأسرة
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setFundOpen(true)}
              onMouseLeave={() => setFundOpen(false)}
            >
              <Link
                href="/refad-fund"
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
              >
                صندوق رفاد
                <ChevronDown className="h-4 w-4" />
              </Link>
              {fundOpen && (
                <div className="absolute end-0 top-full min-w-48 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg">
                  {refadFundLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setMediaOpen(true)}
              onMouseLeave={() => setMediaOpen(false)}
            >
              <Link
                href="/media-center"
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
              >
                مركز الإعلام
                <ChevronDown className="h-4 w-4" />
              </Link>
              {mediaOpen && (
                <div className="absolute end-0 top-full min-w-48 rounded-xl border border-neutral-200 bg-white py-2 shadow-lg">
                  {mediaCenterLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary-700"
            >
              تواصل معنا
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full bg-primary-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 sm:inline-flex"
          >
            تسجيل الدخول
          </Link>
          <button
            type="button"
            aria-label="فتح القائمة"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-neutral-200 bg-background lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-primary-50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-2 px-3 text-xs font-semibold text-neutral-600">
            صندوق رفاد
          </p>
          {refadFundLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-primary-50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-2 px-3 text-xs font-semibold text-neutral-600">
            مركز الإعلام
          </p>
          {mediaCenterLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-primary-50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-primary-50"
            onClick={() => setMobileOpen(false)}
          >
            تواصل معنا
          </Link>
          <Link
            href="/login"
            className="mt-3 rounded-full bg-primary-700 px-5 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            تسجيل الدخول
          </Link>
        </nav>
      </div>
    </header>
  );
}
