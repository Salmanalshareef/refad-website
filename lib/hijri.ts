export const HIJRI_MONTH_NAMES = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

const hijriFormatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export type HijriDate = { year: number; month: number; day: number };

function toHijriParts(date: Date): HijriDate {
  const parts = hijriFormatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function gregorianToHijri(isoDate: string | null | undefined): HijriDate | null {
  if (!isoDate) return null;
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return toHijriParts(date);
}

// Tabular Islamic calendar epoch used only as a search seed — the exact match
// against the Umm al-Qura calendar is confirmed via hijriFormatter below.
function estimateJulianDay(year: number, month: number, day: number): number {
  return (
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    385
  );
}

function julianDayToGregorianDate(jd: number): Date {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return new Date(Date.UTC(year, month - 1, day));
}

export function gregorianToHijriYear(isoDate: string | null | undefined): number | null {
  return gregorianToHijri(isoDate)?.year ?? null;
}

export function formatHijriDisplay(isoDate: string | null | undefined): string | null {
  const hijri = gregorianToHijri(isoDate);
  if (!hijri) return null;
  return `${hijri.day} ${HIJRI_MONTH_NAMES[hijri.month - 1]} ${hijri.year}هـ`;
}

export function hijriToGregorian(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) return null;

  const estimate = julianDayToGregorianDate(estimateJulianDay(year, month, day));
  for (let offset = -5; offset <= 5; offset++) {
    const candidate = new Date(estimate.getTime() + offset * 86_400_000);
    const parts = toHijriParts(candidate);
    if (parts.year === year && parts.month === month && parts.day === day) {
      return candidate.toISOString().slice(0, 10);
    }
  }
  return null;
}

// Anchors a year-only Hijri value to 1 Muharram of that year for storage in a
// `date` column — the day/month are never shown or read back, only the year.
export function hijriYearToGregorian(year: number): string | null {
  return hijriToGregorian(year, 1, 1);
}
