import { NextResponse } from "next/server";
import { COURSES } from "@/content/catalog";
import { db } from "@/lib/db";
import { getGuest } from "@/lib/guest";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const courseKey = body?.courseKey;
  if (!COURSES.some((c) => c.key === courseKey && c.status === "soon")) {
    return NextResponse.json({ error: "Unknown course" }, { status: 400 });
  }
  const guest = await getGuest();
  const { error } = await db().from("notify_requests").upsert({ guest_id: guest.id, course_key: courseKey }, { ignoreDuplicates: true });
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
