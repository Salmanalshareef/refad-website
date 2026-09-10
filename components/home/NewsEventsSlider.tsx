"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NewsItem } from "@/types/db";

const SLIDE_INTERVAL_MS = 5000;
const FALLBACK_LOGO = "/logo-website.png";
const EXCERPT_WORD_COUNT = 10;

const categoryHref: Record<NewsItem["category"], string> = {
  family: "/media-center/family-news",
  fund: "/media-center/fund-news",
};

function excerpt(body: string, wordCount: number) {
  const words = body.trim().split(/\s+/);
  if (words.length <= wordCount) return body.trim();
  return words.slice(0, wordCount).join(" ") + "…";
}

export function NewsEventsSlider({ items }: { items: NewsItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  function goTo(i: number) {
    setIndex((i + items.length) % items.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* The track is forced LTR purely so the slide-index math (translateX)
          stays simple and predictable; each slide's own content is flipped
          back to RTL below so the Arabic text still reads naturally. */}
      <div dir="ltr" className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} dir="rtl" className="w-full shrink-0">
              <Link href={categoryHref[item.category]} className="flex h-24 sm:h-28">
                <div className="relative h-full w-24 shrink-0 bg-primary-50 sm:w-32">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-3">
                      <Image
                        src={FALLBACK_LOGO}
                        alt=""
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 sm:px-6">
                  <h3 className="truncate text-base font-bold text-primary-900 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 truncate text-sm text-neutral-600">
                    {excerpt(item.body, EXCERPT_WORD_COUNT)}
                  </p>
                  <span className="mt-0.5 text-sm font-semibold text-primary-700">
                    قراءة المزيد
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="السابق"
            onClick={() => goTo(index - 1)}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-800 shadow-sm hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="التالي"
            onClick={() => goTo(index + 1)}
            className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary-800 shadow-sm hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-1">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`الشريحة ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-4 bg-primary-700" : "w-1 bg-primary-200"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
