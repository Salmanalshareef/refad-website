import { getBoardMembers } from "@/lib/data/board";
import { BoardMemberForm } from "@/components/admin/BoardMemberForm";
import { BoardMemberRow } from "@/components/admin/BoardMemberRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminBoardPage() {
  const members = await getBoardMembers().catch(() => null);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة عضو جديد</h2>
        <BoardMemberForm />
      </div>

      <div className="space-y-3">
        {members === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {members?.length === 0 && <EmptyState message="لا يوجد أعضاء بعد." />}
        {members?.map((member) => (
          <BoardMemberRow key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
