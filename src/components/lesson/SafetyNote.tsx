import { MapPin, TriangleAlert } from "lucide-react";

// Spec: docs/design/components/SafetyNote/README.md. Never render empty.
// shopQuery: adds a "Find a shop" link (Google Maps search near the viewer) under the warning.
export function SafetyNote({ text, shopQuery }: { text: string | null; shopQuery?: string }) {
  if (!text) return null;
  return (
    <div role="note" className="bg-brake-soft border-l-4 border-brake p-4 flex gap-3">
      <TriangleAlert className="text-brake shrink-0" aria-hidden />
      <div className="flex flex-col gap-1">
        <span className="type-label text-[12px] text-brake">SAFETY</span>
        <p className="type-body text-ink">{text}</p>
        {shopQuery && (
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(`${shopQuery} near me`)}`} target="_blank" rel="noopener noreferrer" className="self-start mt-1 inline-flex items-center gap-1.5 type-body font-semibold text-brake underline underline-offset-4">
            <MapPin size={16} aria-hidden />
            Find a shop
          </a>
        )}
      </div>
    </div>
  );
}
