import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { Profile } from "@/types/db";

const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  if (!session) return null;

  const rows = (await sql`
    SELECT id, email FROM users WHERE id = ${session.sub}
  `) as { id: string; email: string }[];

  return rows[0] ?? null;
});

/**
 * Resolves the signed-in member, or null when the account has been
 * deactivated.
 *
 * Deactivation has to take effect immediately, and a session cookie cannot be
 * recalled once issued. Filtering on is_active here is what revokes it: every
 * portal request resolves the profile, so the cookie simply stops matching
 * anyone the moment the account is closed.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const session = await getCurrentSession();
  if (!session) return null;

  const rows = (await sql`
    SELECT * FROM profiles WHERE id = ${session.sub} AND is_active = true
  `) as Profile[];

  return rows[0] ?? null;
});

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/portal");
  return profile;
}
