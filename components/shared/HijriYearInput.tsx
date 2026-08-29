"use client";

import { useMemo, useState } from "react";
import { gregorianToHijriYear, hijriYearToGregorian } from "@/lib/hijri";

export function HijriYearInput({
  id,
  name,
  label,
  defaultValue,
  disabled = false,
  readOnly = false,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const initialYear = useMemo(() => gregorianToHijriYear(defaultValue), [defaultValue]);
  const currentHijriYear = useMemo(
    () => gregorianToHijriYear(new Date().toISOString().slice(0, 10)) ?? 1447,
    []
  );

  const [year, setYear] = useState(initialYear ? String(initialYear) : "");

  const gregorianValue = useMemo(() => {
    if (readOnly) return defaultValue ?? "";
    if (!year) return "";
    return hijriYearToGregorian(Number(year)) ?? "";
  }, [readOnly, defaultValue, year]);

  const years = useMemo(
    () => Array.from({ length: 120 }, (_, i) => currentHijriYear - i),
    [currentHijriYear]
  );

  if (readOnly) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">
          {label} (هجري)
        </label>
        <input
          value={initialYear ?? ""}
          disabled
          placeholder="غير محدد — يتم أخذه تلقائيًا من بيانات العضو"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500"
        />
        <input type="hidden" name={name} value={gregorianValue} />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800">
        {label} (هجري)
      </label>
      <select
        id={id}
        value={year}
        disabled={disabled}
        onChange={(e) => setYear(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-400"
      >
        <option value="">السنة</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <input type="hidden" name={name} value={gregorianValue} />
    </div>
  );
}
