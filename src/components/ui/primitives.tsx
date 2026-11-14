import type { ComponentProps, ReactNode } from "react";

// Surface card: radius-lg, line border, space-4 phone / space-5 desktop padding.
export function Card({ className = "", ...rest }: ComponentProps<"div">) {
  return <div className={`bg-surface border border-line rounded-lg p-4 md:p-6 ${className}`} {...rest} />;
}

export type TagTone = "brand" | "amber" | "brake" | "plate" | "muted";

const tones: Record<TagTone, string> = {
  brand: "bg-brand text-on-brand",
  amber: "bg-amber text-on-amber",
  brake: "bg-brake text-surface",
  plate: "bg-plate text-on-plate",
  muted: "bg-surface-sunken text-ink-muted",
};

// Uppercase label tag (DEMO, RECALL, SAVE 50%, IN 3D LAB).
export function Tag({ tone = "brand", children }: { tone?: TagTone; children: ReactNode }) {
  return <span className={`inline-flex items-center px-2 py-1 rounded-sm type-label text-[11px] leading-[14px] ${tones[tone]}`}>{children}</span>;
}

// value: 0..1. Track surface-sunken, fill brand, 10px pill.
export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2.5 w-full rounded-pill bg-surface-sunken overflow-hidden">
      <div className="h-full rounded-pill bg-brand transition-[width] duration-180 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}
