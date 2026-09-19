import type { MemberRequestField } from "@/types/db";

export type MemberRequestFormState =
  | {
      error?: string;
      success?: boolean;
    }
  | undefined;

/** The form input name carrying the answer for a given field. */
export function fieldInputName(field: Pick<MemberRequestField, "id">) {
  return `field_${field.id}`;
}

/**
 * Validates one answer against its field definition. Fields are rows an admin
 * edits, so the rules are derived per submission rather than fixed in a schema.
 */
export function validateAnswer(field: MemberRequestField, raw: string): string | null {
  const value = raw.trim();

  // Read-only fields are filled from the applicant's own name, so an empty one
  // means that part of their name simply does not exist.
  if (field.kind === "applicant_name") return null;

  if (!value) {
    return field.is_required ? `الرجاء تعبئة حقل "${field.label}".` : null;
  }

  if (field.kind === "number" && !/^\d+$/.test(value)) {
    return `حقل "${field.label}" يجب أن يحتوي على أرقام فقط.`;
  }

  if (field.kind === "long_text" && value.length < 10) {
    return `الرجاء كتابة 10 أحرف على الأقل في حقل "${field.label}".`;
  }

  return null;
}

/** The applicant's own name split into the words that fill read-only fields. */
export function applicantNameParts(fullName: string) {
  return fullName.trim().split(/\s+/);
}
