import { Check, Lock, Minus } from "lucide-react";
import Link from "next/link";
import { Plans } from "@/components/pricing/Plans";
import { Tag } from "@/components/ui/primitives";
import { headline, SiteNav } from "@/components/ui/site";
import { db } from "@/lib/db";
import { getCar, peekGuest } from "@/lib/guest";
import { getCachedLesson } from "@/lib/lessons/generate";
import { paywallReason } from "@/lib/paywall";
import type { Lesson } from "@/lib/types";

export const metadata = { title: "Pricing · Wrenchly" };
export const dynamic = "force-dynamic";

const ROWS: [string, boolean, boolean][] = [
  ["Lessons written for your exact car", true, true],
  ["First lesson of Brakes, Oil & Fluids, Tires & Wheels", true, true],
  ["Every other lesson", false, true],
  ["Quizzes, XP, streak, badges, question of the day", true, true],
  ["AI Mechanic that reads your photos and quotes", false, true],
  ["3D Brake Lab with part lessons and the find-the-part game", false, true],
];

// Fair shop price for brakes, quoted from a real cached lesson: the viewer's own car if they have one,
// else a demo 2018 Civic. Never a made-up figure; the block hides if no lesson exists yet.
async function fairBrakePrice(): Promise<{ shop: string; car: string } | null> {
  try {
    const guest = await peekGuest();
    const car = guest ? await getCar(guest.id) : null;
    if (car) {
      for (const k of ["brakes-3", "brakes-1"]) {
        const l = await getCachedLesson(car, k);
        if (l) return { shop: l.costs.shop, car: `${car.year} ${car.model}` };
      }
    }
    const { data } = await db().from("lessons").select("content, lesson_key, cars!inner(year, model)").eq("cars.model", "Civic").in("lesson_key", ["brakes-3", "brakes-1"]).order("lesson_key", { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    const c = data.cars as unknown as { year: number; model: string };
    return { shop: (data.content as Lesson).costs.shop, car: `${c.year} ${c.model}` };
  } catch {
    return null;
  }
}

export default async function Pricing({ searchParams }: { searchParams: Promise<{ error?: string; from?: string }> }) {
  const { error, from } = await searchParams;
  const reason = paywallReason(from);
  const guest = await peekGuest();
  const [fair, car] = await Promise.all([fairBrakePrice(), guest ? getCar(guest.id).catch(() => null) : null]);
  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav left={car ? [{ href: "/app", label: "My courses" }] : [{ href: "/", label: "Home" }]} right={car ? [] : [{ href: "/onboarding", label: "Start" }]} />
      <div className="mx-auto max-w-[760px] pt-12 flex flex-col gap-10">
        {reason && (
          <p role="status" className="flex items-start gap-3 border-l-4 border-brand bg-surface px-4 py-3 type-body-lg text-ink">
            <Lock size={20} className="text-brand shrink-0 mt-1" aria-hidden />
            <span>{reason.what} is part of Pro. Pick a plan below to open it.</span>
          </p>
        )}
        <section className="flex flex-col gap-3">
          <div><Tag tone="plate">Pro</Tag></div>
          <h1 className={`${headline} text-ink text-[56px] leading-[0.92] md:text-[80px]`}>Unlock <span className="text-brand">everything.</span></h1>
          <p className="type-body-lg text-ink-muted">Every lesson is built on your make, model and year. Pro opens all of them, plus the AI Mechanic and the 3D lab.</p>
        </section>

        {fair && (
          <section className="grid gap-4 md:grid-cols-2 border-y border-line py-8">
            <div className="flex flex-col gap-2">
              <span className="type-label text-[11px] text-ink-muted">Example shop quote</span>
              <span className={`${headline} text-ink text-[48px] leading-none line-through decoration-brand`}>$640</span>
              <span className="type-caption text-ink-muted">front brakes, pads and rotors</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="type-label text-[11px] text-ink-muted">Fair shop price for a {fair.car}, from its Wrenchly lesson</span>
              <span className={`${headline} text-brand text-[28px] leading-tight`}>{fair.shop}</span>
              <span className="type-caption text-ink-muted">Estimate, varies by region.</span>
            </div>
            <p className={`md:col-span-2 ${headline} text-ink text-[28px] leading-tight`}>Catch one quote like that and Pro pays for itself.</p>
          </section>
        )}

        <Plans cta={reason?.cta} initialError={error ? "Your card wasn't charged. Pick a plan to try again." : undefined} />

        <div className="flex flex-col gap-2">
          <div><Tag tone="amber">Stripe test mode</Tag></div>
          <p className="type-caption text-ink-muted">
            Stripe test mode. No real charge. Use card <span className="type-data">4242 4242 4242 4242</span>, any future date and any CVC.
          </p>
        </div>

        <table className="w-full border-collapse">
          <caption className={`${headline} text-ink text-[32px] leading-none text-left pb-4`}>Free vs Pro</caption>
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="text-left type-label text-[11px] text-ink-muted py-3">What you get</th>
              <th scope="col" className="type-label text-[11px] text-ink-muted py-3 w-20">Free</th>
              <th scope="col" className="type-label text-[11px] text-brand py-3 w-20">Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, free, pro]) => (
              <tr key={label} className="border-b border-line">
                <th scope="row" className="text-left type-body font-normal text-ink py-3 pr-4">{label}</th>
                {[free, pro].map((on, i) => (
                  <td key={i} className="py-3 text-center">
                    {on ? <Check size={18} className={`inline ${i ? "text-brand" : "text-ink"}`} aria-label="Included" /> : <Minus size={18} className="inline text-ink-muted" aria-label="Not included" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="type-caption text-ink-muted">
          Where the data comes from and what Wrenchly is not: <Link href="/about" className="underline">About</Link>.
        </p>
      </div>
    </main>
  );
}
