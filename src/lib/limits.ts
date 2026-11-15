import { db } from "./db";

// New Claude generations allowed per rolling 24 h. Cache hits are free and never counted.
// A full Pro run on a new car (9 lessons, 5 parts, a few rewrites) is ~20 generations.
export const LIMITS = { perGuest: 25, perIp: 60 } as const;
const DAY_MS = 24 * 60 * 60 * 1000;

export class GenerationLimitError extends Error {}

export const overLimit = (guestCount: number, ipCount: number) => guestCount >= LIMITS.perGuest || ipCount >= LIMITS.perIp;

// Vercel puts the client first in x-forwarded-for.
export function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || null;
}

// shortcut: count-then-insert can let a burst of parallel requests slip a few over the limit; move to a DB function if abused.
export async function claimGeneration(guestId: string, ip: string | null): Promise<void> {
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const count = async (column: "guest_id" | "ip", value: string) => {
    const { count: n, error } = await db().from("generations").select("id", { count: "exact", head: true }).eq(column, value).gte("created_at", since);
    if (error) throw error;
    return n ?? 0;
  };
  const [byGuest, byIp] = await Promise.all([count("guest_id", guestId), ip ? count("ip", ip) : Promise.resolve(0)]);
  if (overLimit(byGuest, byIp)) throw new GenerationLimitError("Daily limit for new lessons reached");
  const { error } = await db().from("generations").insert({ guest_id: guestId, ip });
  if (error) throw error;
}

// What a route passes to getOrCreateLesson / prewarm: runs only when a lesson must actually be generated.
export const generationGuard = (guestId: string, ip: string | null) => () => claimGeneration(guestId, ip);
