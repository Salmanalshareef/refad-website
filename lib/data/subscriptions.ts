import { sql } from "@/lib/db";
import type { Subscription, SubscriptionWithMember } from "@/types/db";

export { subscriptionStatusLabels, subscriptionStatusStyles } from "@/lib/labels/subscriptions";

type WithEffectiveStatus<T> = T & { effective_status: Subscription["status"] };

export async function getMySubscriptions(profileId: string) {
  return (await sql`
    SELECT *,
      CASE WHEN status = 'active' AND end_date < CURRENT_DATE THEN 'expired' ELSE status END AS effective_status
    FROM subscriptions
    WHERE profile_id = ${profileId}
    ORDER BY requested_date DESC
  `) as WithEffectiveStatus<Subscription>[];
}

export async function getLatestSubscription(profileId: string) {
  const rows = (await sql`
    SELECT *,
      CASE WHEN status = 'active' AND end_date < CURRENT_DATE THEN 'expired' ELSE status END AS effective_status
    FROM subscriptions
    WHERE profile_id = ${profileId}
    ORDER BY requested_date DESC
    LIMIT 1
  `) as WithEffectiveStatus<Subscription>[];

  return rows[0] ?? null;
}

export async function getAllSubscriptions() {
  return (await sql`
    SELECT s.*, p.full_name AS member_name, p.member_number,
      CASE WHEN s.status = 'active' AND s.end_date < CURRENT_DATE THEN 'expired' ELSE s.status END AS effective_status
    FROM subscriptions s
    JOIN profiles p ON p.id = s.profile_id
    ORDER BY s.created_at DESC
  `) as WithEffectiveStatus<SubscriptionWithMember>[];
}

export async function getSubscriptionStats() {
  const currentYear = new Date().getFullYear();

  const [[collected], [pending], [paidMembers], [totalMembers]] = (await Promise.all([
    sql`
      SELECT COALESCE(SUM(amount), 0)::numeric AS total
      FROM subscriptions
      WHERE fiscal_year = ${currentYear} AND status IN ('active', 'expired')
    `,
    sql`SELECT COUNT(*)::int AS count FROM subscriptions WHERE status = 'pending'`,
    sql`
      SELECT COUNT(DISTINCT profile_id)::int AS count
      FROM subscriptions
      WHERE fiscal_year = ${currentYear} AND status IN ('active', 'expired')
    `,
    sql`SELECT COUNT(*)::int AS count FROM profiles`,
  ])) as [{ total: string }[], { count: number }[], { count: number }[], { count: number }[]];

  const paid = paidMembers.count;
  const total = totalMembers.count;

  return {
    totalCollected: Number(collected.total),
    pendingCount: pending.count,
    paidCount: paid,
    unpaidCount: Math.max(total - paid, 0),
    fiscalYear: currentYear,
  };
}
