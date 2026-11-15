import { after, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createGuest, toCar } from "@/lib/guest";
import { clientIp, generationGuard } from "@/lib/limits";
import { prewarm } from "@/lib/prewarm";
import { snapshot, today, xpFor } from "@/lib/progress";

// New demo guest: 2018 Honda Civic, 6 past active days, brakes-1 done today (streak 7).
// {pro: true} is the jury free trial: the same demo with Pro already on, no checkout.
export async function POST(req: Request) {
  const pro = (await req.json().catch(() => null))?.pro === true;
  const guest = { ...(await createGuest(true)), isPremium: pro };
  const pastDays = [6, 5, 4, 3, 2, 1].map((n) => today(-n));
  const xp = xpFor(3) * (pastDays.length + 1);

  // Direct insert, not createCarFromYmm: that leaves engine and specs empty, and the demo shows them.
  const results = await Promise.all([
    db().from("cars").insert({ guest_id: guest.id, year: 2018, make: "HONDA", model: "Civic", trim: "LX", engine: "2.0L I4", specs: { "Fuel type": "Gasoline", Drive: "FWD" } }).select().single(),
    db().from("activity").insert([...pastDays, today(0)].map((day) => ({ guest_id: guest.id, day }))),
    db().from("progress").insert({ guest_id: guest.id, lesson_key: "brakes-1", score: 3 }),
    db().from("guests").update({ xp, is_premium: pro }).eq("id", guest.id),
  ]);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
  // Background: brakes-1 (marked done, feeds the daily question) and the lesson Today points to.
  // Every demo Civic shares one profile, so after the first demo these are cache hits that cost nothing.
  const car = toCar(results[0].data as Parameters<typeof toCar>[0]);
  after(() => prewarm(car, ["brakes-1", pro ? "brakes-2" : "oil-fluids-1"], generationGuard(guest.id, clientIp(req))));

  return NextResponse.json(await snapshot({ ...guest, xp }));
}
