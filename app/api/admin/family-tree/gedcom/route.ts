import { requireAdmin } from "@/lib/auth";
import { getFamilyMembers } from "@/lib/data/family-tree";
import { toGedcom } from "@/lib/family-tree-export";

/**
 * The tree as GEDCOM, which genealogy software reads and which will outlast
 * this application — the point of holding a copy in a standard format.
 */
export async function GET() {
  await requireAdmin();

  const members = await getFamilyMembers();
  const gedcom = toGedcom(members, "صندوق رفاد — أسرة آل معجب");

  return new Response(gedcom, {
    headers: {
      // x-gedcom is what the format registered; text/plain keeps browsers
      // from trying to render it.
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="refad-family-tree.ged"`,
    },
  });
}
