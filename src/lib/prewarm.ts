import { COURSES, findLesson } from "@/content/catalog";
import { getOrCreateLesson } from "./lessons/generate";
import type { Car, LessonKey } from "./types";

// Lessons are written one step ahead of the user, never a whole course at once:
// the lesson they'll open next is ready, nothing they may never open is paid for.
export const START_LESSON = COURSES.filter((c) => c.status === "live")[0].lessons[0].key;

// The lesson after `key` in the same course, or null at the end of a course and for 3D lab parts.
export function nextLessonKey(key: LessonKey): LessonKey | null {
  const found = findLesson(key);
  if (!found || found.isPart || !found.course) return null;
  const lessons = found.course.lessons;
  const i = lessons.findIndex((l) => l.key === key);
  return lessons[i + 1]?.key ?? null;
}

export async function prewarm(car: Car, keys: LessonKey[], guard?: () => Promise<void>) {
  const results = await Promise.allSettled(keys.map((k) => getOrCreateLesson(car, k, guard)));
  results.forEach((r, i) => r.status === "rejected" && console.error("prewarm", keys[i], r.reason));
}
