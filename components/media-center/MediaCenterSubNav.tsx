"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/media-center/family-news", label: "أخبار الأسرة" },
  { href: "/media-center/fund-news", label: "أخبار الصندوق" },
  { href: "/media-center/videos", label: "مكتبة الفيديو" },
  { href: "/media-center/magazine", label: "مجلة الأسرة" },
];

export function MediaCenterSubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors",
                active
                  ? "border-primary-700 text-primary-800"
                  : "border-transparent text-neutral-600 hover:text-primary-700"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
