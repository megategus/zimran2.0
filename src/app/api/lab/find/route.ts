import { NextResponse } from "next/server";
import { PARTS } from "@/content/catalog";
import { db } from "@/lib/db";
import { getGuest } from "@/lib/guest";
import { today } from "@/lib/progress";

const FIND_XP = 3;

// Lab game: found the asked-for part. +3 XP, each part once per day (progress row find:<day>:<part> is the guard).
export async function POST(req: Request) {
  const part = (await req.json().catch(() => null))?.part;
  if (!PARTS.some((p) => p.key === part)) return NextResponse.json({ error: "Unknown part" }, { status: 400 });
  const guest = await getGuest();
  if (!guest.isPremium) return NextResponse.json({ error: "Premium required" }, { status: 402 });
  const ins = await db().from("progress").insert({ guest_id: guest.id, lesson_key: `find:${today(guest.dayOffset)}:${part}`, score: 1 });
  if (ins.error) return NextResponse.json({ xpGained: 0 }); // already found today
  const { error } = await db().from("guests").update({ xp: guest.xp + FIND_XP }).eq("id", guest.id);
  if (error) throw error;
  return NextResponse.json({ xpGained: FIND_XP });
}
