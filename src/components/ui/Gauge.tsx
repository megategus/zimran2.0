import type { ReactNode } from "react";

// Notched speedometer. Angles in degrees, clockwise from 3 o'clock; 148 → 392 sweeps over the top.
export function Gauge({
  value,
  label,
  center,
  startAngle = 148,
  endAngle = 392,
  totalNotches = 72,
  notchLengthPercent = 34,
  inactiveFillOpacity = 0.7,
  size = 120,
  instant = false,
}: {
  value: number; // 0..100
  label: string;
  center?: ReactNode;
  startAngle?: number;
  endAngle?: number;
  totalNotches?: number;
  notchLengthPercent?: number;
  inactiveFillOpacity?: number;
  size?: number;
  instant?: boolean; // skip transitions (used to snap the needle back to zero on level-up)
}) {
  const v = Math.min(100, Math.max(0, value));
  const R = 46, C = 50, inner = R * (1 - notchLengthPercent / 100);
  const at = (deg: number, rad: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: C + rad * Math.cos(a), y: C + rad * Math.sin(a) };
  };
  const angleOf = (pct: number) => startAngle + ((endAngle - startAngle) * pct) / 100;

  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} className="relative shrink-0" style={{ width: size, height: size * 0.8 }}>
      <svg viewBox="0 0 100 80" width={size} height={size * 0.8} aria-hidden strokeLinecap="round">
        {Array.from({ length: totalNotches }, (_, i) => {
          const pct = (i / (totalNotches - 1)) * 100;
          const a = at(angleOf(pct), R), b = at(angleOf(pct), inner);
          const on = pct <= v;
          // Notches fill in a sweep when the value changes (staggered transition).
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={1.6} stroke={on ? "var(--amber)" : "var(--line-strong)"} strokeOpacity={on ? 1 : inactiveFillOpacity} style={{ transition: instant ? "none" : `stroke 200ms ease ${i * 8}ms` }} />;
        })}
        {/* Needle drawn pointing right, rotated into place so value changes animate. */}
        <line x1={C} y1={C} x2={C + inner - 4} y2={C} stroke="var(--ink)" strokeWidth={2.4} style={{ transform: `rotate(${angleOf(v)}deg)`, transformOrigin: `${C}px ${C}px`, transition: instant ? "none" : "transform 900ms cubic-bezier(.34,1.56,.64,1)" }} />
        <circle cx={C} cy={C} r={3.2} fill="var(--ink)" />
      </svg>
      {/* Center content sits in the open gap under the needle hub. */}
      {center && <div className="absolute inset-x-0 flex justify-center leading-none" style={{ top: size * 0.56 }}>{center}</div>}
    </div>
  );
}
