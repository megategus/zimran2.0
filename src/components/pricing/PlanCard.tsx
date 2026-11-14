import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/primitives";
import { headline } from "@/components/ui/site";

// Spec: docs/design/components/PlanCard/README.md. Always shown as a monthly + yearly pair.
export type PlanCardProps = {
  name: string;
  price: string;
  period: string;
  savings?: string;
  note?: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  busy?: boolean;
  disabled?: boolean;
  onChoose: () => void;
};

export function PlanCard({ name, price, period, savings, note, features, highlighted, cta, busy, disabled, onChoose }: PlanCardProps) {
  return (
    <div className={`rounded-lg p-6 flex flex-col gap-3 border ${highlighted ? "bg-plate text-on-plate border-plate" : "bg-surface border-line"}`}>
      <h2 className={`${headline} text-[28px] leading-none flex flex-wrap items-center gap-2`}>
        {name}
        {savings && <Tag tone="amber">{savings}</Tag>}
      </h2>
      <div>
        <span className={`${headline} text-[48px] leading-none ${highlighted ? "" : "text-brand"}`}>{price}</span> <span className="type-caption">/ {period}</span>
      </div>
      {note && <p className={`type-caption ${highlighted ? "" : "text-ink-muted"}`}>{note}</p>}
      <ul className="flex flex-col gap-2 text-[14px] leading-5">
        {features.slice(0, 3).map((f) => (
          <li key={f} className="flex gap-2">
            <Check size={20} strokeWidth={2} aria-hidden className={`shrink-0 ${highlighted ? "" : "text-brand"}`} />
            {f}
          </li>
        ))}
      </ul>
      <Button variant={highlighted ? "primary" : "secondary"} full className="mt-auto" onClick={onChoose} disabled={disabled}>
        {busy ? "Opening checkout…" : cta}
      </Button>
    </div>
  );
}
