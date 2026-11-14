import { NextResponse } from "next/server";
import { findLesson } from "@/content/catalog";
import { db } from "@/lib/db";
import { getGuest } from "@/lib/guest";

// One-tap lesson feedback: "Helpful" (1) or "Not for my car" (0). Stored as progress row fb:<key>; last tap wins.
export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!findLesson(key)) return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  const helpful = (await req.json().catch(() => null))?.helpful;
  if (typeof helpful !== "boolean") return NextResponse.json({ error: "helpful must be true or false" }, { status: 400 });
  const guest = await getGuest();
  const { error } = await db().from("progress").upsert({ guest_id: guest.id, lesson_key: `fb:${key}`, score: helpful ? 1 : 0, completed_at: new Date().toISOString() });
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
