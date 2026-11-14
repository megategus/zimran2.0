import { NextResponse } from "next/server";
import { findLesson } from "@/content/catalog";
import { DAILY_XP, dailyKey, pickDaily } from "@/lib/daily";
import { db } from "@/lib/db";
import { getCar, getGuest } from "@/lib/guest";
import { today } from "@/lib/progress";
import type { Guest, Lesson } from "@/lib/types";

// Question of the day: one quiz question from a lesson the guest already finished.
async function load(guest: Guest) {
  const car = await getCar(guest.id);
  if (!car) return null;
  const day = today(guest.dayOffset);
  const { data: prog, error } = await db().from("progress").select("lesson_key, score").eq("guest_id", guest.id);
  if (error) throw error;
  const doneKeys = prog.map((r) => r.lesson_key as string).filter((k) => !k.startsWith("daily-"));
  const answered = prog.find((r) => r.lesson_key === dailyKey(day));
  if (!doneKeys.length) return { day, pick: null, answered };
  const { data: rows, error: e2 } = await db().from("lessons").select("lesson_key, content").eq("car_id", car.id).in("lesson_key", doneKeys);
  if (e2) throw e2;
  const lessons = rows.map((r) => ({ key: r.lesson_key as string, lesson: r.content as Lesson })).sort((a, b) => a.key.localeCompare(b.key));
  return { day, pick: pickDaily(lessons, day), answered };
}

export async function GET() {
  const d = await load(await getGuest());
  if (!d?.pick) return NextResponse.json({ question: null });
  const { key, qi, q } = d.pick;
  return NextResponse.json({
    question: { key, qi, q: q.q, options: q.options, lessonTitle: findLesson(key)?.lesson.title ?? key },
    answered: d.answered ? { correct: d.answered.score === 1, answerIndex: q.answerIndex } : null,
  });
}

export async function POST(req: Request) {
  const guest = await getGuest();
  const answer = (await req.json().catch(() => null))?.answer;
  if (!Number.isInteger(answer)) return NextResponse.json({ error: "answer must be an integer" }, { status: 400 });
  const d = await load(guest);
  if (!d?.pick) return NextResponse.json({ error: "No question today" }, { status: 404 });
  if (d.answered) return NextResponse.json({ error: "Already answered today" }, { status: 409 });

  const correct = answer === d.pick.q.answerIndex;
  const xpGained = correct ? DAILY_XP : 0;
  // Primary key (guest_id, lesson_key) makes a second answer the same day fail instead of paying twice.
  const ins = await db().from("progress").insert({ guest_id: guest.id, lesson_key: dailyKey(d.day), score: correct ? 1 : 0 });
  if (ins.error) return NextResponse.json({ error: "Already answered today" }, { status: 409 });
  if (xpGained) {
    const { error } = await db().from("guests").update({ xp: guest.xp + xpGained }).eq("id", guest.id);
    if (error) throw error;
  }
  return NextResponse.json({ correct, answerIndex: d.pick.q.answerIndex, xpGained });
}
