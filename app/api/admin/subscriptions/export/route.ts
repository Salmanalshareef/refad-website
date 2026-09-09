import { requireAdmin } from "@/lib/auth";
import { getAllSubscriptions } from "@/lib/data/subscriptions";

function csvField(value: string | number) {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(request: Request) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const year = searchParams.get("year") ?? "all";

  const subscriptions = await getAllSubscriptions();

  const filtered = subscriptions.filter((sub) => {
    const statusMatch =
      status === "all" ||
      (status === "pending" && sub.status === "pending") ||
      (status === "accepted" && (sub.status === "active" || sub.status === "expired")) ||
      (status === "rejected" && sub.status === "rejected");

    const yearMatch = year === "all" || sub.fiscal_year === Number(year);

    return statusMatch && yearMatch;
  });

  const header = [
    "رقم الاشتراك",
    "اسم العضو",
    "الرقم التعريفي",
    "السنة المالية",
    "المبلغ",
    "الحالة",
    "تاريخ التقديم",
    "تاريخ الاعتماد",
    "تاريخ الانتهاء",
    "ملاحظات الإدارة",
  ];

  const rows = filtered.map((sub) => [
    sub.subscription_number ?? "",
    sub.member_name,
    sub.member_number,
    sub.fiscal_year,
    sub.amount,
    sub.effective_status,
    sub.requested_date,
    sub.approved_date ?? "",
    sub.end_date ?? "",
    sub.admin_comment ?? "",
  ]);

  const BOM = String.fromCharCode(0xfeff);
  const csv =
    BOM + [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscriptions-export.csv"`,
    },
  });
}
