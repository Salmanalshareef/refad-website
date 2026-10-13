import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SnapchatIcon, WhatsAppIcon, XIcon } from "@/components/shared/SocialIcons";

const contactDetails = [
  { icon: Phone, label: "رقم التواصل", value: "+966 55 294 2361", href: "tel:+966552942361" },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "info@refad.sa",
    href: "mailto:info@refad.sa",
  },
  { icon: MapPin, label: "العنوان", value: "الرياض، المملكة العربية السعودية", href: undefined },
];

const socialLinks = [
  { label: "X", href: "https://x.com/almojebfamily", Icon: XIcon },
  { label: "Snapchat", href: "https://www.snapchat.com/add/almojebfamily", Icon: SnapchatIcon },
  { label: "WhatsApp", href: "https://wa.me/966552942361", Icon: WhatsAppIcon },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-primary-900 text-primary-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:grid-cols-2">
        <div>
          <div className="flex items-center">
            <Image
              src="/logo-website.png"
              alt="عائلة آل معجب"
              width={90}
              height={90}
              className="h-[90px] w-[90px] object-contain"
            />
          </div>

          <h3 className="mb-2 mt-4 text-sm font-semibold text-white">
            تابعنا على منصات التواصل
          </h3>
          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-800 sm:h-8 sm:w-8 text-primary-100 transition-colors hover:bg-brand-hover hover:text-white"
              >
                <social.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-base font-bold text-white">تواصل معنا</h3>
          <ul className="space-y-2 text-sm">
            {contactDetails.map((detail) => (
              <li key={detail.label} className="flex items-start gap-2">
                <detail.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs text-primary-300">{detail.label}</p>
                  {detail.href ? (
                    <a href={detail.href} dir="ltr" className="inline-block hover:text-white">
                      {detail.value}
                    </a>
                  ) : (
                    <p>{detail.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The policy link shares the copyright row rather than sitting in a bar
          of its own. In RTL the first child lands on the right, so the link is
          on the reading side and the copyright trails it. Below sm they stack
          and centre, because side by side they would wrap mid-sentence. */}
      <div className="border-t border-primary-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-3 text-xs text-primary-300 sm:flex-row sm:justify-between">
          <Link
            href="/privacy-policy"
            className="rounded transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
          >
            سياسة الخصوصية
          </Link>
          <p>
            © {new Date().getFullYear()} أسرة آل معجب – صندوق رفاد. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
