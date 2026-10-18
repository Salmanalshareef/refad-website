import { Download } from "lucide-react";
import { getFamilyMembers } from "@/lib/data/family-tree";
import { getAllProfiles } from "@/lib/data/members";
import { FamilyMemberForm } from "@/components/admin/FamilyMemberForm";
import { FamilyMemberList } from "@/components/admin/FamilyMemberList";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminFamilyMembersPage() {
  const [members, profiles] = await Promise.all([
    getFamilyMembers().catch(() => null),
    getAllProfiles().catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      {/* Both files are the whole tree, so they live with the tree rather than
          beside one list. The CSV is for drawing it elsewhere, the GEDCOM for
          keeping it somewhere that outlives this application. */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-1 text-sm font-semibold text-neutral-700">تصدير شجرة الأسرة</h2>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          ملف CSV يفتح في Excel ويبني الرسم في Visio عبر Data Visualizer، وملف
          GEDCOM يُقرأ في برامج الأنساب. الملفان لا يتضمنان أرقام الهوية.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/admin/family-tree/csv"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
          >
            <Download className="h-3.5 w-3.5" />
            تصدير CSV (Visio / Excel)
          </a>
          <a
            href="/api/admin/family-tree/gedcom"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
          >
            <Download className="h-3.5 w-3.5" />
            تصدير GEDCOM (برامج الأنساب)
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة فرد جديد</h2>
        <FamilyMemberForm allMembers={members ?? []} profiles={profiles} />
      </div>

      {members === null ? (
        <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : (
        <FamilyMemberList members={members} profiles={profiles} />
      )}
    </div>
  );
}
