import { Check } from "lucide-react";
import { Tag } from "@/components/ui/primitives";
import { headline } from "@/components/ui/site";
import type { Car } from "@/lib/types";

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
      <div className="flex flex-col gap-3">
        {car.recalls.length === 0 ? (
          <h3 className={`${headline} text-[28px] leading-none text-ink flex items-center gap-3`}>
            <span className="size-8 rounded-full bg-brand text-on-brand flex items-center justify-center"><Check size={18} aria-hidden /></span>
            No open recalls
          </h3>
        ) : (
          <h3 className={`${headline} text-[28px] leading-none text-ink`}>
            <span className="text-brand">{car.recalls.length}</span> open recall{car.recalls.length === 1 ? "" : "s"}
          </h3>
        )}
        {car.recalls.length > 0 && (
          <ul className="flex flex-col">
            {car.recalls.map((r) => (
              <li key={r.campaign} className="border-l-4 border-brake bg-brake-soft p-3 flex flex-col gap-1 mb-2">
                <span className="flex items-center gap-2">
                  <Tag tone="brake">RECALL</Tag>
                  <span className="type-data">{r.campaign}</span>
                </span>
                <span className="type-label text-[12px]">{r.component}</span>
                <span className="type-body">{r.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="type-caption text-ink-muted">Specs and recalls from NHTSA.</p>
    </div>
  );
}
