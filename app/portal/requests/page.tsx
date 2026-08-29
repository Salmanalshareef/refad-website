import Image from "next/image";
import { requireProfile } from "@/lib/auth";
import {
  getMyMemberRequests,
  memberRequestStatusLabels,
  memberRequestStatusStyles,
  memberRequestTypeLabels,
} from "@/lib/data/member-requests";
import { MemberRequestForm } from "@/components/portal/MemberRequestForm";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function MemberRequestsPage() {
  const profile = await requireProfile();
  const myRequests = await getMyMemberRequests(profile.id).catch(() => null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">طلباتي</h1>
        <p className="mt-1 text-sm text-neutral-600">
          أرسل طلبًا للإدارة — إضافة خبر، إضافة فرد للعائلة غير مسجل، أو أي طلب آخر.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-bold text-primary-900">إرسال طلب جديد</h2>
          <MemberRequestForm applicantFullName={profile.full_name} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold text-primary-900">طلباتي السابقة</h2>
          {myRequests === null && <EmptyState message="تعذر تحميل طلباتك السابقة." />}
          {myRequests?.length === 0 && (
            <EmptyState message="لم تقم بإرسال أي طلبات بعد." />
          )}
          {myRequests && myRequests.length > 0 && (
            <div className="space-y-3">
              {myRequests.map((request) => (
                <Card key={request.id}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-primary-900">
                      {memberRequestTypeLabels[request.type]}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${memberRequestStatusStyles[request.status]}`}
                    >
                      {memberRequestStatusLabels[request.status]}
                    </span>
                  </div>
                  {request.type === "family_member" ? (
                    <div className="mt-2 space-y-1 text-sm text-neutral-600">
                      <p>
                        الاسم: {[request.first_name, request.second_name, request.third_name, request.fourth_name]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p dir="ltr">رقم الهوية: {request.national_id}</p>
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-neutral-600">{request.details}</p>
                      {request.image_url && (
                        <a
                          href={request.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block"
                        >
                          <Image
                            src={request.image_url}
                            alt=""
                            width={80}
                            height={80}
                            unoptimized
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        </a>
                      )}
                    </>
                  )}
                  {request.admin_comment && (
                    <p
                      className={`mt-3 rounded-lg p-3 text-sm ${
                        request.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-neutral-50 text-neutral-700"
                      }`}
                    >
                      <span className="font-semibold">ملاحظة الإدارة: </span>
                      {request.admin_comment}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
