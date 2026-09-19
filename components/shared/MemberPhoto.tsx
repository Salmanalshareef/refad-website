import Image from "next/image";
import { User } from "lucide-react";

/**
 * Renders a board member's uploaded photo (JPEG/PNG/WebP, stored in Vercel
 * Blob — see app/actions/admin/board.ts). Falls back to a generic user icon
 * when no photo has been uploaded yet.
 */
export function MemberPhoto({
  src,
  size = 40,
  className,
}: {
  src?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${src ? "image-plate" : "bg-primary-50 text-primary-700"} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          width={size}
          height={size}
          unoptimized
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <User style={{ width: size * 0.5, height: size * 0.5 }} />
      )}
    </div>
  );
}
