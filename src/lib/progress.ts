import { db } from "./db";
import { getCar } from "./guest";
import type { Guest, LessonKey } from "./types";

const DAY = 86_400_000;

// UTC YYYY-MM-DD, shifted by the demo day offset.
export function today(dayOffset: number, now = new Date()): string {
  return new Date(now.getTime() + dayOffset * DAY).toISOString().slice(0, 10);
}

const prevDay = (d: string) => new Date(Date.parse(d) - DAY).toISOString().slice(0, 10);

// Active days in a row ending today, or ending yesterday if today is not done yet.
// Streak freeze: one missed day per 7 is bridged (not counted, not breaking), never two misses in a row.
export function streakInfo(days: string[], todayStr: string): { streak: number; frozen: string[] } {
  const set = new Set(days);
  let d = set.has(todayStr) ? todayStr : prevDay(todayStr);
  let n = 0;
  const frozen: string[] = [];
  let lastFreeze = -Infinity;
  for (let i = 0; ; i++, d = prevDay(d)) {
    if (set.has(d)) n++;
    else if (n > 0 && set.has(prevDay(d)) && i - lastFreeze >= 7) {
      frozen.push(d);
      lastFreeze = i;
    } else break;
  }
  return { streak: n, frozen };
}

export const streak = (days: string[], todayStr: string) => streakInfo(days, todayStr).streak;

export type DayState = "done" | "frozen" | "today" | "missed";

// The last 7 days ending today, for the week strip under the streak.
export function week(days: string[], frozen: string[], todayStr: string) {
  const done = new Set(days), ice = new Set(frozen);
  const out: { day: string; label: string; state: DayState }[] = [];
  for (let i = 6, d = todayStr; i >= 0; i--, d = prevDay(d)) {
    const state: DayState = done.has(d) ? "done" : ice.has(d) ? "frozen" : d === todayStr ? "today" : "missed";
    out[i] = { day: d, label: "SMTWTFS"[new Date(d).getUTCDay()], state };
  }
  return out;
}

// A freeze is ready when none was used in the last 7 days.
export const freezeReady = (frozen: string[], todayStr: string) => !frozen.some((d) => Date.parse(todayStr) - Date.parse(d) < 7 * DAY);

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
    // daily-<date> rows mark the question of the day as answered; they are not lessons.
    db().from("progress").select("lesson_key, score").eq("guest_id", guest.id).not("lesson_key", "like", "daily-%"),
    activityDays(guest.id),
  ]);
  if (prog.error) throw prog.error;
  const t = today(guest.dayOffset);
  const info = streakInfo(days, t);
  return {
    guest,
    car,
    progress: prog.data.map((r) => ({ lessonKey: r.lesson_key as string, score: r.score as number })),
    streak: info.streak,
    week: week(days, info.frozen, t),
    freezeReady: freezeReady(info.frozen, t),
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
