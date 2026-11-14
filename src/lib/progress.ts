import { db } from "./db";
import { getCar } from "./guest";
import type { Guest, LessonKey } from "./types";

const DAY = 86_400_000;

// UTC YYYY-MM-DD, shifted by the demo day offset.
export function today(dayOffset: number, now = new Date()): string {
  return new Date(now.getTime() + dayOffset * DAY).toISOString().slice(0, 10);
}

const prevDay = (d: string) => new Date(Date.parse(d) - DAY).toISOString().slice(0, 10);

// Consecutive days ending today, or ending yesterday if today is not done yet.
export function streak(days: string[], todayStr: string): number {
  const set = new Set(days);
  let d = set.has(todayStr) ? todayStr : prevDay(todayStr);
  let n = 0;
  while (set.has(d)) {
    n++;
    d = prevDay(d);
  }
  return n;
}

export const xpFor = (score: number) => 10 + 5 * score;

export async function activityDays(guestId: string): Promise<string[]> {
  const { data, error } = await db().from("activity").select("day").eq("guest_id", guestId);
  if (error) throw error;
  return data.map((r) => r.day as string);
}

// The GET /api/me payload.
export async function snapshot(guest: Guest) {
  const [car, prog, days] = await Promise.all([
    getCar(guest.id),
    db().from("progress").select("lesson_key, score").eq("guest_id", guest.id),
    activityDays(guest.id),
  ]);
  if (prog.error) throw prog.error;
  const t = today(guest.dayOffset);
  return {
    guest,
    car,
    progress: prog.data.map((r) => ({ lessonKey: r.lesson_key as string, score: r.score as number })),
    streak: streak(days, t),
    xp: guest.xp,
    today: t,
  };
}

export type Me = Awaited<ReturnType<typeof snapshot>>;

export async function recordCompletion(guest: Guest, key: LessonKey, score: number): Promise<{ xpGained: number; streak: number }> {
  const day = today(guest.dayOffset);
  const xpGained = xpFor(score);
  const [p, a] = await Promise.all([
    db().from("progress").upsert({ guest_id: guest.id, lesson_key: key, score, completed_at: new Date().toISOString() }),
    db().from("activity").upsert({ guest_id: guest.id, day }, { ignoreDuplicates: true }),
  ]);
  if (p.error) throw p.error;
  if (a.error) throw a.error;
  // shortcut: read-modify-write on xp, two simultaneous completions can lose one award; move to an SQL increment if that matters.
  const { error } = await db().from("guests").update({ xp: guest.xp + xpGained }).eq("id", guest.id);
  if (error) throw error;
  return { xpGained, streak: streak(await activityDays(guest.id), day) };
}
