import { NextResponse } from "next/server";
import { z } from "zod";
import { getGuest } from "@/lib/guest";
import { appUrl, PLANS, stripe } from "@/lib/stripe";

const Body = z.object({ plan: z.enum(["monthly", "yearly"]) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "plan must be monthly or yearly" }, { status: 400 });

  const guest = await getGuest();
  if (guest.isPremium) return NextResponse.json({ url: `${appUrl()}/app` });

  const { unit_amount, interval } = PLANS[parsed.data.plan];
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount, recurring: { interval }, product_data: { name: "Wrenchly Premium" } } }],
      metadata: { guest_id: guest.id },
      client_reference_id: guest.id,
      success_url: `${appUrl()}/api/checkout/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/pricing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("POST /api/checkout", e);
    return NextResponse.json({ error: "Checkout is unavailable. Try again." }, { status: 502 });
  }
}
