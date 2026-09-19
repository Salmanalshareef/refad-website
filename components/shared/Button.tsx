import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-brand-hover focus-visible:outline-primary-600",
  secondary:
    "bg-gold-400 text-primary-900 hover:bg-gold-500 focus-visible:outline-gold-500",
  outline:
    "border border-primary-600 text-primary-700 hover:bg-primary-50 focus-visible:outline-primary-600",
  ghost: "text-primary-700 hover:bg-primary-50 focus-visible:outline-primary-600",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
