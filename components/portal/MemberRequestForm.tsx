"use client";

import { useActionState, useMemo, useState } from "react";
import { submitMemberRequest } from "@/app/actions/member-requests";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { applicantNameParts, fieldInputName } from "@/lib/validation/member-request";
import type { MemberRequestField, MemberRequestTypeWithFields } from "@/types/db";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";
const readOnlyClasses =
  "w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500";

function FieldInput({
  field,
  nameParts,
}: {
  field: MemberRequestField;
  nameParts: string[];
}) {
  const id = fieldInputName(field);

  if (field.kind === "applicant_name") {
    return (
      <input
        readOnly
        defaultValue={nameParts[(field.applicant_name_index ?? 1) - 1] ?? ""}
        className={readOnlyClasses}
      />
    );
  }

  if (field.kind === "long_text") {
    return (
      <textarea
        id={id}
        name={id}
        rows={4}
        required={field.is_required}
        placeholder="اكتب هنا..."
        className={inputClasses}
      />
    );
  }

  return (
    <input
      id={id}
      name={id}
      required={field.is_required}
      {...(field.kind === "number"
        ? { dir: "ltr" as const, inputMode: "numeric" as const, pattern: "\\d*" }
        : {})}
      className={inputClasses}
    />
  );
}

export function MemberRequestForm({
  applicantFullName,
  memberNumber,
  types,
}: {
  applicantFullName: string;
  memberNumber: number;
  types: MemberRequestTypeWithFields[];
}) {
  const [state, action, pending] = useActionState(submitMemberRequest, undefined);
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");

  const nameParts = useMemo(() => applicantNameParts(applicantFullName), [applicantFullName]);

  const selectedType = types.find((t) => t.id === typeId) ?? null;

  if (types.length === 0) {
    return <EmptyState message="لا توجد أنواع طلبات متاحة حاليًا." />;
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">مقدّم الطلب</p>
          <p className={readOnlyClasses}>{applicantFullName}</p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">الرقم التعريفي</p>
          <p dir="ltr" className={readOnlyClasses + " text-right"}>
            #{memberNumber}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="type_id" className="mb-1.5 block text-sm font-medium text-neutral-800">
          نوع الطلب
        </label>
        <select
          id="type_id"
          name="type_id"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className={inputClasses}
        >
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.title}
            </option>
          ))}
        </select>
      </div>

      {selectedType?.notice && (
        <div className="rounded-lg border border-gold-200 bg-gold-50 p-4">
          <p className="text-sm text-gold-800">{selectedType.notice}</p>
        </div>
      )}

      {selectedType && selectedType.fields.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {selectedType.fields.map((field) => (
            <div
              key={field.id}
              className={field.kind === "long_text" ? "sm:col-span-2" : undefined}
            >
              <label
                htmlFor={fieldInputName(field)}
                className="mb-1.5 block text-sm font-medium text-neutral-800"
              >
                {field.label}
                {!field.is_required && field.kind !== "applicant_name" && (
                  <span className="text-neutral-400"> (اختياري)</span>
                )}
              </label>
              <FieldInput field={field} nameParts={nameParts} />
            </div>
          ))}
        </div>
      )}

      {selectedType?.collects_attachment && (
        <div>
          <label
            htmlFor="attachment_file"
            className="mb-1.5 block text-sm font-medium text-neutral-800"
          >
            إرفاق ملف (اختياري)
          </label>
          <input
            id="attachment_file"
            name="attachment_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
          />
        </div>
      )}

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-primary-700">تم إرسال طلبك بنجاح.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
}
