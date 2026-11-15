import { Check, ExternalLink } from "lucide-react";
import { Tag } from "@/components/ui/primitives";
import { headline } from "@/components/ui/site";
import { plainComponent, RECALL_CHECK_URL, recallHeadline, shortSummary, sortRecalls } from "@/lib/recalls";
import type { Car, Recall } from "@/lib/types";

// Spec: docs/design/components/CarCard/README.md. Ruled spec table, landing reference style.
export function CarCard({ car }: { car: Car }) {
  const rows: [string, string][] = [
    ...(car.vin ? [["VIN", car.vin] as [string, string]] : []),
    ...(car.trim ? [["Trim", car.trim] as [string, string]] : []),
    ...(car.engine ? [["Engine", car.engine] as [string, string]] : []),
    ...Object.entries(car.specs).slice(0, 4),
  ];
  return (
    <div className="flex flex-col gap-6">
      {rows.length > 0 && (
        <dl className="flex flex-col">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
              <dt className="type-label text-[11px] text-ink-muted">{k}</dt>
              <dd className="type-data text-ink text-right break-all">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <Recalls recalls={car.recalls} vin={car.vin} />
      <p className="type-caption text-ink-muted">Specs and recalls from NHTSA.</p>
    </div>
  );
}

const SHOWN = 3;

// NHTSA lists recalls per model and year, not per car: say so, show the most serious few, keep the rest folded.
function Recalls({ recalls, vin }: { recalls: Recall[]; vin: string | null }) {
  const sorted = sortRecalls(recalls);
  const item = (r: Recall) => (
    <li key={r.campaign} className="border-l-4 border-brake bg-brake-soft p-3 flex flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2">
        <Tag tone="brake">RECALL</Tag>
        <span className="type-body font-semibold text-ink">{plainComponent(r.component)}</span>
      </span>
      <span className="type-body text-ink">{shortSummary(r.summary)}</span>
      <span className="type-caption text-ink-muted">Campaign {r.campaign}</span>
    </li>
  );
  return (
    <div className="flex flex-col gap-3">
      <h3 className={`${headline} text-[28px] leading-none text-ink flex items-center gap-3`}>
        {recalls.length === 0 ? (
          <span className="size-8 rounded-full bg-brand text-on-brand flex items-center justify-center"><Check size={18} aria-hidden /></span>
        ) : (
          <span className="text-brand">{recalls.length}</span>
        )}
        {recalls.length === 0 ? recallHeadline(0) : recallHeadline(recalls.length).replace(/^\d+ /, "")}
      </h3>
      {recalls.length > 0 && (
        <>
          <p className="type-body text-ink-muted">
            These cover every car of this model and year. Yours may already be fixed. A dealer fixes open recalls for free.
          </p>
          <a href={RECALL_CHECK_URL} target="_blank" rel="noopener noreferrer" className="self-start inline-flex items-center gap-2 type-body font-semibold text-brand underline underline-offset-4">
            Check {vin ? "your VIN" : "your car"} on nhtsa.gov <ExternalLink size={16} aria-hidden />
          </a>
          <ul className="flex flex-col gap-2">{sorted.slice(0, SHOWN).map(item)}</ul>
          {sorted.length > SHOWN && (
            <details className="group">
              <summary className="cursor-pointer type-body font-semibold text-ink underline underline-offset-4 list-none [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show all {sorted.length} recalls</span>
                <span className="hidden group-open:inline">Show fewer</span>
              </summary>
              <ul className="flex flex-col gap-2 pt-2">{sorted.slice(SHOWN).map(item)}</ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
