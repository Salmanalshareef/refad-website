import { requireAdmin } from "@/lib/auth";
import { getAllProfilesWithEmail } from "@/lib/data/members";
import {
  educationLevelLabels,
  employmentStatusLabels,
  maritalStatusLabels,
} from "@/lib/labels/profile";

function csvField(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  await requireAdmin();

  const profiles = await getAllProfilesWithEmail();

  const header = [
    "الرقم التعريفي",
    "الاسم الكامل",
    "الدور",
    "رقم الهوية الوطنية",
    "رقم الجوال",
    "البريد الإلكتروني",
    "تاريخ الميلاد",
    "الحالة الاجتماعية",
    "المؤهل الدراسي",
    "الحالة المهنية",
  ];

  const rows = profiles.map((profile) => [
    profile.member_number,
    profile.full_name,
    profile.role === "admin" ? "مسؤول" : "عضو",
    profile.national_id ?? "",
    profile.phone,
    profile.email ?? "",
    profile.birth_date ?? "",
    profile.marital_status ? maritalStatusLabels[profile.marital_status] : "",
    profile.education_level ? educationLevelLabels[profile.education_level] : "",
    profile.employment_status ? employmentStatusLabels[profile.employment_status] : "",
  ]);

  const BOM = String.fromCharCode(0xfeff);
  const csv =
    BOM + [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members-export.csv"`,
    },
  });
}
