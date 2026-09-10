"use client";

import { useActionState } from "react";
import { saveBankInfo } from "@/app/actions/admin/subscriptions";
import { Button } from "@/components/shared/Button";
import type { FundBankInfo } from "@/types/db";

export function BankInfoForm({ bankInfo }: { bankInfo: FundBankInfo }) {
  const [state, action, pending] = useActionState(saveBankInfo, undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-4">
      <input type="hidden" name="id" value={bankInfo.id} />
      <input
        name="account_name"
        placeholder="اسم الحساب"
        defaultValue={bankInfo.account_name}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="bank_name"
        placeholder="اسم البنك"
        defaultValue={bankInfo.bank_name}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="account_number"
        dir="ltr"
        placeholder="رقم الحساب"
        defaultValue={bankInfo.account_number}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="iban"
        dir="ltr"
        placeholder="رقم الآيبان (IBAN)"
        defaultValue={bankInfo.iban}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-4">{state.error}</p>
      )}

      <div className="sm:col-span-4">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : "حفظ بيانات الحساب"}
        </Button>
      </div>
    </form>
  );
}
