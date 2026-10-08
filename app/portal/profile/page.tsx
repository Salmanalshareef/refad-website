import { getCurrentUser, requireProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/portal/ProfileForm";
import { ChangePasswordCard } from "@/components/portal/ChangePasswordCard";

export default async function ProfilePage() {
  const [profile, user] = await Promise.all([requireProfile(), getCurrentUser()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-neutral-600">
          عرض وتحديث بياناتك الشخصية.
        </p>
      </div>

      {/* RTL: the first column sits on the right, so the password card landing
          second puts it on the left as asked. */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        </div>

        <ChangePasswordCard />
      </div>
    </div>
  );
}
