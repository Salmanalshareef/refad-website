import { getCurrentUser, requireProfile } from "@/lib/auth";
import { findSelfFamilyMemberId, getImmediateFamily } from "@/lib/data/family-tree";
import { ProfileForm } from "@/components/portal/ProfileForm";
import { ChangePasswordCard } from "@/components/portal/ChangePasswordCard";
import { MyFamilyCards } from "@/components/portal/MyFamilyCards";
import { ProfileTabs } from "@/components/portal/ProfileTabs";

export default async function ProfilePage() {
  const [profile, user] = await Promise.all([requireProfile(), getCurrentUser()]);

  // The account reaches the tree either by an explicit link or by a national
  // ID that matches exactly one record; an ambiguous one resolves to nothing
  // rather than attaching the wrong family to someone.
  const familyMemberId = await findSelfFamilyMemberId(profile).catch(() => null);
  const family = familyMemberId
    ? await getImmediateFamily(familyMemberId).catch(() => null)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">حسابي</h1>
        <p className="mt-1 text-sm text-neutral-600">
          بياناتك الشخصية وأسرتك وإعدادات الدخول.
        </p>
      </div>

      <ProfileTabs
        tabs={[
          {
            id: "profile",
            label: "الملف الشخصي",
            content: (
              <ProfileForm
                memberNumber={profile.member_number}
                fullName={profile.full_name}
                phone={profile.phone}
                nationalId={profile.national_id}
                email={user?.email}
                birthDate={profile.birth_date}
                maritalStatus={profile.marital_status}
                educationLevel={profile.education_level}
                employmentStatus={profile.employment_status}
                avatarUrl={profile.avatar_url}
                showBirthDate={profile.show_birth_date}
              />
            ),
          },
          {
            id: "family",
            label: "عائلتي",
            content: (
              <MyFamilyCards
                isLinked={Boolean(familyMemberId)}
                offspring={family?.children ?? []}
                spouses={family?.spouses ?? []}
              />
            ),
          },
          {
            id: "password",
            label: "تغيير كلمة المرور",
            content: <ChangePasswordCard />,
          },
        ]}
      />
    </div>
  );
}
