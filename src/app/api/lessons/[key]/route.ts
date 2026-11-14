import { NextResponse } from "next/server";
import { findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { getCar, getGuest } from "@/lib/guest";
import { getOrCreateLesson, LessonGenError, toPublic } from "@/lib/lessons/generate";

export const maxDuration = 60; // first generation can take 5-15 s

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!findLesson(key)) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const guest = await getGuest();
  if (!canAccess(guest, key)) return NextResponse.json({ error: "Premium lesson" }, { status: 402 });
  const car = await getCar(guest.id);
  if (!car) return NextResponse.json({ error: "Add your car first" }, { status: 409 });

  try {
    return NextResponse.json({ lesson: toPublic(await getOrCreateLesson(car, key)) });
  } catch (e) {
    if (e instanceof LessonGenError) return NextResponse.json({ error: "We couldn't write this lesson. Try again." }, { status: 502 });
    throw e;
  }
}
