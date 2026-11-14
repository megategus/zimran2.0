import { TriangleAlert } from "lucide-react";

// Spec: docs/design/components/SafetyNote/README.md. Never render empty.
export function SafetyNote({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div role="note" className="bg-brake-soft border border-brake rounded-md p-4 flex gap-3">
      <TriangleAlert className="text-brake shrink-0" aria-hidden />
      <div className="flex flex-col gap-1">
        <span className="type-label text-[12px] text-brake">SAFETY</span>
        <p className="type-body text-ink">{text}</p>
      </div>
    </div>
  );
}
