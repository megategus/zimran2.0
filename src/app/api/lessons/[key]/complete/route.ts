import { NextResponse } from "next/server";
import { findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { db } from "@/lib/db";
import { grade } from "@/lib/grade";
import { getCar, getGuest } from "@/lib/guest";
import { recordCompletion } from "@/lib/progress";
import type { Lesson } from "@/lib/types";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!findLesson(key)) return err("Unknown lesson", 404);
  const guest = await getGuest();
  if (!canAccess(guest, key)) return err("Premium required", 402);

  const body = await req.json().catch(() => null);
  const answers: unknown = body?.answers;
  if (!Array.isArray(answers) || !answers.every((a) => Number.isInteger(a))) return err("answers must be an array of integers", 400);

  const car = await getCar(guest.id);
  if (!car) return err("Add your car first", 409);
  // Same row B2's getCachedLesson reads; the quiz answers never left the server.
  const { data, error } = await db().from("lessons").select("content").eq("car_id", car.id).eq("lesson_key", key).maybeSingle();
  if (error) throw error;
  if (!data) return err("Open the lesson before finishing it", 409);
  const lesson = data.content as Lesson;

  let score: number;
  try {
    score = grade(lesson, answers);
  } catch (e) {
    if (e instanceof RangeError) return err(e.message, 400);
    throw e;
  }
  const { xpGained, streak } = await recordCompletion(guest, key, score);
  return NextResponse.json({ score, total: lesson.quiz.length, correct: lesson.quiz.map((q) => q.answerIndex), xpGained, streak });
}
