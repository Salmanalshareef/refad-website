import { getTasks } from "@/lib/data/tasks";
import { getAllProfiles } from "@/lib/data/members";
import { TaskForm } from "@/components/admin/TaskForm";
import { TaskRow } from "@/components/admin/TaskRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminTasksPage() {
  const [tasks, assignees] = await Promise.all([
    getTasks().catch(() => null),
    getAllProfiles().catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة مهمة جديدة</h2>
        <TaskForm assignees={assignees} />
      </div>

      <div className="space-y-3">
        {tasks === null && (
          <EmptyState message="تعذر تحميل المهام. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {tasks?.length === 0 && <EmptyState message="لا توجد مهام بعد." />}
        {tasks?.map((task) => (
          <TaskRow key={task.id} task={task} assignees={assignees} />
        ))}
      </div>
    </div>
  );
}
