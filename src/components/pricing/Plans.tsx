"use client";

import { useState } from "react";
import { PlanCard } from "./PlanCard";

type Plan = "monthly" | "yearly";

const FEATURES = ["All lessons, built on your car", "AI Mechanic with photos", "3D Brake Lab"];

export function Plans({ initialError, cta }: { initialError?: string; cta?: string }) {
  const [busy, setBusy] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function choose(plan: Plan) {
    setBusy(plan);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) throw new Error();
      window.location.assign(data.url);
    } catch {
      setError("Checkout didn't open. Try again.");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p role="alert" className="rounded-md bg-brake-soft text-ink px-4 py-3"><strong className="text-brake">Payment not completed.</strong> {error}</p>}
      {cta && <p className="type-h3 text-ink">{cta}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard name="Monthly" price="$9.99" period="month" features={FEATURES} cta="Choose monthly" busy={busy === "monthly"} disabled={busy !== null} onChoose={() => choose("monthly")} />
        <PlanCard name="Yearly" price="$59.99" period="year" savings="Save 50%" note="Works out to $5.00 a month." features={FEATURES} highlighted cta="Unlock Pro" busy={busy === "yearly"} disabled={busy !== null} onChoose={() => choose("yearly")} />
      </div>
    </div>
  );
}
