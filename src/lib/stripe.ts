import Stripe from "stripe";

// Server only. Test-mode key (sk_test_...) from STRIPE_SECRET_KEY.
let client: Stripe | null = null;
export function stripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY must be set");
  client = new Stripe(key);
  return client;
}

export const PLANS = {
  monthly: { unit_amount: 999, interval: "month" },
  yearly: { unit_amount: 5999, interval: "year" },
} as const;
export type Plan = keyof typeof PLANS;

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
