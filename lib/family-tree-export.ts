import "server-only";
import { gregorianToHijriYear } from "@/lib/hijri";
import type { FamilyMember } from "@/types/db";

/**
 * Turning the family tree into files other software can read.
 *
 * Two formats, because they answer different needs. The CSV is a parent-ID
 * table, which is the shape Visio's Data Visualizer and Excel want — they draw
 * the diagram themselves from it. The GEDCOM is the genealogy standard, which
 * matters less for drawing and more for outliving this application: a .ged
 * file is still readable in software that does not exist yet.
 *
 * Birth dates are included in full, and the show_birth_date toggles are
 * deliberately not consulted. Those settings govern what the family tree shows
 * other members; these files are the fund's own administrative archive, and an
 * archive with holes in it is not an archive. Both routes are behind
 * requireAdmin, and national ID is left out of both — see toCsv.
 *
 * This is a decision, not an oversight. Anyone tempted to filter on the
 * toggles here should take it to the fund's administrators first.
 */

type Member = Pick<
  FamilyMember,
  | "id"
  | "full_name"
  | "gender"
  | "birth_date"
  | "death_date"
  | "father_id"
  | "is_living"
  | "mother_name"
>;

/** A member plus the 1-based number the export gives them. */
export type OrderedMember = Member & { seq: number; fatherSeq: number | null };

/**
 * Breadth-first from the roots, so a parent always appears above its children.
 *
 * The order matters for both formats: a human reading the CSV in Excel can
 * follow the generations down the rows, and Visio does not have to resolve
 * forward references. Sequential numbers replace the UUIDs as the ID column —
 * a diagram labelled with "7" is editable by hand, one labelled with
 * "a218175d-af59-4c57-8c4d-394b8bf19473" is not.
 *
 * Anyone unreachable from a root — an orphaned row, or a cycle — is appended
 * rather than dropped, because an export that silently loses people is worse
 * than one that looks odd.
 */
export function orderForExport(members: Member[]): OrderedMember[] {
  const childrenOf = new Map<string, Member[]>();
  for (const member of members) {
    if (!member.father_id) continue;
    const siblings = childrenOf.get(member.father_id) ?? [];
    siblings.push(member);
    childrenOf.set(member.father_id, siblings);
  }

  const byName = (a: Member, b: Member) => a.full_name.localeCompare(b.full_name, "ar");
  for (const siblings of childrenOf.values()) siblings.sort(byName);

  const ids = new Set(members.map((m) => m.id));
  const roots = members
    .filter((m) => !m.father_id || !ids.has(m.father_id))
    .sort(byName);

  const ordered: OrderedMember[] = [];
  const seqOf = new Map<string, number>();
  const seen = new Set<string>();

  const queue = [...roots];
  while (queue.length > 0) {
    const member = queue.shift()!;
    if (seen.has(member.id)) continue;
    seen.add(member.id);

    const seq = ordered.length + 1;
    seqOf.set(member.id, seq);
    ordered.push({
      ...member,
      seq,
      fatherSeq: member.father_id ? (seqOf.get(member.father_id) ?? null) : null,
    });

    queue.push(...(childrenOf.get(member.id) ?? []));
  }

  for (const member of members) {
    if (seen.has(member.id)) continue;
    const seq = ordered.length + 1;
    seqOf.set(member.id, seq);
    ordered.push({ ...member, seq, fatherSeq: null });
  }

  return ordered;
}

function csvField(value: string | number) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const hijriYear = (date: string | null) => {
  const year = gregorianToHijriYear(date);
  return year ? String(year) : "";
};

/**
 * Parent-ID table, the shape Visio's Data Visualizer reads: map "الرقم" to the
 * unique ID and "رقم الأب" to the parent, and it builds the diagram.
 *
 * National ID is deliberately absent. This file exists to be opened in
 * whatever desktop tool draws the chart, and possibly emailed to whoever
 * does it; a lineage does not need identity numbers travelling with it.
 */
export function toCsv(members: Member[]): string {
  const ordered = orderForExport(members);
  const nameOf = new Map(ordered.map((m) => [m.seq, m.full_name]));

  const header = [
    "الرقم",
    "الاسم",
    "رقم الأب",
    "اسم الأب",
    "الجنس",
    "الحالة",
    "تاريخ الميلاد (ميلادي)",
    "تاريخ الوفاة (ميلادي)",
    "سنة الميلاد (هجري)",
    "سنة الوفاة (هجري)",
    "اسم الأم",
    "المعرّف",
  ];

  const rows = ordered.map((member) => [
    member.seq,
    member.full_name,
    member.fatherSeq ?? "",
    member.fatherSeq ? (nameOf.get(member.fatherSeq) ?? "") : "",
    member.gender === "female" ? "أنثى" : "ذكر",
    member.is_living ? "على قيد الحياة" : "متوفى",
    member.birth_date ?? "",
    member.death_date ?? "",
    hijriYear(member.birth_date),
    hijriYear(member.death_date),
    member.mother_name ?? "",
    member.id,
  ]);

  // Excel reads a CSV as the system codepage unless a BOM says otherwise,
  // which turns every Arabic name into mojibake.
  const BOM = String.fromCharCode(0xfeff);
  return BOM + [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");
}

const GEDCOM_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** GEDCOM dates are "DD MMM YYYY" with an English month, in the Gregorian calendar. */
function gedcomDate(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const name = GEDCOM_MONTHS[Number(month) - 1];
  if (!name) return null;
  return `${Number(day)} ${name} ${year}`;
}

/**
 * GEDCOM 5.5.1, lineage-linked.
 *
 * Families are grouped by father *and* mother's name rather than by father
 * alone, so that children of different mothers become separate FAM records
 * rather than being collapsed into one. Only one record carries a mother's
 * name today, so nearly every family comes out father-only — valid GEDCOM,
 * and it will sharpen by itself as mothers are entered.
 *
 * A mother who is named gets her own INDI record. She has no row of her own
 * in the tree, so she exists in the file only as a name and a link.
 *
 * Names carry no surname component. The whole Arabic name, patronymic chain
 * and all, is the given name; inventing a surname to fill the slot would be
 * putting something in the archive that nobody recorded.
 */
export function toGedcom(members: Member[], siteName: string): string {
  const ordered = orderForExport(members);
  const indiOf = new Map(ordered.map((m) => [m.id, `I${m.seq}`]));

  // father id + mother name -> the children they share
  const families = new Map<string, { fatherId: string; motherName: string | null; children: OrderedMember[] }>();
  for (const member of ordered) {
    if (!member.father_id || !indiOf.has(member.father_id)) continue;
    const motherName = member.mother_name?.trim() || null;
    const key = `${member.father_id}\u0000${motherName ?? ""}`;
    const family = families.get(key) ?? {
      fatherId: member.father_id,
      motherName,
      children: [],
    };
    family.children.push(member);
    families.set(key, family);
  }

  const lines: string[] = [];
  const nextMotherSeq = { value: ordered.length };

  lines.push("0 HEAD");
  lines.push("1 SOUR REFAD");
  lines.push(`2 NAME ${siteName}`);
  lines.push("1 GEDC");
  lines.push("2 VERS 5.5.1");
  lines.push("2 FORM LINEAGE-LINKED");
  lines.push("1 CHAR UTF-8");
  lines.push(`1 DATE ${gedcomDate(new Date().toISOString().slice(0, 10))}`);

  const famIdOf = new Map<string, string>();
  [...families.keys()].forEach((key, i) => famIdOf.set(key, `F${i + 1}`));

  /** Which family a member belongs to as a child. */
  const famcOf = new Map<string, string>();
  for (const [key, family] of families) {
    for (const child of family.children) famcOf.set(child.id, famIdOf.get(key)!);
  }

  /** Which families a member heads as a father. */
  const famsOf = new Map<string, string[]>();
  for (const [key, family] of families) {
    const list = famsOf.get(family.fatherId) ?? [];
    list.push(famIdOf.get(key)!);
    famsOf.set(family.fatherId, list);
  }

  for (const member of ordered) {
    lines.push(`0 @${indiOf.get(member.id)}@ INDI`);
    lines.push(`1 NAME ${member.full_name} //`);
    lines.push(`1 SEX ${member.gender === "female" ? "F" : "M"}`);

    const birth = gedcomDate(member.birth_date);
    if (birth) {
      lines.push("1 BIRT");
      lines.push(`2 DATE ${birth}`);
    }

    if (!member.is_living) {
      const death = gedcomDate(member.death_date);
      if (death) {
        lines.push("1 DEAT");
        lines.push(`2 DATE ${death}`);
      } else {
        // "Y" asserts the death without claiming a date for it.
        lines.push("1 DEAT Y");
      }
    }

    const famc = famcOf.get(member.id);
    if (famc) lines.push(`1 FAMC @${famc}@`);
    for (const fams of famsOf.get(member.id) ?? []) lines.push(`1 FAMS @${fams}@`);
  }

  // Mothers who are named get a record of their own, after the members.
  const motherIndiOf = new Map<string, string>();
  for (const [key, family] of families) {
    if (!family.motherName) continue;
    nextMotherSeq.value += 1;
    const id = `I${nextMotherSeq.value}`;
    motherIndiOf.set(key, id);
    lines.push(`0 @${id}@ INDI`);
    lines.push(`1 NAME ${family.motherName} //`);
    lines.push("1 SEX F");
    lines.push(`1 FAMS @${famIdOf.get(key)}@`);
  }

  for (const [key, family] of families) {
    lines.push(`0 @${famIdOf.get(key)}@ FAM`);
    const husband = indiOf.get(family.fatherId);
    if (husband) lines.push(`1 HUSB @${husband}@`);
    const wife = motherIndiOf.get(key);
    if (wife) lines.push(`1 WIFE @${wife}@`);
    for (const child of family.children) lines.push(`1 CHIL @${indiOf.get(child.id)}@`);
  }

  lines.push("0 TRLR");

  // GEDCOM lines are CRLF-terminated, including the last one.
  return lines.join("\r\n") + "\r\n";
}
