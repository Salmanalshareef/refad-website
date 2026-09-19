"use client";

import { useState, useTransition } from "react";
import { XCircle } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { rejectSubscription } from "@/app/actions/admin/subscriptions";

export function SubscriptionRejectModal({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        رفض / طلب تعديل
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="سبب الرفض أو التعديل المطلوب">
        <div className="space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="اكتب سبب الرفض أو التعديل المطلوب ليظهر للعضو..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await rejectSubscription(id, reason);
                setOpen(false);
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {isPending ? "جارٍ الحفظ..." : "تأكيد الرفض"}
          </button>
        </div>
      </Modal>
    </>
  );
}
