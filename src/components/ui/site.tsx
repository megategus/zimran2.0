import { ChevronRight, Wrench } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Spotlight } from "./button-2";

// Condensed display headline (landing reference style). Set the color separately.
export const headline = "font-display font-extrabold [font-stretch:75%] tracking-[-0.01em]";

// Small red square with an arrow, followed by a red label.
export function ArrowLink({ children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className="group inline-flex items-center gap-3 type-body font-semibold text-brand">
      <span className="size-7 shrink-0 bg-brand text-on-brand flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 relative overflow-hidden [--glow:color-mix(in_srgb,var(--on-brand)_55%,transparent)]">
        <Spotlight listen={2} />
        <ChevronRight size={16} aria-hidden className="relative" />
      </span>
      {children}
    </Link>
  );
}

// Same look as ArrowLink, as a button.
export function ArrowButton({ children, className = "", ...rest }: ComponentProps<"button">) {
  return (
    <button type="button" {...rest} className={`group inline-flex items-center gap-3 type-body font-semibold text-brand cursor-pointer disabled:text-ink-muted disabled:cursor-not-allowed ${className}`}>
      <span className="size-9 shrink-0 bg-brand text-on-brand flex items-center justify-center transition-transform duration-200 group-enabled:group-hover:translate-x-1 group-disabled:bg-line-strong relative overflow-hidden [--glow:color-mix(in_srgb,var(--on-brand)_55%,transparent)]">
        <Spotlight listen={2} />
        <ChevronRight size={18} aria-hidden className="relative" />
      </span>
      {children}
    </button>
  );
}

type NavLink ={ href: string; label: string };

// Thin top bar: links left and right, centered logo with a red underline. Left links hide on phones.
export function SiteNav({ left, right }: { left: NavLink[]; right: NavLink[] }) {
  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line py-5 type-caption text-ink-muted">
      <div className="flex gap-6 md:gap-16">
        {left.map((n) => <Link key={n.label} href={n.href} className="hidden sm:inline hover:text-ink">{n.label}</Link>)}
      </div>
      <Link href="/" className="flex flex-col items-center gap-1 text-ink" aria-label="Wrenchly home">
        <span className="flex items-center gap-2">
          <Wrench size={18} className="text-brand" aria-hidden />
          <span className={`${headline} text-[18px] uppercase tracking-[0.12em] [font-stretch:100%]`}>Wrenchly</span>
        </span>
        <span className="h-0.5 w-10 bg-brand" />
      </Link>
      <div className="flex justify-end gap-4 sm:gap-6 md:gap-16">
        {right.map((n) => <Link key={n.label} href={n.href} className="whitespace-nowrap hover:text-ink">{n.label}</Link>)}
      </div>
    </nav>
  );
}
