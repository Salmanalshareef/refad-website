import { sql } from "@/lib/db";
import { gregorianToHijriYear } from "@/lib/hijri";
import type { FamilyMember, FamilyMemberWithProfile, Profile, Spouse } from "@/types/db";

export type NodeStatusColor = "white" | "green" | "yellow" | "lightblue" | "pink";

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
  // Two switches, and both must allow it. The administrator's sits on the tree
  // record so it covers everyone, including the great majority who never
  // registered and the dead, who cannot speak for themselves. The member's own
  // covers their account. Read this way an administrator can withhold anyone's
  // date but cannot reveal one a member chose to hide, which is the
  // undertaking the privacy policy makes to them.
  if (member.show_birth_date === false) return null;
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

    // Women are shown in pink regardless of living status or children: the
    // four status colours describe the male line, and the legend below the
    // tree documents only those. A woman added to the tree would otherwise
    // default to "alive, no children", which says nothing useful about her.
    let statusColor: NodeStatusColor;
    if (member.gender === "female") {
      statusColor = "pink";
    } else if (isLiving) {
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
      // The detail panel renders the name itself and then every entry here, so
      // this object is the whole of what a member's details show. Date of
      // death is the only conditional row: it appears for a deceased member
      // and is absent for a living one, rather than showing an empty field.
      //
      // Living status is deliberately not listed. is_living still decides the
      // card colour and orders the year range, so it stays visible through the
      // colour without being stated in words.
      attributes: {
        // "سنة" rather than "تاريخ": these values are Hijri years, not full
        // dates. The forms elsewhere do collect a full date, so their labels
        // stay as they are.
        "سنة الميلاد": birthYear ? `${birthYear}هـ` : "غير معروف",
        ...(isLiving
          ? {}
          : { "سنة الوفاة": deathYear ? `${deathYear}هـ` : "غير معروف" }),
        "اسم الأم": member.mother_name ?? "غير مسجل",
      },
      ...(children && children.length > 0
        ? { children: children.map(toNode) }
        : {}),
    };
  }

  // A root is someone with no father in the tree — the apex of the line, or a
  // branch whose father was never recorded.
  //
  // Except where a mother was recorded instead. The tree is a male line and
  // places people by father_id alone, so a child known only through his mother
  // has no position in it: showing him as a root would present him as an
  // ancestor of the family, which is the opposite of true. He is absent from
  // the diagram and present in his parents' own family view, which is where
  // the mother's link is meant to be read.
  const roots = members
    .filter((m) => !m.father_id || !byId.has(m.father_id))
    .filter((m) => !m.mother_id)
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

/**
 * One member's spouses and children, for the read-only "عائلتي" tab and for
 * the administrator's view of the same records.
 *
 * Children are matched on either parent. father_id is what the tree is built
 * from; mother_id is set when an administrator records a child against a
 * mother, and is the only way a woman's children can be found at all, since
 * mother_name is free text rather than a reference.
 *
 * Oldest first, which is how a family lists its children; those with no
 * recorded birth date fall to the end rather than being guessed at.
 */
export async function getImmediateFamily(familyMemberId: string) {
  const children = (await sql`
    SELECT id, full_name, gender, is_living
    FROM family_members
    WHERE father_id = ${familyMemberId} OR mother_id = ${familyMemberId}
    ORDER BY birth_date ASC NULLS LAST, full_name ASC
  `) as Pick<FamilyMember, "id" | "full_name" | "gender" | "is_living">[];

  const spouses = (await sql`
    SELECT id, member_id, full_name, national_id, created_at
    FROM spouses
    WHERE member_id = ${familyMemberId}
    ORDER BY created_at ASC
  `) as Spouse[];

  return { children, spouses };
}

/**
 * The tree record an administrator is editing a member's family against.
 *
 * Same matching rule as findSelfFamilyMemberId — explicit link first, then a
 * national ID that matches exactly one record — so the admin view and the
 * member's own view always agree about which node is theirs.
 */
export async function findFamilyMemberIdForProfile(
  profile: Pick<Profile, "id" | "national_id">
): Promise<string | null> {
  const rows = (await sql`
    SELECT id FROM family_members WHERE profile_id = ${profile.id} LIMIT 1
  `) as { id: string }[];
  if (rows[0]) return rows[0].id;

  const nationalId = profile.national_id?.trim();
  if (!nationalId) return null;

  const matched = (await sql`
    SELECT id FROM family_members
    WHERE national_id IS NOT NULL AND btrim(national_id) = ${nationalId}
    LIMIT 2
  `) as { id: string }[];

  return matched.length === 1 ? matched[0].id : null;
}

export type MemberFamily = {
  familyMemberId: string | null;
  parentGender: "male" | "female" | null;
  spouses: Spouse[];
  children: Pick<FamilyMember, "id" | "full_name" | "gender" | "is_living">[];
};

/**
 * Every member's spouses and children, keyed by profile id, for the admin list.
 *
 * Three queries rather than three per member: the list renders every account
 * at once, and resolving each one separately would turn opening the page into
 * dozens of round trips to a database on another continent.
 *
 * The tree record is matched the same way everywhere else matches it — the
 * explicit link first, then a national ID that identifies exactly one record.
 * An ambiguous ID resolves to nothing rather than attaching one member's
 * family to another.
 */
export async function getFamiliesByProfile(): Promise<Record<string, MemberFamily>> {
  const resolved = (await sql`
    SELECT p.id AS profile_id,
           -- Cast both sides to text: the lateral aggregates with min(),
           -- which cannot take a uuid, and COALESCE refuses a uuid/text pair.
           COALESCE(linked.id::text, matched.id) AS family_member_id,
           COALESCE(linked.gender::text, matched.gender) AS gender
    FROM profiles p
    LEFT JOIN family_members linked ON linked.profile_id = p.id
    LEFT JOIN LATERAL (
      SELECT CASE WHEN count(*) = 1 THEN min(fm.id::text) END AS id,
             CASE WHEN count(*) = 1 THEN min(fm.gender::text) END AS gender
      FROM family_members fm
      WHERE p.national_id IS NOT NULL AND btrim(p.national_id) <> ''
        AND fm.national_id IS NOT NULL
        AND btrim(fm.national_id) = btrim(p.national_id)
    ) matched ON true
  `) as { profile_id: string; family_member_id: string | null; gender: "male" | "female" | null }[];

  const ids = resolved.map((r) => r.family_member_id).filter((id): id is string => Boolean(id));

  type ChildRow = Pick<FamilyMember, "id" | "full_name" | "gender" | "is_living"> & {
    father_id: string | null;
    mother_id: string | null;
  };

  // The driver's query object is not a plain Promise, so each result is
  // awaited and then typed, the way every other query in this file does it.
  let spouses: Spouse[] = [];
  let children: ChildRow[] = [];

  if (ids.length > 0) {
    spouses = (await sql`
      SELECT id, member_id, full_name, national_id, created_at
      FROM spouses WHERE member_id = ANY(${ids}::uuid[])
      ORDER BY created_at ASC
    `) as Spouse[];

    children = (await sql`
      SELECT id, full_name, gender, is_living, father_id, mother_id
      FROM family_members
      WHERE father_id = ANY(${ids}::uuid[]) OR mother_id = ANY(${ids}::uuid[])
      ORDER BY birth_date ASC NULLS LAST, full_name ASC
    `) as ChildRow[];
  }

  const result: Record<string, MemberFamily> = {};
  for (const row of resolved) {
    const fmId = row.family_member_id;
    result[row.profile_id] = {
      familyMemberId: fmId,
      parentGender: row.gender,
      spouses: fmId ? spouses.filter((s) => s.member_id === fmId) : [],
      children: fmId
        ? children.filter((c) => c.father_id === fmId || c.mother_id === fmId)
        : [],
    };
  }
  return result;
}
