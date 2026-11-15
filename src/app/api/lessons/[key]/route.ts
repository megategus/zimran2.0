import { after, NextResponse } from "next/server";
import { findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { getCar, getGuest } from "@/lib/guest";
import { getOrCreateLesson, LessonGenError, toPublic } from "@/lib/lessons/generate";
import { clientIp, GenerationLimitError, generationGuard } from "@/lib/limits";
import { nextLessonKey, prewarm } from "@/lib/prewarm";

export const maxDuration = 60; // first generation can take 5-15 s

export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!findLesson(key)) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const guest = await getGuest();
  if (!canAccess(guest, key)) return NextResponse.json({ error: "Premium lesson" }, { status: 402 });
  const car = await getCar(guest.id);
  if (!car) return NextResponse.json({ error: "Add your car first" }, { status: 409 });
  const guard = generationGuard(guest.id, clientIp(req));

  try {
    const lesson = await getOrCreateLesson(car, key, guard);
    // Write the next lesson of this course while the user reads this one.
    const next = nextLessonKey(key);
    if (next && canAccess(guest, next)) after(() => prewarm(car, [next], guard));
    return NextResponse.json({ lesson: toPublic(lesson) });
  } catch (e) {
    if (e instanceof GenerationLimitError) return NextResponse.json({ error: "You've reached today's limit for new lessons. Come back tomorrow." }, { status: 429 });
    if (e instanceof LessonGenError) return NextResponse.json({ error: "We couldn't write this lesson. Try again." }, { status: 502 });
    throw e;
  }
}
