import Link from "next/link";
import { PartArt } from "@/components/art/PartArt";
import { DemoButton } from "@/components/landing/DemoButton";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Tag } from "@/components/ui/primitives";
import { COURSES } from "@/content/catalog";

const STEPS = [
  { part: "dipstick", title: "Enter your VIN", body: "We pull your exact engine, specs and open recalls from NHTSA. No account needed." },
  { part: "rotor", title: "Take a 5-minute lesson", body: "Every lesson is written for your make, model and year, then checked with a 3-question quiz." },
  { part: "wheel", title: "Walk into the shop ready", body: "Know what the part does, how it fails and what a fair price looks like before you get the quote." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[960px] px-4 py-8 md:py-16 flex flex-col gap-12">
      <header className="flex items-center justify-between">
        <span className="type-h3">Wrenchly</span>
        <Link href="/pricing" className="type-label text-ink-muted hover:text-ink">Pricing</Link>
      </header>

      <section className="flex flex-col gap-6">
        <span className="type-label text-brand">A course about your own car</span>
        <h1 className="type-display max-w-[18ch]">Stop overpaying for car repairs.</h1>
        <p className="type-body-lg text-ink-muted max-w-[52ch]">
          Learn your car in 5 minutes a day. Short lessons, quizzes and a streak, all built around the car in your driveway.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <ButtonLink href="/onboarding">Start with my car</ButtonLink>
          <DemoButton />
        </div>
        <p className="type-caption text-ink-muted">No login. The demo uses a 2018 Honda Civic and is labeled DEMO.</p>
      </section>

      <section aria-labelledby="how" className="flex flex-col gap-4">
        <h2 id="how" className="type-h2">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full flex flex-col gap-3">
                <PartArt part={s.part} size={72} label="" />
                <span className="type-data text-ink-muted">0{i + 1}</span>
                <h3 className="type-h3">{s.title}</h3>
                <p className="text-ink-muted">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="courses" className="flex flex-col gap-4">
        <h2 id="courses" className="type-h2">What you&apos;ll learn</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {COURSES.map((c) => (
            <li key={c.key}>
              <Card className="h-full flex flex-col items-center gap-2 text-center">
                <PartArt part={c.part} size={72} label="" />
                <span className="type-h3">{c.title}</span>
                {c.status === "live" ? <Tag tone="brand">{c.lessons.length} lessons</Tag> : <Tag tone="muted">Coming soon</Tag>}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pro" className="rounded-lg bg-plate text-on-plate p-6 md:p-8 flex flex-col gap-4">
        <div><Tag tone="amber">Pro</Tag></div>
        <h2 id="pro" className="type-h1">Ask a mechanic. Take the brakes apart.</h2>
        <p className="type-body-lg max-w-[56ch]">
          Send the AI Mechanic a photo of a worn tire or a repair quote and get an answer about your car. Then pull a brake assembly apart in 3D and learn each part.
        </p>
        <div>
          <ButtonLink href="/pricing">See plans</ButtonLink>
        </div>
      </section>

      <footer className="type-caption text-ink-muted border-t border-line pt-4">
        Vehicle data from NHTSA. Cost figures are estimates and vary by region. When in doubt, see a professional mechanic.
      </footer>
    </main>
  );
}
