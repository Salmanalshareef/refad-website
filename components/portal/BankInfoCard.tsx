"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { FundBankInfo } from "@/types/db";

export function BankInfoCard({ bankInfo }: { bankInfo: FundBankInfo | null }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!bankInfo?.iban) return;
    try {
      await navigator.clipboard.writeText(bankInfo.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail (e.g. insecure context) — nothing to do.
    }
  }

  return (
    <div
      className="rounded-2xl p-6 text-white shadow-sm"
      style={{ background: "linear-gradient(135deg, #163f47, #d6a298)" }}
    >
      <h2 className="mb-4 font-bold">بيانات الحساب البنكي</h2>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-white/70">اسم الحساب</dt>
          <dd className="mt-0.5 font-medium">{bankInfo?.account_name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/70">اسم البنك</dt>
          <dd className="mt-0.5 font-medium">{bankInfo?.bank_name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/70">رقم الآيبان (IBAN)</dt>
          <dd className="mt-1 flex items-center gap-2">
            <span dir="ltr" className="font-mono font-medium">
              {bankInfo?.iban || "—"}
            </span>
            {bankInfo?.iban && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-medium hover:bg-white/25"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "تم النسخ" : "نسخ"}
              </button>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
