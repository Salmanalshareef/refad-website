import { sql } from "@/lib/db";
import { gregorianToHijriYear } from "@/lib/hijri";
import type { FamilyMemberWithProfile, Profile } from "@/types/db";

export type NodeStatusColor = "white" | "green" | "yellow" | "lightblue";

export type FamilyTreeNode = {
  /** family_members.id — lets the view locate a specific person in the tree. */
  id: string;
  name: string;
  attributes?: Record<string, string>;
  children?: FamilyTreeNode[];
  firstName: string;
  yearRange: string;
  /** The linked account holder's profile photo, when there is one. */
  photoUrl: string | null;
  statusColor: NodeStatusColor;
};

export async function getFamilyMembers(): Promise<FamilyMemberWithProfile[]> {
  // A tree member is tied to an account either by the explicit profile_id link
  // or, failing that, by a national ID that matches exactly one profile — the
  // same rule findSelfFamilyMemberId uses. An ambiguous ID resolves to nothing
  // rather than guessing, which in a family tree would attach the wrong face.
  return (await sql`
    SELECT fm.*,
           COALESCE(linked.birth_date, matched.birth_date) AS profile_birth_date,
           COALESCE(linked.avatar_url, matched.avatar_url) AS profile_avatar_url,
           COALESCE(linked.show_birth_date, matched.show_birth_date) AS profile_show_birth_date
    FROM family_members fm
    LEFT JOIN profiles linked ON linked.id = fm.profile_id
    LEFT JOIN LATERAL (
      SELECT CASE WHEN count(*) = 1 THEN min(pr.birth_date) END AS birth_date,
             CASE WHEN count(*) = 1 THEN min(pr.avatar_url) END AS avatar_url,
             CASE WHEN count(*) = 1 THEN bool_and(pr.show_birth_date) END AS show_birth_date
      FROM profiles pr
      WHERE fm.national_id IS NOT NULL
        AND btrim(fm.national_id) <> ''
        AND btrim(pr.national_id) = btrim(fm.national_id)
    ) matched ON true
  `) as FamilyMemberWithProfile[];
}

function effectiveBirthDateOf(member: FamilyMemberWithProfile) {
  return member.profile_birth_date ?? member.birth_date;
}

/**
 * The birth date as the tree may show it. A member who has turned the toggle
 * off is hidden outright rather than falling back to the date on their family
 * record — otherwise the admin-entered copy would defeat the setting.
 *
 * Sorting still uses the real date: reordering siblings would move the node
 * and leak roughly the same thing while breaking the layout people know.
 */
function displayBirthDateOf(member: FamilyMemberWithProfile) {
  if (member.profile_show_birth_date === false) return null;
  return effectiveBirthDateOf(member);
}

// The tree renders left-to-right (its container is forced dir="ltr" so the
// diagram layout isn't mirrored), so to read oldest-to-youngest from right
// to left, the array itself must go youngest-first (leftmost) to
// oldest-last (rightmost). Members with no known birth date are treated as
// the oldest and pushed to the right-hand end.
function byAgeYoungestFirst(a: FamilyMemberWithProfile, b: FamilyMemberWithProfile) {
  const dateA = effectiveBirthDateOf(a);
  const dateB = effectiveBirthDateOf(b);
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateB.localeCompare(dateA);
}

export function buildFamilyTree(members: FamilyMemberWithProfile[]): FamilyTreeNode[] {
  const byId = new Map(members.map((m) => [m.id, m]));
  const childrenByFather = new Map<string, FamilyMemberWithProfile[]>();

  for (const member of members) {
    if (!member.father_id) continue;
    const list = childrenByFather.get(member.father_id) ?? [];
    list.push(member);
    childrenByFather.set(member.father_id, list);
  }
  for (const list of childrenByFather.values()) {
    list.sort(byAgeYoungestFirst);
  }

  function toNode(member: FamilyMemberWithProfile): FamilyTreeNode {
    const children = childrenByFather.get(member.id);
    const hasChildren = Boolean(children && children.length > 0);
    const isLiving = member.is_living;
    const birthYear = gregorianToHijriYear(displayBirthDateOf(member));
    const deathYear = gregorianToHijriYear(member.death_date);
    // Rendered left-to-right, so the death year is listed first to land on
    // the left and the birth year second to land on the right.
    const yearRange = isLiving
      ? (birthYear ?? "")
      : [deathYear ?? "", birthYear ?? ""].join(" - ");

    let statusColor: NodeStatusColor;
    if (isLiving) {
      statusColor = hasChildren ? "green" : "lightblue";
    } else {
      statusColor = hasChildren ? "white" : "yellow";
    }

    return {
      id: member.id,
      name: member.full_name,
      firstName: member.full_name.trim().split(/\s+/)[0] ?? member.full_name,
      yearRange: String(yearRange),
      photoUrl: member.profile_avatar_url ?? member.photo_url,
      statusColor,
      attributes: {
        الحالة: isLiving ? "على قيد الحياة" : "متوفى",
        "تاريخ الميلاد": birthYear ? `${birthYear}هـ` : "غير معروف",
        ...(isLiving
          ? {}
          : { "تاريخ الوفاة": deathYear ? `${deathYear}هـ` : "غير معروف" }),
        "اسم الأم": member.mother_name ?? "غير مسجل",
      },
      ...(children && children.length > 0
        ? { children: children.map(toNode) }
        : {}),
    };
  }

  const roots = members
    .filter((m) => !m.father_id || !byId.has(m.father_id))
    .sort(byAgeYoungestFirst);

  return roots.map(toNode);
}

/**
 * Resolves which family tree node represents the signed-in member.
 *
 * `profiles.family_member_id` is the authoritative link. Falling back to the
 * national ID covers profiles that predate that link, and only an unambiguous
 * single match is accepted — the tree repeats given names across branches, so
 * guessing by name could focus the wrong person.
 */
export async function findSelfFamilyMemberId(
  profile: Pick<Profile, "family_member_id" | "national_id">
): Promise<string | null> {
  if (profile.family_member_id) return profile.family_member_id;

  const nationalId = profile.national_id?.trim();
  if (!nationalId) return null;

  const rows = (await sql`
    SELECT id FROM family_members WHERE national_id = ${nationalId} LIMIT 2
  `) as { id: string }[];

  return rows.length === 1 ? rows[0].id : null;
}

/** Counted in the database rather than by loading every row for the dashboard. */
export async function getLivingFamilyMemberCount() {
  const rows = (await sql`
    SELECT count(*)::int AS n FROM family_members WHERE is_living = true
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}
