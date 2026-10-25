import { Users } from "lucide-react";
import type { Gender, SpouseRelation } from "@/types/db";

type Relative = {
  id: string;
  full_name: string;
  gender?: Gender;
  is_living?: boolean;
  /** Spouses only: whether this person is the husband or the wife. */
  relation?: SpouseRelation;
};

function Card({
  title,
  count,
  emptyMessage,
  people,
  labelFor,
}: {
  title: string;
  count: number;
  emptyMessage: string;
  people: Relative[];
  labelFor: (person: Relative) => string;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-primary-900">{title}</h2>
        {count > 0 && (
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            {count}
          </span>
        )}
      </div>

      {people.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3"
            >
              <span className="min-w-0 text-sm font-medium text-neutral-800">
                {person.full_name}
              </span>
              <span className="shrink-0 text-xs text-neutral-500">
                {labelFor(person)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * The member's immediate family, read only.
 *
 * Nothing here is editable. These records belong to the family tree, which the
 * fund's administrators maintain — a member correcting their own copy would
 * put the two out of step, and the tree is the one that has to stay right.
 */
export function MyFamilyCards({
  offspring,
  spouses,
  isLinked,
}: {
  /** Named offspring rather than children: "children" is reserved in JSX. */
  offspring: Relative[];
  spouses: Relative[];
  /** False when no tree record could be matched to this account. */
  isLinked: boolean;
}) {
  if (!isLinked) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700">
          لم يتم ربط حسابك بسجلك في شجرة الأسرة بعد.
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
          يتم الربط عن طريق رقم الهوية الوطنية. تواصل مع إدارة الصندوق لاستكمال
          الربط، وستظهر بيانات أسرتك هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="الأزواج / الزوجات"
        count={spouses.length}
        people={spouses}
        emptyMessage="لم تُسجَّل بيانات الأزواج أو الزوجات في شجرة الأسرة بعد."
        // Reads the stated relation. It used to check person.gender, which a
        // spouse never has, so every entry came out "زوج".
        labelFor={(person) => (person.relation === "husband" ? "زوج" : "زوجة")}
      />

      <Card
        title="الأبناء والبنات"
        count={offspring.length}
        people={offspring}
        emptyMessage="لا يوجد أبناء مسجلون في شجرة الأسرة."
        labelFor={(person) => (person.gender === "female" ? "ابنة" : "ابن")}
      />

      <p className="text-xs leading-relaxed text-neutral-500">
        هذه البيانات معروضة للاطلاع فقط، ومصدرها شجرة الأسرة. لتعديلها أو إضافة
        فرد، تواصل مع إدارة الصندوق.
      </p>
    </div>
  );
}
