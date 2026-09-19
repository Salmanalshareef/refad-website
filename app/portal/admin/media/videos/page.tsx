import { getVideos } from "@/lib/data/videos";
import { VideoForm } from "@/components/admin/VideoForm";
import { VideoRow } from "@/components/admin/VideoRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminVideosPage() {
  const videos = await getVideos().catch(() => null);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة فيديو جديد</h2>
        <VideoForm />
      </div>

      <div className="space-y-3">
        {videos === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {videos?.length === 0 && <EmptyState message="لا توجد فيديوهات بعد." />}
        {videos?.map((video) => (
          <VideoRow key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
