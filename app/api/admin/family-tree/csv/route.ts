import { requireAdmin } from "@/lib/auth";
import { getFamilyMembers } from "@/lib/data/family-tree";
import { toCsv } from "@/lib/family-tree-export";

/**
 * The tree as a parent-ID table: Visio's Data Visualizer and Excel both build
 * the diagram from this shape rather than from a drawing.
 */
export async function GET() {
  await requireAdmin();

  const members = await getFamilyMembers();
  const csv = toCsv(members);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="refad-family-tree.csv"`,
    },
  });
}
