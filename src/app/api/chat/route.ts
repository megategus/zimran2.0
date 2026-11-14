import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { anthropic, FALLBACK, MODEL } from "@/lib/anthropic";
import { buildSystemPrompt } from "@/lib/chat/context";
import { MAX_MESSAGE_CHARS, validateImage, type ImageType } from "@/lib/chat/validate";
import { db } from "@/lib/db";
import { getCar, getGuest } from "@/lib/guest";

export const maxDuration = 60;

type Row = { role: "user" | "assistant"; content: string; had_image: boolean; created_at: string };

async function history(guestId: string, limit: number): Promise<Row[]> {
  const { data, error } = await db()
    .from("chat_messages")
    .select("role, content, had_image, created_at")
    .eq("guest_id", guestId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Row[]).reverse();
}

export async function GET() {
  const guest = await getGuest();
  if (!guest.isPremium) return NextResponse.json({ error: "Premium feature" }, { status: 402 });
  return NextResponse.json({ messages: await history(guest.id, 100) });
}

export async function POST(req: Request) {
  const guest = await getGuest();
  if (!guest.isPremium) return NextResponse.json({ error: "Premium feature" }, { status: 402 });

  const form = await req.formData().catch(() => null);
  const message = String(form?.get("message") ?? "").trim();
  const upload = form?.get("image");
  const image = upload instanceof File && upload.size > 0 ? upload : null;
  if (!message && !image) return NextResponse.json({ error: "Type a question or add a photo." }, { status: 400 });
  if (message.length > MAX_MESSAGE_CHARS) return NextResponse.json({ error: "Keep it under 2000 characters." }, { status: 400 });
  const imageError = validateImage(image);
  if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });

  const car = await getCar(guest.id);
  const { data: progress } = await db().from("progress").select("lesson_key").eq("guest_id", guest.id);
  const system = buildSystemPrompt(car, (progress ?? []).map((p) => p.lesson_key), car?.recalls ?? []);

  // Last 10 messages as text (photos are never stored); the API needs a user turn first.
  const past = await history(guest.id, 10);
  while (past[0]?.role === "assistant") past.shift();
  const userText = message || "What do you see in this photo?";
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (image) {
    const data = Buffer.from(await image.arrayBuffer()).toString("base64");
    content.push({ type: "image", source: { type: "base64", media_type: image.type as ImageType, data } });
  }
  content.push({ type: "text", text: userText });
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...past.map((m) => ({ role: m.role, content: m.had_image ? `[sent a photo] ${m.content}` : m.content })),
    { role: "user", content },
  ];

  const { error: saveError } = await db().from("chat_messages").insert({ guest_id: guest.id, role: "user", content: userText, had_image: !!image });
  if (saveError) throw saveError;

  const stream = anthropic().beta.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    ...FALLBACK,
    output_config: { effort: "low" },
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let reply = "";
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            reply += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && !reply) {
          reply = "I can't help with that one. For anything that affects safety, a qualified mechanic is the right call.";
          controller.enqueue(encoder.encode(reply));
        }
      } catch (e) {
        console.error("POST /api/chat stream", e);
        const note = reply ? "\n\n(The answer was cut off. Ask again.)" : "The AI Mechanic is unavailable right now. Try again in a minute.";
        reply += note;
        controller.enqueue(encoder.encode(note));
      }
      await db().from("chat_messages").insert({ guest_id: guest.id, role: "assistant", content: reply, had_image: false });
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
