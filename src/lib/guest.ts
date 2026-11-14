import { cookies } from "next/headers";
import { db } from "./db";
import type { Car, Guest } from "./types";

export const GUEST_COOKIE = "guest_id";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type GuestRow = { id: string; is_premium: boolean; day_offset: number; xp: number; is_demo: boolean };
type CarRow = {
  id: string; guest_id: string; vin: string | null; year: number; make: string; model: string;
  trim: string | null; engine: string | null; specs: Car["specs"]; recalls: Car["recalls"];
};

export const toGuest = (r: GuestRow): Guest => ({ id: r.id, isPremium: r.is_premium, dayOffset: r.day_offset, xp: r.xp, isDemo: r.is_demo });

export const toCar = (r: CarRow): Car => ({
  id: r.id, guestId: r.guest_id, vin: r.vin, year: r.year, make: r.make, model: r.model,
  trim: r.trim, engine: r.engine, specs: r.specs ?? {}, recalls: r.recalls ?? [],
});

export async function setGuestCookie(id: string) {
  (await cookies()).set(GUEST_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function createGuest(isDemo = false): Promise<Guest> {
  const { data, error } = await db().from("guests").insert({ is_demo: isDemo }).select().single();
  if (error) throw error;
  await setGuestCookie(data.id);
  return toGuest(data);
}

// Call only from route handlers or server actions: it may set a cookie.
export async function getGuest(): Promise<Guest> {
  return (await peekGuest()) ?? createGuest();
}

// Read-only lookup for server components (they cannot set cookies). Null when no valid guest cookie.
export async function peekGuest(): Promise<Guest | null> {
  const id = (await cookies()).get(GUEST_COOKIE)?.value;
  if (!id || !UUID.test(id)) return null;
  const { data } = await db().from("guests").select().eq("id", id).maybeSingle();
  return data ? toGuest(data) : null;
}

export async function getCar(guestId: string): Promise<Car | null> {
  const { data, error } = await db().from("cars").select().eq("guest_id", guestId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data ? toCar(data) : null;
}
