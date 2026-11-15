import { COURSES, PARTS } from "@/content/catalog";
import { getOrCreateLesson } from "./lessons/generate";
import type { Car } from "./types";

// First lesson of every live course: written in the background right after a car is added,
// so the first lesson opens instantly instead of after a 5-15 s Claude call.
export const FIRST_LESSONS = COURSES.filter((c) => c.status === "live").map((c) => c.lessons[0].key);

export const PART_LESSONS = PARTS.map((p) => p.key);

export async function prewarm(car: Car, keys: string[] = FIRST_LESSONS) {
  const results = await Promise.allSettled(keys.map((k) => getOrCreateLesson(car, k)));
  results.forEach((r, i) => r.status === "rejected" && console.error("prewarm", keys[i], r.reason));
}
