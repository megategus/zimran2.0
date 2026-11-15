import { findLesson } from "@/content/catalog";

// Locked links carry what the user tried to open, so /pricing can say why they landed there.
export type PaywallFrom = string; // a lesson key, "chat" or "lab"

export function pricingHref(from?: PaywallFrom): string {
  return from ? `/pricing?from=${encodeURIComponent(from)}` : "/pricing";
}

export function paywallReason(from?: string | null): { what: string; cta: string } | null {
  if (!from) return null;
  if (from === "chat") return { what: "The AI Mechanic", cta: "Unlock the AI Mechanic and everything else" };
  if (from === "lab") return { what: "The 3D Brake Lab", cta: "Unlock the 3D Brake Lab and everything else" };
  const found = findLesson(from);
  if (!found) return null;
  const title = found.isPart ? `The ${found.lesson.title.toLowerCase()} lesson` : `“${found.lesson.title}”`;
  return { what: title, cta: `Unlock ${found.isPart ? "this lesson" : `“${found.lesson.title}”`} and everything else` };
}
