import "server-only";

/**
 * SMS delivery through msegat.com.
 *
 * The gateway takes a JSON POST to /gw/sendsms.php and answers with a `code`
 * field, where "1" or "M0000" means accepted. It sometimes answers with a bare
 * status token instead of JSON, so the response is read defensively.
 *
 * Credentials come from the environment. With none configured, sending is a
 * no-op that reports failure rather than throwing: a missing gateway should
 * not take down registration approval or the reset form, and the caller
 * decides what to tell the member.
 */

const BASE_URL = process.env.MSEGAT_BASE_URL ?? "https://www.msegat.com";
const SEND_PATH = "/gw/sendsms.php";
const TIMEOUT_MS = 15_000;

export type SmsResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "rejected" | "unreachable"; detail?: string };

function credentials() {
  const userName = process.env.MSEGAT_USERNAME;
  const apiKey = process.env.MSEGAT_API_KEY;
  const userSender = process.env.MSEGAT_SENDER;
  if (!userName || !apiKey || !userSender) return null;
  return { userName, apiKey, userSender };
}

export function isSmsConfigured() {
  return credentials() !== null;
}

/**
 * Saudi numbers are stored in several shapes (05…, 9665…, +9665…). The gateway
 * wants them without a plus, so they are normalised to 9665XXXXXXXX here
 * rather than relying on however the number was typed at signup.
 */
export function normalizeSaudiNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("5")) return `966${digits}`;
  return digits;
}

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const creds = credentials();
  if (!creds) return { sent: false, reason: "not_configured" };

  const numbers = normalizeSaudiNumber(phone);
  if (!numbers) return { sent: false, reason: "rejected", detail: "empty number" };

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${SEND_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      // msgEncoding is required for Arabic: without it the gateway rejects
      // the message with 1064 "Wrong text".
      body: JSON.stringify({ ...creds, numbers, msg: message, msgEncoding: "UTF8" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    return {
      sent: false,
      reason: "unreachable",
      detail: error instanceof Error ? error.message : undefined,
    };
  }

  const body = await response.text();
  let code: string | undefined;
  try {
    const parsed = JSON.parse(body) as { code?: unknown };
    code = parsed?.code === undefined ? undefined : String(parsed.code);
  } catch {
    // Not JSON — the gateway answered with a bare token such as "1".
    code = body.trim();
  }

  // The gateway signals acceptance as either "1" or "M0000".
  if (code === "1" || code === "M0000") return { sent: true };
  return { sent: false, reason: "rejected", detail: code || `HTTP ${response.status}` };
}

/** The reset code message, kept here so both the wording and the code agree. */
export function passwordResetMessage(code: string) {
  return `رمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}. صلاحية الرمز 10 دقائق. لا تشارك هذا الرمز مع أحد.`;
}

/** Sent once an admin approves a registration request. */
export function welcomeMessage(firstName: string) {
  return `أهلاً بك ${firstName} في صندوق رفاد\nتم تفعيل حسابك بنجاح. يسعدنا تواجدك معنا لمتابعة كافة الأخبار والمستجدات`;
}
