import type { ReactNode } from "react";

// Spec: docs/design/components/PartArt/README.md. Flat 96x96 SVG, 3px ink outline, token fills only.
export type PartKey =
  | "rotor" | "caliper" | "pads" | "wheel" | "dipstick" | "oil-filter"
  | "battery" | "spark-plug" | "coolant" | "shock" | "gear" | "ev-plug";

export const PART_KEYS: PartKey[] = [
  "rotor", "caliper", "pads", "wheel", "dipstick", "oil-filter",
  "battery", "spark-plug", "coolant", "shock", "gear", "ev-plug",
];

const s = "stroke-ink [stroke-width:3] [stroke-linejoin:round] [stroke-linecap:round]";
const l = "fill-none stroke-ink [stroke-width:2] [stroke-linecap:round]";
const F = {
  brand: `fill-brand ${s}`, amber: `fill-amber ${s}`, brake: `fill-brake ${s}`, plate: `fill-plate ${s}`,
  surf: `fill-surface ${s}`, sunk: `fill-surface-sunken ${s}`,
};

const ART: Record<PartKey, ReactNode> = {
  rotor: (
    <>
      <circle className={F.sunk} cx="48" cy="48" r="40" />
      <g className="fill-ink">
        <circle cx="77.4" cy="65" r="3" /><circle cx="48" cy="82" r="3" /><circle cx="18.6" cy="65" r="3" />
        <circle cx="18.6" cy="31" r="3" /><circle cx="48" cy="14" r="3" /><circle cx="77.4" cy="31" r="3" />
      </g>
      <circle className={F.plate} cx="48" cy="48" r="17" />
      <g className="fill-surface">
        <circle cx="59" cy="48" r="2.5" /><circle cx="51.4" cy="58.5" r="2.5" /><circle cx="39.1" cy="54.5" r="2.5" />
        <circle cx="39.1" cy="41.5" r="2.5" /><circle cx="51.4" cy="37.5" r="2.5" />
      </g>
      <circle className="fill-surface" cx="48" cy="48" r="4" />
    </>
  ),
  caliper: (
    <>
      <circle className={F.sunk} cx="28" cy="48" r="38" />
      <circle className={F.plate} cx="28" cy="48" r="14" />
      <rect className={F.brake} x="50" y="18" width="32" height="60" rx="12" />
      <circle className={F.surf} cx="66" cy="32" r="4" /><circle className={F.surf} cx="66" cy="64" r="4" />
      <rect className={F.plate} x="76" y="8" width="7" height="12" rx="2" />
    </>
  ),
  pads: (
    <>
      <rect className={F.plate} x="12" y="22" width="32" height="56" rx="9" />
      <rect className="fill-surface-sunken" x="18" y="29" width="20" height="42" rx="5" />
      <path className={l} d="M22 40h12M22 50h12M22 60h12" />
      <rect className={F.amber} x="40" y="14" width="6" height="14" rx="2" />
      <rect className={F.plate} x="52" y="22" width="32" height="56" rx="9" />
      <rect className="fill-surface-sunken" x="58" y="29" width="20" height="42" rx="5" />
      <path className={l} d="M62 40h12M62 50h12M62 60h12" />
    </>
  ),
  wheel: (
    <>
      <circle className={F.plate} cx="48" cy="48" r="42" />
      <circle className={F.surf} cx="48" cy="48" r="28" />
      <path className="fill-none stroke-line-strong [stroke-width:4] [stroke-linecap:round]" d="M48 48 48 23M48 48 71.8 40.3M48 48 62.7 68.2M48 48 33.3 68.2M48 48 24.2 40.3" />
      <circle className={F.brand} cx="48" cy="48" r="9" />
    </>
  ),
  dipstick: (
    <>
      <rect className={F.sunk} x="44" y="24" width="8" height="66" rx="4" />
      <rect className={F.amber} x="44" y="60" width="8" height="30" rx="4" />
      <path className={l} d="M34 62h8M54 62h8M34 76h8M54 76h8" />
      <circle className={F.brand} cx="48" cy="15" r="10" />
      <circle className="fill-surface" cx="48" cy="15" r="4" />
    </>
  ),
  "oil-filter": (
    <>
      <rect className={F.plate} x="20" y="12" width="56" height="14" rx="5" />
      <rect className={F.brand} x="24" y="26" width="48" height="60" rx="12" />
      <rect className="fill-brand-soft" x="27" y="44" width="42" height="16" />
      <path className={l} d="M34 44v16M44 44v16M54 44v16M64 44v16" />
    </>
  ),
  battery: (
    <>
      <rect className={F.brake} x="22" y="18" width="16" height="12" rx="3" />
      <rect className={F.surf} x="58" y="18" width="16" height="12" rx="3" />
      <rect className={F.plate} x="12" y="30" width="72" height="52" rx="10" />
      <path className={F.amber} d="M52 38 40 58h9l-4 16 14-21h-9l4-15z" />
    </>
  ),
  "spark-plug": (
    <>
      <rect className={F.plate} x="43" y="6" width="10" height="12" rx="3" />
      <rect className={F.surf} x="37" y="18" width="22" height="28" rx="7" />
      <rect className={F.plate} x="30" y="46" width="36" height="13" rx="3" />
      <rect className={F.sunk} x="39" y="59" width="18" height="21" rx="2" />
      <path className={l} d="M39 65h18M39 71h18" />
      <path className={l} d="M48 80v8h8" />
    </>
  ),
  coolant: (
    <>
      <rect className={F.brake} x="36" y="10" width="24" height="14" rx="4" />
      <rect className={F.surf} x="16" y="24" width="64" height="62" rx="12" />
      <path className="fill-brand" d="M19 52h58v22a9 9 0 0 1-9 9H28a9 9 0 0 1-9-9z" />
      <path className={l} d="M62 40h12M62 70h12" />
    </>
  ),
  shock: (
    <>
      <rect className={F.plate} x="40" y="22" width="16" height="58" rx="4" />
      <polyline className="fill-none stroke-brand [stroke-width:5] [stroke-linecap:round] [stroke-linejoin:round]" points="30,26 66,33 30,40 66,47 30,54 66,61 30,68 66,75" />
      <circle className={F.surf} cx="48" cy="13" r="7" />
      <circle className={F.surf} cx="48" cy="86" r="7" />
    </>
  ),
  gear: (
    <>
      <g className={F.plate}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="41" y="8" width="14" height="18" rx="3" transform={`rotate(${a} 48 48)`} />
        ))}
      </g>
      <circle className="fill-plate" cx="48" cy="48" r="27" />
      <circle className={F.amber} cx="48" cy="48" r="11" />
    </>
  ),
  "ev-plug": (
    <>
      <rect className={F.plate} x="33" y="12" width="9" height="18" rx="2" />
      <rect className={F.plate} x="54" y="12" width="9" height="18" rx="2" />
      <path className="fill-none stroke-ink [stroke-width:6] [stroke-linecap:round]" d="M48 72v18" />
      <rect className={F.brand} x="24" y="28" width="48" height="44" rx="16" />
      <path className={F.amber} d="M52 36 41 52h8l-3 12 12-17h-8l2-11z" />
    </>
  ),
};

export function isPartKey(k: string): k is PartKey {
  return (PART_KEYS as string[]).includes(k);
}

// Inline (not <img>) so theme tokens reach the fills. Unknown keys render nothing.
export function PartArt({ part, size = 96, label, className = "" }: { part: string; size?: 48 | 72 | 96; label: string; className?: string }) {
  if (!isPartKey(part)) return null;
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} role="img" aria-label={label} className={`shrink-0 ${className}`}>
      {ART[part]}
    </svg>
  );
}
