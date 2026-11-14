import { Card } from "@/components/ui/primitives";
import type { CardKind, Lesson } from "@/lib/types";

const EYEBROW: Record<CardKind, string> = { what: "WHAT IT IS", how: "HOW IT WORKS", breaks: "WHAT BREAKS", fix: "DIY OR SHOP" };

// Spec: docs/design/components/LessonCard/README.md
export function LessonCard({ card, carLine, costs }: { card: Lesson["cards"][number]; carLine: string; costs?: Lesson["costs"] }) {
  return (
    <Card className="flex flex-col gap-3">
      <span className="type-label text-[12px] text-brand">{EYEBROW[card.kind]}</span>
      <h2 className="type-h2">{card.heading}</h2>
      <p className="type-caption text-ink-muted">{carLine}</p>
      <p className="type-body-lg max-w-[65ch] whitespace-pre-line">{card.body}</p>
      {costs && (
        <div className="bg-surface-sunken rounded-md p-3 flex flex-col gap-1">
          <p className="type-data text-amber-ink">DIY: {costs.diy}</p>
          <p className="type-data text-amber-ink">Shop: {costs.shop}</p>
          <p className="type-caption text-ink-muted">Estimate, varies by region.</p>
        </div>
      )}
    </Card>
  );
}
