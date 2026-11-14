import { Card, Tag } from "@/components/ui/primitives";
import type { Car } from "@/lib/types";

// Spec: docs/design/components/CarCard/README.md
export function CarCard({ car }: { car: Car }) {
  const rows: [string, string][] = [
    ...(car.vin ? [["VIN", car.vin] as [string, string]] : []),
    ...(car.engine ? [["Engine", car.engine] as [string, string]] : []),
    ...Object.entries(car.specs).slice(0, 4),
  ];
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="type-h2">
        {car.year} {car.make} {car.model} {car.trim ?? ""}
      </h2>
      {rows.length > 0 && (
        <dl className="bg-surface-sunken rounded-md p-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="type-label text-[11px] text-ink-muted self-center">{k}</dt>
              <dd className="type-data break-all">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="flex flex-col gap-2">
        <h3 className="type-h3">
          {car.recalls.length} open recall{car.recalls.length === 1 ? "" : "s"}
        </h3>
        {car.recalls.length === 0 ? (
          <p className="type-body text-ink-muted">No open recalls</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {car.recalls.map((r) => (
              <li key={r.campaign} className="bg-brake-soft rounded-md p-3 flex flex-col gap-1">
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
    </Card>
  );
}
