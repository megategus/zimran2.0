import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGuest } from "@/lib/guest";
import { snapshot } from "@/lib/progress";

// Demo only: move the guest's clock forward one day.
export async function POST() {
  const guest = await getGuest();
  if (!guest.isDemo) return NextResponse.json({ error: "Demo only" }, { status: 403 });
  const dayOffset = guest.dayOffset + 1;
  const { error } = await db().from("guests").update({ day_offset: dayOffset }).eq("id", guest.id);
  if (error) throw error;
  return NextResponse.json(await snapshot({ ...guest, dayOffset }));
}
