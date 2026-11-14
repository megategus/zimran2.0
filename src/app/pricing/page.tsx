import { Plans } from "@/components/pricing/Plans";
import { Tag } from "@/components/ui/primitives";
import { headline, SiteNav } from "@/components/ui/site";

export const metadata = { title: "Pricing · Wrenchly" };

const FAQ = [
  { q: "What's free?", a: "The first lesson of Brakes, Oil & Fluids and Tires & Wheels, written for your car." },
  { q: "What does Pro add?", a: "Every other lesson, the AI Mechanic chat that reads photos of your car, and the 3D Brake Lab." },
  { q: "Why is it worth it?", a: "One avoided upsell at the shop usually costs more than a year of Pro." },
];

export default async function Pricing({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav left={[{ href: "/app", label: "My courses" }]} right={[{ href: "/onboarding", label: "Start" }]} />
      <div className="mx-auto max-w-[760px] pt-12 flex flex-col gap-8">

      <section className="flex flex-col gap-3">
        <div><Tag tone="plate">Pro</Tag></div>
        <h1 className={`${headline} text-ink text-[56px] leading-[0.92] md:text-[80px]`}>Unlock <span className="text-brand">everything.</span></h1>
        <p className="type-body-lg text-ink-muted">Every lesson is built on your make, model and year. Pro opens all of them, plus the AI Mechanic and the 3D lab.</p>
      </section>

      <Plans initialError={error ? "Your card wasn't charged. Pick a plan to try again." : undefined} />

      <div className="flex flex-col gap-2">
        <div><Tag tone="amber">Stripe test mode</Tag></div>
        <p className="type-caption text-ink-muted">
          Stripe test mode. No real charge. Use card <span className="type-data">4242 4242 4242 4242</span>, any future date and any CVC.
        </p>
      </div>

      <dl className="flex flex-col gap-4 border-t border-line pt-6">
        {FAQ.map((f) => (
          <div key={f.q} className="flex flex-col gap-1">
            <dt className={`${headline} text-ink text-[24px] leading-tight`}>{f.q}</dt>
            <dd className="text-ink-muted">{f.a}</dd>
          </div>
        ))}
      </dl>
      </div>
    </main>
  );
}
