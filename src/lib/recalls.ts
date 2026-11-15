import type { Recall } from "./types";

// NHTSA's recallsByVehicle lists every campaign for the make, model and year. It does not say whether
// this particular car was already fixed, so the UI must never call these "open".
export const RECALL_CHECK_URL = "https://www.nhtsa.gov/recalls";

// Safety-critical systems first, so the 2-3 shown before "Show all" are the ones that matter most.
const SEVERITY: [RegExp, number][] = [
  [/AIR ?BAG|SEAT ?BELT/, 0],
  [/BRAKE/, 1],
  [/STEERING|SUSPENSION|WHEEL|TIRE/, 2],
  [/FUEL|FIRE|ELECTRICAL/, 3],
  [/POWER TRAIN|ENGINE/, 4],
];
const rank = (r: Recall) => SEVERITY.find(([re]) => re.test(r.component.toUpperCase()))?.[1] ?? 9;

export function sortRecalls(recalls: Recall[]): Recall[] {
  return [...recalls].sort((a, b) => rank(a) - rank(b));
}

// "AIR BAGS:FRONTAL:DRIVER SIDE:INFLATOR MODULE" -> "Air bags · frontal · driver side · inflator module"
export function plainComponent(component: string): string {
  const parts = component.split(":").map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (!parts.length) return "Recall";
  parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  return parts.join(" · ");
}

// First sentence or two of the NHTSA summary, cut at a word boundary.
export function shortSummary(summary: string, max = 180): string {
  const s = summary.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function recallHeadline(n: number): string {
  return n === 0 ? "No recalls for this model" : `${n} recall${n === 1 ? "" : "s"} for this model`;
}
