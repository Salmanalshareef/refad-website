import "server-only";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

export type RateLimitRule = {
  /** Groups attempts of one kind; part of the counting key. */
  bucket: string;
  /** Attempts allowed within the window before further ones are refused. */
  limit: number;
  windowSeconds: number;
};

/**
 * Limits are deliberately generous. The aim is to stop automated flooding and
 * online password guessing, not to inconvenience a family that may well be
 * registering several members from one house on one evening.
 */
export const RATE_LIMITS = {
  /** Per phone number: slows guessing against one specific account. */
  loginByPhone: { bucket: "login:phone", limit: 10, windowSeconds: 900 },
  /** Per IP: slows one source spraying one password across many accounts. */
  loginByIp: { bucket: "login:ip", limit: 50, windowSeconds: 900 },
  contactByIp: { bucket: "contact:ip", limit: 5, windowSeconds: 3600 },
  registrationByIp: { bucket: "registration:ip", limit: 10, windowSeconds: 3600 },
} as const satisfies Record<string, RateLimitRule>;

/**
 * The caller's IP as the platform reports it.
 *
 * x-vercel-forwarded-for is set by Vercel itself and cannot be spoofed by the
 * client; the other two are fallbacks for running anywhere else. When none is
 * present every caller shares the "unknown" bucket, which errs toward limiting
 * too much rather than too little.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded =
    headerList.get("x-vercel-forwarded-for") ?? headerList.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headerList.get("x-real-ip") || "unknown";
}

/**
 * True when this identifier has already used up the rule's allowance.
 *
 * A failure to reach the database returns false — an outage should not lock
 * every member out of the site, and the endpoints behind this still validate
 * and authenticate normally.
 */
export async function isRateLimited(
  rule: RateLimitRule,
  identifier: string
): Promise<boolean> {
  try {
    const rows = (await sql`
      SELECT count(*)::int AS count FROM rate_limit_events
      WHERE bucket = ${rule.bucket}
        AND identifier = ${identifier}
        AND created_at > now() - make_interval(secs => ${rule.windowSeconds})
    `) as { count: number }[];

    return (rows[0]?.count ?? 0) >= rule.limit;
  } catch {
    return false;
  }
}

/**
 * Records one attempt and drops this key's expired rows in the same call, so
 * the table never needs sweeping separately. Never throws: an attempt that
 * cannot be recorded must not fail the request it was measuring.
 */
export async function recordAttempt(
  rule: RateLimitRule,
  identifier: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO rate_limit_events (bucket, identifier)
      VALUES (${rule.bucket}, ${identifier})
    `;
    await sql`
      DELETE FROM rate_limit_events
      WHERE bucket = ${rule.bucket}
        AND identifier = ${identifier}
        AND created_at < now() - make_interval(secs => ${rule.windowSeconds})
    `;
  } catch {
    // Ignored on purpose; see the doc comment.
  }
}
