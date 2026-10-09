import { requireProfile } from "@/lib/auth";
import { sql } from "@/lib/db";
import { DeleteAccountForm } from "@/components/portal/DeleteAccountForm";

export default async function DeleteAccountPage() {
  const profile = await requireProfile();

  const pending = (await sql`
    SELECT id FROM account_deletion_requests
    WHERE profile_id = ${profile.id} AND status = 'pending'
    LIMIT 1
  `.catch(() => [])) as { id: string }[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">طلب حذف الحساب</h1>
        <p className="mt-1 text-sm text-neutral-600">
          سيُراجع طلبك من قِبل إدارة الصندوق قبل تنفيذه.
        </p>
      </div>

      <DeleteAccountForm hasPending={pending.length > 0} />
    </div>
  );
}
