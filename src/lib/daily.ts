import type { Lesson, LessonKey } from "./types";

export const DAILY_XP = 5;
export const dailyKey = (day: string) => `daily-${day}`;

// One quiz question from finished lessons, the same one all day. Null when nothing is finished yet.
export function pickDaily(lessons: { key: LessonKey; lesson: Lesson }[], day: string) {
  const all = lessons.flatMap(({ key, lesson }) => lesson.quiz.map((q, qi) => ({ key, qi, q })));
  if (!all.length) return null;
  const n = Math.floor(Date.parse(day) / 86_400_000);
  return all[n % all.length];
}
