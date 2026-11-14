import Link from "next/link";
import type { ComponentProps } from "react";

// Spec: docs/design/components/Button/README.md. One primary per screen.
export type ButtonVariant = "primary" | "secondary" | "pro";

const base =
  "inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md type-label text-[14px] leading-none cursor-pointer " +
  "transition-[transform,box-shadow] duration-120 ease-out active:translate-y-1 active:shadow-none " +
  "disabled:bg-surface-sunken disabled:text-ink-muted disabled:shadow-none disabled:border-0 disabled:cursor-not-allowed disabled:active:translate-y-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-press-brand",
  secondary: "bg-surface text-ink border-2 border-line-strong shadow-press-neutral",
  pro: "bg-plate text-on-plate shadow-press-neutral",
};

export function buttonClass(variant: ButtonVariant = "primary", full = false) {
  return `${base} ${variants[variant]} ${full ? "w-full" : ""}`;
}

type Common = { variant?: ButtonVariant; full?: boolean };

export function Button({ variant = "primary", full, className = "", ...rest }: Common & ComponentProps<"button">) {
  return <button className={`${buttonClass(variant, full)} ${className}`} {...rest} />;
}

export function ButtonLink({ variant = "primary", full, className = "", ...rest }: Common & ComponentProps<typeof Link>) {
  return <Link className={`${buttonClass(variant, full)} ${className}`} {...rest} />;
}
