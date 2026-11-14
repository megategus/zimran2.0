import Image from "next/image";
import { DemoButton } from "@/components/landing/DemoButton";
import { ArrowLink, headline as h, SiteNav } from "@/components/ui/site";
import { COURSES } from "@/content/catalog";

// Unsplash photos, hotlinked per Unsplash guidelines.
const HERO = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=70&auto=format&fit=crop";
const HANDS = "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=900&q=70&auto=format&fit=crop";

const headline = `${h} text-ink`;

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/onboarding", label: "Start" },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Red diagonal stripes, bottom-left of the hero. */}
      <div aria-hidden className="pointer-events-none absolute left-[-120px] top-[760px] md:top-[690px] w-[420px] -rotate-[28deg] flex flex-col gap-4">
        <span className="h-4 bg-brand" />
        <span className="h-4 bg-brand" />
      </div>

      <main className="relative mx-auto max-w-[1120px] px-4 md:px-10">
        <SiteNav left={NAV.slice(0, 2)} right={NAV.slice(2)} />

        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="flex flex-col gap-8">
            <h1 className={`${headline} text-[60px] leading-[0.92] md:text-[96px]`}>
              Learn.
              <br />
              Fix. Save.
            </h1>
            <p className="type-body-lg text-ink-muted max-w-[40ch]">
              Stop overpaying for car repairs. Five-minute lessons written for the exact car in your driveway, with quizzes, XP and a daily streak.
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <ArrowLink href="/onboarding">Start with my car</ArrowLink>
              <DemoButton className="type-body font-semibold text-ink underline underline-offset-4 decoration-line-strong hover:decoration-brand cursor-pointer disabled:text-ink-muted" />
            </div>
            <p className="type-caption text-ink-muted">No login. The demo uses a 2018 Honda Civic and is labeled DEMO.</p>
          </div>

          <div className="relative flex flex-col gap-4">
            <div className="flex items-baseline gap-3 self-end">
              <span className={`${headline} !text-brand text-[56px] md:text-[72px] leading-none`}>5 min</span>
              <span className={`${headline} text-[20px] [font-stretch:100%]`}>a day</span>
            </div>
            <div className="relative aspect-[16/10] w-full">
              <Image src={HERO} alt="Close-up of an engine's belts and pulleys" fill priority sizes="(min-width: 768px) 600px, 100vw" className="object-cover grayscale contrast-125" />
              <span aria-hidden className="absolute inset-0 bg-ink/10 mix-blend-multiply" />
              <span aria-hidden className="absolute left-6 -bottom-3 h-3 w-28 bg-brand" />
              <span aria-hidden className="absolute right-10 -top-2 h-2 w-16 bg-brand" />
            </div>
            <div className="flex flex-col gap-4 self-end max-w-[30ch] pt-4">
              <p className="type-body text-ink underline underline-offset-4 decoration-line-strong">
                Every lesson uses your car&apos;s real specs and open recalls from NHTSA.
              </p>
              <ArrowLink href="#how">Read more</ArrowLink>
            </div>
          </div>
        </section>

        {/* Your car's DNA */}
        <section id="how" className="grid gap-10 md:grid-cols-[1fr_1.1fr_1fr] md:items-center border-t border-line py-16 md:py-24 scroll-mt-4">
          <div className="flex flex-col gap-5">
            <h2 className={`${headline} text-[44px] leading-[0.95] md:text-[52px]`}>Your car&apos;s DNA</h2>
            <p className="type-body text-ink-muted max-w-[34ch]">
              Enter your VIN. We pull the engine, specs and recalls, then write every lesson, quiz and price estimate for that car.
            </p>
            <ArrowLink href="/onboarding">Enter my VIN</ArrowLink>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] w-full">
              <Image src={HANDS} alt="A mechanic's hands tightening a bolt in an engine bay with a wrench" fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover grayscale contrast-125" />
              <span aria-hidden className="absolute inset-0 bg-ink/10 mix-blend-multiply" />
            </div>
            {/* Outlined red circle, like the reference "Play Video". */}
            <div className="absolute -left-6 -bottom-10 md:-left-12">
              <DemoButton className="size-28 rounded-full border-2 border-brand bg-bg/70 backdrop-blur-sm text-brand type-body font-semibold cursor-pointer transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:scale-110 disabled:opacity-70" />
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-10 md:pt-0">
            <h2 className={`${headline} text-[36px] leading-[0.95] md:text-[40px]`}>
              Ask a mechanic.
              <br />
              Take it apart.
            </h2>
            <p className="type-body text-ink-muted max-w-[34ch]">
              Pro adds an AI Mechanic that reads your photos and quotes, and a 3D brake you can pull apart piece by piece.
            </p>
            <ArrowLink href="/pricing">See plans</ArrowLink>
          </div>
        </section>

        {/* Courses, like the reference "Timeless" list */}
        <section id="courses" className="grid gap-10 md:grid-cols-[1fr_1fr] border-t border-line py-16 md:py-24 scroll-mt-4">
          <div className="flex flex-col gap-5">
            <h2 className={`${headline} text-[56px] leading-[0.92] md:text-[80px]`}>
              Skills
              <br />
              that last.
            </h2>
            <p className="type-body text-ink-muted max-w-[36ch]">Three courses are live now. Five more are on the way.</p>
          </div>
          <ul className="flex flex-col">
            {COURSES.map((c) => (
              <li key={c.key} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
                <span className={`type-h3 ${c.status === "live" ? "text-ink" : "text-ink-muted"}`}>{c.title}</span>
                <span className={`type-caption ${c.status === "live" ? "text-brand font-semibold" : "text-ink-muted"}`}>
                  {c.status === "live" ? `${c.lessons.length} lessons` : "Coming soon"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-line py-6 type-caption text-ink-muted flex flex-col gap-1 md:flex-row md:justify-between">
          <span>Vehicle data from NHTSA. Cost figures are estimates and vary by region. When in doubt, see a professional mechanic.</span>
          <span>Photos: Unsplash</span>
        </footer>
      </main>
    </div>
  );
}
