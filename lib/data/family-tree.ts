import { sql } from "@/lib/db";
import { formatHijriDisplay, gregorianToHijriYear } from "@/lib/hijri";
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

export function buildFamilyTree(members: FamilyMemberWithProfile[]): FamilyTreeNode[] {
  const byId = new Map(members.map((m) => [m.id, m]));
  const childrenByFather = new Map<string, FamilyMemberWithProfile[]>();

  for (const member of members) {
    if (!member.father_id) continue;
    const list = childrenByFather.get(member.father_id) ?? [];
    list.push(member);
    childrenByFather.set(member.father_id, list);
  }

  function toNode(member: FamilyMemberWithProfile): FamilyTreeNode {
    const children = childrenByFather.get(member.id);
    const hasChildren = Boolean(children && children.length > 0);
    const isLiving = member.is_living;
    const effectiveBirthDate = member.profile_id ? member.profile_birth_date : member.birth_date;

    const birthYear = gregorianToHijriYear(effectiveBirthDate);
    const deathYear = gregorianToHijriYear(member.death_date);
    const yearRange = isLiving
      ? (birthYear ?? "")
      : [birthYear ?? "", deathYear ?? ""].join(" - ");

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
        "تاريخ الميلاد": formatHijriDisplay(effectiveBirthDate) ?? "غير معروف",
        ...(isLiving
          ? {}
          : { "تاريخ الوفاة": formatHijriDisplay(member.death_date) ?? "غير معروف" }),
      },
      ...(children && children.length > 0
        ? { children: children.map(toNode) }
        : {}),
    };
  }

  const roots = members.filter(
    (m) => !m.father_id || !byId.has(m.father_id)
  );

  return roots.map(toNode);
}
