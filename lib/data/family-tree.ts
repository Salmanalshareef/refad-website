import { sql } from "@/lib/db";
import { gregorianToHijriYear } from "@/lib/hijri";
import type { FamilyMemberWithProfile } from "@/types/db";

export type NodeStatusColor = "white" | "green" | "yellow" | "lightblue";

export type FamilyTreeNode = {
  name: string;
  attributes?: Record<string, string>;
  children?: FamilyTreeNode[];
  firstName: string;
  yearRange: string;
  statusColor: NodeStatusColor;
};

export async function getFamilyMembers(): Promise<FamilyMemberWithProfile[]> {
  return (await sql`
    SELECT fm.*, p.birth_date AS profile_birth_date
    FROM family_members fm
    LEFT JOIN profiles p ON p.id = fm.profile_id
  `) as FamilyMemberWithProfile[];
}

function effectiveBirthDateOf(member: FamilyMemberWithProfile) {
  return member.profile_id ? member.profile_birth_date : member.birth_date;
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
    const effectiveBirthDate = effectiveBirthDateOf(member);

    const birthYear = gregorianToHijriYear(effectiveBirthDate);
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
      name: member.full_name,
      firstName: member.full_name.trim().split(/\s+/)[0] ?? member.full_name,
      yearRange: String(yearRange),
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
