import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { SnapchatIcon, WhatsAppIcon, XIcon } from "@/components/shared/SocialIcons";

const contactDetails = [
  { icon: Phone, label: "رقم التواصل", value: "+966 55 294 2361", href: "tel:+966552942361" },
  {
    icon: Mail,
    label: "البريد الإلكتروني",
    value: "almojebfamily@gmail.com",
    href: "mailto:almojebfamily@gmail.com",
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
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-800 text-primary-100 transition-colors hover:bg-primary-700 hover:text-white"
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

      <div className="border-t border-primary-800 py-3 text-center text-xs text-primary-300">
        © {new Date().getFullYear()} أسرة آل معجب – صندوق رفاد. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
