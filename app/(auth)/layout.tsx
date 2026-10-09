import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // public-shell: these pages are reached from the public header and link back
  // to the home page, so they wear the public palette rather than the portal's.
  return (
    <main className="public-shell flex flex-1 flex-col items-center justify-center bg-neutral-100 px-4 py-8 sm:px-6 sm:py-16">
      <Link href="/" className="mb-6 flex items-center justify-center sm:mb-8">
        <Image
          src="/logo-portal.png"
          alt="صندوق رفاد"
          width={360}
          height={240}
          className="h-32 w-auto object-contain sm:h-[240px]"
          priority
        />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </main>
  );
}
