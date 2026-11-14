import { findLesson } from "@/content/catalog";
import type { Guest, LessonKey } from "./types";

// Free tier: first lesson of each live course. Parts (3D lab) and the rest are premium.
export function isFreeLesson(key: LessonKey): boolean {
  const found = findLesson(key);
  return !!found && !found.isPart && found.course?.status === "live" && found.course.lessons[0]?.key === key;
}

export function canAccess(guest: Guest, key: LessonKey): boolean {
  if (!findLesson(key)) return false;
  return guest.isPremium || isFreeLesson(key);
}
