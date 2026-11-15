import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { anthropic, fallbackFor, LESSON_MODEL } from "@/lib/anthropic";
import { findLesson } from "@/content/catalog";
import { db } from "@/lib/db";
import type { Car, Lesson, LessonKey, PublicLesson } from "@/lib/types";
import { LessonSchema } from "./schema";
import { SYSTEM_PROMPT, lessonPrompt, needsSafety } from "./prompt";

export class LessonGenError extends Error {}

async function attempt(car: Car, key: LessonKey): Promise<Lesson | null> {
  const found = findLesson(key);
  if (!found) throw new LessonGenError(`Unknown lesson ${key}`);
  const res = await anthropic().beta.messages.create({
    model: LESSON_MODEL,
    max_tokens: 8000,
    ...fallbackFor(LESSON_MODEL),
    output_config: { effort: "low", format: betaZodOutputFormat(LessonSchema) },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: lessonPrompt(car, found) }],
  });
  if (res.stop_reason !== "end_turn") return null; // refusal or max_tokens: retry once, then give up
  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;
  let json: unknown;
  try {
    json = JSON.parse(text.text);
  } catch {
    return null;
  }
  const parsed = LessonSchema.safeParse(json);
  if (!parsed.success) return null;
  if (needsSafety(found) && !parsed.data.safety) return null;
  return parsed.data;
}

// One retry on invalid output; API errors (network, 5xx after SDK retries) also count as a failed attempt.
export async function generateLesson(car: Car, key: LessonKey): Promise<Lesson> {
  for (let i = 0; i < 2; i++) {
    try {
      const lesson = await attempt(car, key);
      if (lesson) return lesson;
    } catch (e) {
      if (e instanceof LessonGenError) throw e;
      console.error(`generateLesson ${key} attempt ${i + 1}`, e);
    }
  }
  throw new LessonGenError(`Could not generate ${key}`);
}

// Lessons are shared by every car with the same year, make, model, trim and engine.
// Must match the backfill in supabase/migrations/0002_shared_lessons_and_limits.sql.
export const profileKey = (car: Pick<Car, "year" | "make" | "model" | "trim" | "engine">) =>
  [car.year, car.make, car.model, car.trim ?? "", car.engine ?? ""]
    .map((v) => String(v).trim().replace(/\s+/g, " ").toLowerCase())
    .join("|");

export async function getCachedLesson(car: Car, key: LessonKey): Promise<Lesson | null> {
  const { data, error } = await db().from("lessons").select("content").eq("profile_key", profileKey(car)).eq("lesson_key", key).maybeSingle();
  if (error) throw error;
  return (data?.content as Lesson) ?? null;
}

// `guard` runs only on a cache miss, before Claude is called (the daily generation limit).
// Two tabs racing on the same uncached lesson: the loser's insert is ignored and both read the winner's row.
export async function getOrCreateLesson(car: Car, key: LessonKey, guard?: () => Promise<void>): Promise<Lesson> {
  const cached = await getCachedLesson(car, key);
  if (cached) return cached;
  await guard?.();
  const lesson = await generateLesson(car, key);
  const { error } = await db()
    .from("lessons")
    .upsert({ profile_key: profileKey(car), lesson_key: key, content: lesson }, { onConflict: "profile_key,lesson_key", ignoreDuplicates: true });
  if (error) throw error;
  return (await getCachedLesson(car, key)) ?? lesson;
}

export function toPublic(lesson: Lesson): PublicLesson {
  return { ...lesson, quiz: lesson.quiz.map(({ q, options }) => ({ q, options })) };
}
