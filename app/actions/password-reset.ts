"use server";

import { randomInt } from "node:crypto";

import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { normalizeLocalPhone } from "@/lib/phone";
import { passwordResetMessage, sendSms } from "@/lib/sms";
import {
  ChangePasswordSchema,
  RequestResetSchema,
  ResetPasswordSchema,
  type ChangePasswordState,
  type RequestResetState,
  type ResetPasswordState,
} from "@/lib/validation/password-reset";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
/** Throttles repeat requests so the form cannot be used to spam someone. */
const RESEND_COOLDOWN_SECONDS = 60;

type UserRow = { id: string; full_name: string };

/**
 * Matches on the digits alone, so 05…, 5…, 966… and +966… all find the same
 * account. An exact string match would leave a registered member who typed
 * their number a different way looking exactly like a stranger — and on this
 * form that failure is silent by design, so they would never learn why.
 *
 * Two accounts could in principle be stored in different formats that
 * normalise alike; that is ambiguous rather than a match, and resolves to
 * nothing rather than guessing which one to send a code to.
 */
async function findUserByPhone(phone: string) {
  const rows = (await sql`
    SELECT u.id, p.full_name
    FROM users u
    JOIN profiles p ON p.id = u.id
    WHERE regexp_replace(p.phone, '[^0-9]', '', 'g') = ${normalizeLocalPhone(phone)}
      AND p.is_active = true
    LIMIT 2
  `) as UserRow[];
  return rows.length === 1 ? rows[0] : null;
}

/**
 * Step one: send a six-digit code by SMS.
 *
 * Reports success whether or not the number belongs to an account, so the form
 * cannot be used to discover who is registered. The one exception is an SMS
 * gateway that is not configured or unreachable — staying silent there would
 * leave the member waiting for a message that was never going to arrive.
 */
export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const validatedFields = RequestResetSchema.safeParse({
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { phone } = validatedFields.data;
  const user = await findUserByPhone(phone).catch(() => null);

  if (!user) return { success: true };

  const recent = (await sql`
    SELECT created_at FROM password_reset_codes
    WHERE user_id = ${user.id}
      AND created_at > now() - make_interval(secs => ${RESEND_COOLDOWN_SECONDS})
    LIMIT 1
  `) as { created_at: string }[];

  // Within the cooldown the earlier code is still valid and on its way.
  if (recent.length > 0) return { success: true };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = await hashPassword(code);

  try {
    // Any earlier code is spent the moment a new one is issued.
    await sql`
      UPDATE password_reset_codes
      SET consumed_at = now()
      WHERE user_id = ${user.id} AND consumed_at IS NULL
    `;
    await sql`
      INSERT INTO password_reset_codes (user_id, code_hash, expires_at)
      VALUES (
        ${user.id}, ${codeHash},
        now() + make_interval(mins => ${CODE_TTL_MINUTES})
      )
    `;
  } catch {
    return { error: "تعذر إنشاء رمز التحقق، حاول مرة أخرى." };
  }

  const result = await sendSms(phone, passwordResetMessage(code));

  if (!result.sent) {
    // The code exists but nobody can read it, so say so rather than leave the
    // member waiting on the next screen for a message that will not come.
    return {
      error:
        result.reason === "not_configured"
          ? "خدمة الرسائل غير مفعّلة حاليًا. الرجاء التواصل مع إدارة الصندوق."
          : "تعذر إرسال رسالة التحقق، حاول مرة أخرى.",
      smsUnavailable: true,
    };
  }

  return { success: true };
}

/**
 * Step two: check the code and set the new password.
 *
 * Every failure answers with the same message. Telling an attacker that the
 * code was right but expired, or that the number has no account, hands them
 * information the legitimate member does not need.
 */
export async function resetPasswordWithCode(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    phone: formData.get("phone"),
    code: formData.get("code"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { phone, code, password } = validatedFields.data;
  const invalid = { error: "الرمز غير صحيح أو انتهت صلاحيته." };

  const user = await findUserByPhone(phone).catch(() => null);
  if (!user) return invalid;

  const rows = (await sql`
    SELECT id, code_hash, attempts
    FROM password_reset_codes
    WHERE user_id = ${user.id}
      AND consumed_at IS NULL
      AND expires_at > now()
      AND attempts < ${MAX_ATTEMPTS}
    ORDER BY created_at DESC
    LIMIT 1
  `) as { id: string; code_hash: string; attempts: number }[];

  const record = rows[0];
  if (!record) return invalid;

  const matches = await verifyPassword(code, record.code_hash);

  if (!matches) {
    // Counted so a six-digit code cannot be walked through within its window.
    await sql`
      UPDATE password_reset_codes SET attempts = attempts + 1 WHERE id = ${record.id}
    `;
    return invalid;
  }

  try {
    const passwordHash = await hashPassword(password);
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user.id}`;
    await sql`
      UPDATE password_reset_codes SET consumed_at = now() WHERE id = ${record.id}
    `;
  } catch {
    return { error: "تعذر تحديث كلمة المرور، حاول مرة أخرى." };
  }

  return { success: true };
}

/** Changing a password from inside the portal, where the member is signed in. */
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await requireUser();

  const validatedFields = ChangePasswordSchema.safeParse({
    current_password: formData.get("current_password"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { current_password, password } = validatedFields.data;

  const rows = (await sql`
    SELECT password_hash FROM users WHERE id = ${session.sub}
  `) as { password_hash: string }[];

  const currentHash = rows[0]?.password_hash;
  if (!currentHash || !(await verifyPassword(current_password, currentHash))) {
    return { error: "كلمة المرور الحالية غير صحيحة." };
  }

  try {
    const passwordHash = await hashPassword(password);
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${session.sub}`;
  } catch {
    return { error: "تعذر تحديث كلمة المرور، حاول مرة أخرى." };
  }

  return { success: true };
}
