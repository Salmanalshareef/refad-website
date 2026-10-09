"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { approveSubscription, deleteSubscription } from "@/app/actions/admin/subscriptions";
import { subscriptionStatusLabels, subscriptionStatusStyles } from "@/lib/labels/subscriptions";
import { SubscriptionReceiptModal } from "@/components/admin/SubscriptionReceiptModal";
import { SubscriptionRejectModal } from "@/components/admin/SubscriptionRejectModal";
import { SubscriptionEditForm } from "@/components/admin/SubscriptionEditForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Subscription, SubscriptionWithMember } from "@/types/db";

function ApproveButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => approveSubscription(id))}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {isPending ? "جارٍ القبول..." : "قبول واعتماد"}
    </button>
  );
}

type SubscriptionRow = SubscriptionWithMember & { effective_status: Subscription["status"] };

function StatusCell({ sub }: { sub: SubscriptionRow }) {
  return (
    <>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          subscriptionStatusStyles[sub.effective_status]
        )}
      >
        {subscriptionStatusLabels[sub.effective_status]}
      </span>
      {sub.admin_comment && (
        <p className="mt-1 max-w-[200px] text-xs text-neutral-500">{sub.admin_comment}</p>
      )}
    </>
  );
}

function RowActions({ sub, onEdit }: { sub: SubscriptionRow; onEdit: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <SubscriptionReceiptModal receiptUrl={sub.receipt_url} />
      {sub.status === "pending" && (
        <>
          <ApproveButton id={sub.id} />
          <SubscriptionRejectModal id={sub.id} />
        </>
      )}
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        تعديل
      </button>
      <DeleteButton
        action={() => deleteSubscription(sub.id)}
        confirmMessage="هل أنت متأكد من حذف طلب الاشتراك هذا؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
}

/** The same row as a card, for viewports too narrow for six columns. */
function SubscriptionCard({ sub }: { sub: SubscriptionRow }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-4">
        <SubscriptionEditForm subscription={sub} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-primary-900">{sub.member_name}</p>
          <p dir="ltr" className="text-start text-xs text-neutral-500">
            #{sub.member_number}
          </p>
        </div>
        <div className="shrink-0 text-end">
          <StatusCell sub={sub} />
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">السنة المالية</dt>
          <dd dir="ltr" className="text-neutral-800">{sub.fiscal_year}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">المبلغ</dt>
          <dd dir="ltr" className="text-neutral-800">{sub.amount} ر.س</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-neutral-500">تاريخ التقديم</dt>
          <dd className="text-neutral-800">{sub.requested_date}</dd>
        </div>
      </dl>

      <div className="mt-3 border-t border-neutral-100 pt-3">
        <RowActions sub={sub} onEdit={() => setEditing(true)} />
      </div>
    </div>
  );
}

function SubscriptionTableRow({ sub }: { sub: SubscriptionRow }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-neutral-100 last:border-0">
        <td colSpan={6} className="bg-primary-50/40 px-4 py-4">
          <SubscriptionEditForm subscription={sub} onDone={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-100 last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-primary-900">{sub.member_name}</p>
        <p dir="ltr" className="text-xs text-neutral-500">
          #{sub.member_number}
        </p>
      </td>
      <td dir="ltr" className="px-4 py-3 text-neutral-700">
        {sub.fiscal_year}
      </td>
      <td dir="ltr" className="px-4 py-3 text-neutral-700">
        {sub.amount} ر.س
      </td>
      <td className="px-4 py-3 text-neutral-700">{sub.requested_date}</td>
      <td className="px-4 py-3">
        <StatusCell sub={sub} />
      </td>
      <td className="px-4 py-3">
        <RowActions sub={sub} onEdit={() => setEditing(true)} />
      </td>
    </tr>
  );
}

export function SubscriptionsTable({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {subscriptions.map((sub) => (
          <SubscriptionCard key={sub.id} sub={sub} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 sm:block">
        <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            <th className="px-4 py-3 text-start font-medium">العضو</th>
            <th className="px-4 py-3 text-start font-medium">السنة المالية</th>
            <th className="px-4 py-3 text-start font-medium">المبلغ</th>
            <th className="px-4 py-3 text-start font-medium">تاريخ التقديم</th>
            <th className="px-4 py-3 text-start font-medium">الحالة</th>
            <th className="px-4 py-3 text-start font-medium">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <SubscriptionTableRow key={sub.id} sub={sub} />
          ))}
        </tbody>
        </table>
      </div>
    </>
  );
}
