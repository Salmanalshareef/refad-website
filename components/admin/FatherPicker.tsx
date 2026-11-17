"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { firstNameKey, searchKey } from "@/lib/arabic-search";
import { cn } from "@/lib/utils";

const RESULT_LIMIT = 20;

type Candidate = { id: string; full_name: string };

/**
 * Picks a father by typing his name.
 *
 * A plain select listed every member in the tree — over two hundred of them,
 * most sharing a handful of given names — so finding the right man meant
 * scrolling a list where twenty entries begin "محمد بن". Typing narrows it.
 *
 * The chosen id still reaches the form through a hidden input under the same
 * name the select used, so nothing downstream changes: the action, the schema
 * and the database all see exactly what they saw before.
 *
 * Matching folds hamza forms, ta marbuta and spaces, so a name typed the way
 * it sounds finds the record however it happens to be spelled.
 */
export function FatherPicker({
  candidates,
  value,
  onChange,
  name = "father_id",
}: {
  candidates: Candidate[];
  value: string;
  onChange: (id: string) => void;
  name?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = candidates.find((c) => c.id === value) ?? null;

  // Normalised once per candidate rather than once per keystroke, and the
  // given name kept apart from the chain so the two can be ranked separately.
  const haystack = useMemo(
    () =>
      candidates.map((c) => ({
        candidate: c,
        key: searchKey(c.full_name),
        firstKey: firstNameKey(c.full_name),
      })),
    [candidates]
  );

  /**
   * Men named what was typed come first; men merely descended from someone of
   * that name come after.
   *
   * Ranked rather than filtered. Narrowing to given names alone would be the
   * stricter reading, but it would also throw away the chain search that makes
   * "محمد بن سعد" land on one man out of 284 — and the whole point of typing a
   * second word is to use the chain.
   */
  const { results, firstNameCount } = useMemo(() => {
    const needle = searchKey(query);
    if (!needle) {
      return {
        results: haystack.slice(0, RESULT_LIMIT).map((e) => e.candidate),
        firstNameCount: 0,
      };
    }

    const named: Candidate[] = [];
    const related: Candidate[] = [];
    for (const entry of haystack) {
      if (entry.firstKey.includes(needle)) named.push(entry.candidate);
      else if (entry.key.includes(needle)) related.push(entry.candidate);
    }
    return {
      results: [...named, ...related].slice(0, RESULT_LIMIT),
      firstNameCount: named.length,
    };
  }, [haystack, query]);

  // A click outside closes the list. Without this the panel stays open behind
  // the rest of the form and swallows the next click.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (id: string) => {
    onChange(id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* The form still receives father_id exactly as the select delivered it. */}
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-start text-sm"
      >
        <span className={cn("min-w-0 truncate", !selected && "text-neutral-500")}>
          {selected ? selected.full_name : "بدون أب محدد"}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label="إزالة الأب المحدد"
              onClick={(event) => {
                event.stopPropagation();
                choose("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  choose("");
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="relative border-b border-neutral-200">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
                // Enter takes the only match, which is the whole interaction
                // once the name typed is unambiguous.
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (results.length === 1) choose(results[0].id);
                }
              }}
              placeholder="ابحث بالاسم..."
              aria-label="ابحث عن الأب بالاسم"
              className="w-full px-3 py-2.5 pe-3 ps-9 text-sm focus:outline-none"
            />
          </div>

          <ul className="max-h-60 overflow-y-auto">
            <li>
              <button
                type="button"
                onClick={() => choose("")}
                className="flex w-full items-center justify-between px-3 py-2 text-start text-sm text-neutral-500 hover:bg-neutral-100"
              >
                بدون أب محدد
                {!value && <Check className="h-3.5 w-3.5 text-primary-700" />}
              </button>
            </li>

            {results.length === 0 ? (
              <li className="px-3 py-3 text-sm text-neutral-500">
                لا يوجد فرد بهذا الاسم.
              </li>
            ) : (
              results.map((candidate, index) => (
                <li key={candidate.id}>
                  {/* Where the men actually bearing the name end and those
                      merely descended from one begin. Without the line the
                      ordering is invisible and the tail looks like noise. */}
                  {index === firstNameCount && firstNameCount > 0 && (
                    <p className="border-y border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500">
                      مطابقات في بقية الاسم
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => choose(candidate.id)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-primary-50"
                  >
                    <span className="min-w-0 truncate text-neutral-800">
                      {candidate.full_name}
                    </span>
                    {candidate.id === value && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary-700" />
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Says why the list stops, so a name further down the alphabet does
              not look missing. */}
          {!searchKey(query) && candidates.length > RESULT_LIMIT && (
            <p className="border-t border-neutral-200 px-3 py-2 text-xs text-neutral-500">
              يعرض أول {RESULT_LIMIT} من {candidates.length} فردًا — اكتب للبحث.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
