import { sql } from "@/lib/db";
import type { Profile, ProfileWithEmail } from "@/types/db";

export async function getAllProfiles() {
  return (await sql`
    SELECT * FROM profiles ORDER BY created_at DESC
  `) as Profile[];
}

export async function getProfilesByRole(role: "member" | "admin") {
  return (await sql`
    SELECT p.*, u.email
    FROM profiles p
    JOIN users u ON u.id = p.id
    WHERE p.role = ${role}
    ORDER BY p.created_at DESC
  `) as ProfileWithEmail[];
}
