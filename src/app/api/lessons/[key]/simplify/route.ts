import { NextResponse } from "next/server";
import { findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { anthropic, fallbackFor, LESSON_MODEL } from "@/lib/anthropic";
import { claimGeneration, clientIp, GenerationLimitError } from "@/lib/limits";
import { getCar, getGuest } from "@/lib/guest";
import { getCachedLesson } from "@/lib/lessons/generate";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

// "Explain like I'm new": rewrites one card of the cached lesson in plain words. Same facts, no new numbers.
export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!findLesson(key)) return err("Unknown lesson", 404);
  const guest = await getGuest();
  if (!canAccess(guest, key)) return err("Premium required", 402);
  const card = (await req.json().catch(() => null))?.card;
  const car = await getCar(guest.id);
  if (!car) return err("Add your car first", 409);
  const lesson = await getCachedLesson(car, key);
  const body = Number.isInteger(card) ? lesson?.cards[card]?.body : undefined;
  if (!body) return err("Open the lesson first", 409);

  try {
    await claimGeneration(guest.id, clientIp(req));
    const res = await anthropic().beta.messages.create({
      model: LESSON_MODEL,
      max_tokens: 1500,
      ...fallbackFor(LESSON_MODEL),
      system:
        "You rewrite car-maintenance lesson text for a complete beginner. Keep every fact, number and safety warning exactly as given. " +
        "Do not add new facts or figures. Short sentences, everyday words, explain any jargon in passing. At most 110 words. Plain text only.",
      messages: [{ role: "user", content: `Car: ${car.year} ${car.make} ${car.model}\n\nRewrite this simpler:\n\n${body}` }],
    });
    const text = res.content.find((b) => b.type === "text");
    if (res.stop_reason !== "end_turn" || !text || text.type !== "text") {
      console.error("simplify: no text", res.stop_reason, res.content.map((b) => b.type));
      return err("Couldn't simplify right now", 502);
    }
    return NextResponse.json({ body: text.text.trim() });
  } catch (e) {
    if (e instanceof GenerationLimitError) return err("You've reached today's limit. Come back tomorrow.", 429);
    console.error("simplify", e);
    return err("Couldn't simplify right now", 502);
  }
}
