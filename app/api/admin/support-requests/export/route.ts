import { requireAdmin } from "@/lib/auth";
import { getAllSupportRequests } from "@/lib/data/support-requests";
import { supportRequestStatusLabels } from "@/lib/labels/support-requests";

function csvField(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  await requireAdmin();

  const requests = await getAllSupportRequests();

  const header = [
    "رقم الطلب",
    "اسم العضو",
    "الرقم التعريفي",
    "رقم الهوية الوطنية",
    "نوع المبادرة",
    "الخدمة الفرعية",
    "الحالة",
    "الموافقة على الشروط",
    "تاريخ الطلب",
    "ملاحظات الإدارة",
  ];

  const rows = requests.map((request) => [
    request.request_number,
    request.member_name,
    request.member_number,
    request.national_id ?? "",
    request.initiative_type_title ?? "",
    request.initiative_title ?? "",
    supportRequestStatusLabels[request.status],
    request.terms_accepted ? "نعم" : "لا",
    request.created_at.slice(0, 10),
    request.admin_comment ?? "",
  ]);

  const BOM = String.fromCharCode(0xfeff);
  const csv =
    BOM + [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="support-requests-export.csv"`,
    },
  });
}
