import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getGuest } from "@/lib/guest";
import { createCarFromVin, createCarFromYmm, isValidVin } from "@/lib/nhtsa";
import { prewarm } from "@/lib/prewarm";

const thisYear = new Date().getFullYear();
const Body = z.union([
  z.object({ vin: z.string().trim().toUpperCase() }),
  z.object({
    year: z.coerce.number().int().min(1981).max(thisYear + 1),
    make: z.string().trim().min(1).max(40),
    model: z.string().trim().min(1).max(60),
  }),
]);

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Send a VIN, or year, make and model" }, { status: 400 });

  const guest = await getGuest();
  const input = parsed.data;
  try {
    if ("vin" in input) {
      if (!isValidVin(input.vin)) return NextResponse.json({ error: "A VIN has 17 letters and digits, without I, O or Q" }, { status: 400 });
      const car = await createCarFromVin(guest.id, input.vin);
      if (!car) return NextResponse.json({ error: "VIN not recognized" }, { status: 400 });
      after(() => prewarm(car)); // first lessons get written while the user confirms the car
      return NextResponse.json({ car });
    }
    const car = await createCarFromYmm(guest.id, input.year, input.make, input.model);
    after(() => prewarm(car));
    return NextResponse.json({ car });
  } catch (e) {
    console.error("POST /api/car", e);
    return NextResponse.json({ error: "Car lookup failed. Try again." }, { status: 502 });
  }
}
