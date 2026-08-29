import { getCurrentUser, requireProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/portal/ProfileForm";

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

      <ProfileForm
        fullName={profile.full_name}
        phone={profile.phone}
        nationalId={profile.national_id}
        email={user?.email}
        birthDate={profile.birth_date}
      />
    </div>
  );
}
