import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGuest } from "@/lib/guest";
import { appUrl, stripe } from "@/lib/stripe";

// Stripe redirects here after payment. No webhook: we confirm the session with Stripe directly.
export async function GET(req: Request) {
  const fail = NextResponse.redirect(`${appUrl()}/pricing?error=1`);
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return fail;

  const guest = await getGuest();
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const paid = session.status === "complete" && session.payment_status !== "unpaid";
    // The session must belong to the guest holding this cookie, so a shared link can't unlock someone else.
    if (!paid || session.metadata?.guest_id !== guest.id) return fail;
  } catch (e) {
    console.error("GET /api/checkout/verify", e);
    return fail;
  }

  const { error } = await db().from("guests").update({ is_premium: true }).eq("id", guest.id);
  if (error) {
    console.error("verify: set premium", error);
    return fail;
  }
  return NextResponse.redirect(`${appUrl()}/app?upgraded=1`);
}
