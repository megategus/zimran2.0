import Link from "next/link";
import type { ComponentProps } from "react";
import { Spotlight } from "./button-2";

// Spec: docs/design/components/Button/README.md. One primary per screen.
// Look from the button-2 snippet: gradient fill, 2px border, cursor-following glow (Spotlight), in theme tokens.
export type ButtonVariant = "primary" | "secondary" | "pro";

const base =
  "relative isolate overflow-hidden inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md border-2 type-label text-[14px] leading-none cursor-pointer " +
  "transition-[transform,box-shadow] duration-120 ease-out active:translate-y-1 active:shadow-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "disabled:bg-none disabled:bg-surface-sunken disabled:text-ink-muted disabled:shadow-none disabled:border-transparent disabled:cursor-not-allowed disabled:active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-linear-to-r from-brand to-brand-press border-brand-press text-on-brand shadow-press-brand [--glow:color-mix(in_srgb,var(--on-brand)_45%,transparent)]",
  secondary: "bg-surface text-ink border-line-strong shadow-press-neutral [--glow:color-mix(in_srgb,var(--brand)_22%,transparent)]",
  pro: "bg-linear-to-r from-plate to-ink-muted border-plate text-on-plate shadow-press-neutral [--glow:color-mix(in_srgb,var(--on-plate)_35%,transparent)]",
};

export function buttonClass(variant: ButtonVariant = "primary", full = false) {
  return `${base} ${variants[variant]} ${full ? "w-full" : ""}`;
}

type Common = { variant?: ButtonVariant; full?: boolean };

const Label = ({ children }: { children: React.ReactNode }) => <span className="relative z-10 inline-flex items-center gap-2">{children}</span>;

export function Button({ variant = "primary", full, className = "", children, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={`${buttonClass(variant, full)} ${className}`} {...rest}>
      <Spotlight />
      <Label>{children}</Label>
    </button>
  );
}

export function ButtonLink({ variant = "primary", full, className = "", children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={`${buttonClass(variant, full)} ${className}`} {...rest}>
      <Spotlight />
      <Label>{children}</Label>
    </Link>
  );
}
