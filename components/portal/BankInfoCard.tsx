"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { FundBankInfo } from "@/types/db";

function CopyField({
  label,
  value,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
}) {
  const copied = copiedField === label;

  return (
    <div>
      <dt className="text-xs text-white/70">{label}</dt>
      <dd className="mt-1 flex items-center gap-2">
        <span dir="ltr" className="font-mono font-medium">
          {value || "—"}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onCopy(label, value)}
            className="inline-flex items-center gap-1 rounded-lg bg-neutral-50/15 px-2 py-1 text-xs font-medium hover:bg-neutral-50/25"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "تم النسخ" : "نسخ"}
          </button>
        )}
      </dd>
    </div>
  );
}

export function BankInfoCard({ bankInfo }: { bankInfo: FundBankInfo | null }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function handleCopy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-white/70">اسم الحساب</dt>
            <dd className="mt-0.5 font-medium">{bankInfo?.account_name || "—"}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-white/70">اسم البنك</dt>
            <dd className="mt-0.5 font-medium">{bankInfo?.bank_name || "—"}</dd>
          </div>
        </div>

        <CopyField
          label="رقم الحساب"
          value={bankInfo?.account_number ?? ""}
          copiedField={copiedField}
          onCopy={handleCopy}
        />

        <CopyField
          label="رقم الآيبان (IBAN)"
          value={bankInfo?.iban ?? ""}
          copiedField={copiedField}
          onCopy={handleCopy}
        />
      </dl>
    </div>
  );
}
