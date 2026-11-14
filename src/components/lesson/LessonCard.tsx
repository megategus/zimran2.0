import { headline } from "@/components/ui/site";
import type { CardKind, Lesson } from "@/lib/types";

const EYEBROW: Record<CardKind, string> = { what: "WHAT IT IS", how: "HOW IT WORKS", breaks: "WHAT BREAKS", fix: "DIY OR SHOP" };

// Spec: docs/design/components/LessonCard/README.md. Landing reference style: big step number, condensed heading, no box.
export function LessonCard({ card, carLine, costs, n, total }: { card: Lesson["cards"][number]; carLine: string; costs?: Lesson["costs"]; n: number; total: number }) {
  return (
    <article className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <span className={`${headline} text-brand text-[44px] leading-none`}>{String(n).padStart(2, "0")}</span>
        <span className="type-label text-[12px] text-ink-muted">/ {String(total).padStart(2, "0")} · {EYEBROW[card.kind]}</span>
      </div>
      <h2 className={`${headline} text-ink text-[40px] leading-[0.95] md:text-[56px]`}>{card.heading}</h2>
      <p className="type-caption text-ink-muted">{carLine}</p>
      <p className="type-body-lg text-ink max-w-[65ch] whitespace-pre-line">{card.body}</p>
      {costs && (
        <div className="grid grid-cols-2 border-y border-line">
          {([["DIY", costs.diy], ["Shop", costs.shop]] as const).map(([label, value], i) => (
            <div key={label} className={`flex flex-col gap-2 py-5 ${i ? "pl-5 border-l border-line" : "pr-5"}`}>
              <span className="type-label text-[11px] text-ink-muted">{label}</span>
              <span className={`${headline} text-brand text-[22px] leading-tight md:text-[26px]`}>{value}</span>
            </div>
          ))}
          <p className="col-span-2 type-caption text-ink-muted pb-3">Estimate, varies by region.</p>
        </div>
      )}
    </article>
  );
}
