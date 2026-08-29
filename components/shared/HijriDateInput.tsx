"use client";

import { useMemo, useState } from "react";
import { gregorianToHijri, hijriToGregorian, HIJRI_MONTH_NAMES } from "@/lib/hijri";

const selectClasses =
  "w-full rounded-lg border border-neutral-300 px-2 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function HijriDateInput({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const initial = useMemo(() => gregorianToHijri(defaultValue), [defaultValue]);
  const currentHijriYear = useMemo(
    () => gregorianToHijri(new Date().toISOString().slice(0, 10))?.year ?? 1447,
    []
  );

  const [day, setDay] = useState(initial ? String(initial.day) : "");
  const [month, setMonth] = useState(initial ? String(initial.month) : "");
  const [year, setYear] = useState(initial ? String(initial.year) : "");

  const gregorianValue = useMemo(() => {
    if (!day || !month || !year) return "";
    return hijriToGregorian(Number(year), Number(month), Number(day)) ?? "";
  }, [day, month, year]);

  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => currentHijriYear - i),
    [currentHijriYear]
  );

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-800">
        {label} (هجري)
      </label>
      <div className="grid grid-cols-3 gap-2">
        <select
          id={id}
          aria-label="اليوم"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className={selectClasses}
        >
          <option value="">اليوم</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          aria-label="الشهر"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className={selectClasses}
        >
          <option value="">الشهر</option>
          {HIJRI_MONTH_NAMES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="السنة"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={selectClasses}
        >
          <option value="">السنة</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" name={name} value={gregorianValue} />
    </div>
  );
}
