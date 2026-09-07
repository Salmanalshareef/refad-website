import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { FundSubNav } from "@/components/refad-fund/FundSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getBoardMembers } from "@/lib/data/board";
import { MemberPhoto } from "@/components/shared/MemberPhoto";

export default async function BoardOfTrusteesPage() {
  const members = await getBoardMembers().catch(() => null);

  return (
    <>
      <PageHeader eyebrow="صندوق رفاد" title="مجلس الأمناء" />
      <FundSubNav />

      <Section>
        {members === null && (
          <EmptyState message="تعذر تحميل بيانات مجلس الأمناء. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {members?.length === 0 && (
          <EmptyState message="لم تتم إضافة أعضاء مجلس الأمناء بعد." />
        )}
        {members && members.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {members.map((member, index) => (
              <Reveal
                key={member.id}
                delay={index * 100}
                className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <MemberPhoto src={member.photo_url} size={80} className="mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-primary-900">
                    {member.full_name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-gold-600">
                    {member.role_title}
                  </p>
                  {member.bio && (
                    <p className="mt-3 text-sm text-neutral-600">{member.bio}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
