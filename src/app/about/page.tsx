import { TriangleAlert } from "lucide-react";
import { ArrowLink, headline, SiteNav } from "@/components/ui/site";

export const metadata = { title: "About · Wrenchly" };

// Fill in names to show the Team section, e.g. { name: "Jane Doe", role: "Design" }.
const TEAM: { name: string; role: string }[] = [];

const SOURCES = [
  { title: "NHTSA vPIC", body: "Decodes your VIN into year, make, model, trim, engine and specs. Run by the US National Highway Traffic Safety Administration." },
  { title: "NHTSA Recalls", body: "Open safety recalls for your year, make and model, shown on your car card." },
  { title: "Claude by Anthropic", body: "Writes every lesson, quiz, plain-language rewrite and AI Mechanic answer live, for your exact car. Nothing is pre-written." },
  { title: "Your answers", body: "Progress, streak and lesson feedback are stored per browser without an account. Photos sent to the AI Mechanic are never stored." },
];

export default function About() {
  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav left={[{ href: "/", label: "Home" }]} right={[{ href: "/pricing", label: "Pricing" }]} />
      <div className="mx-auto max-w-[760px] pt-12 flex flex-col gap-12">
        <h1 className={`${headline} text-ink text-[56px] leading-[0.92] md:text-[80px]`}>
          Where it <span className="text-brand">comes from.</span>
        </h1>

        <section className="flex flex-col">
          {SOURCES.map((s) => (
            <div key={s.title} className="grid gap-2 md:grid-cols-[220px_1fr] border-b border-line py-5">
              <h2 className={`${headline} text-ink text-[24px] leading-tight`}>{s.title}</h2>
              <p className="type-body text-ink-muted">{s.body}</p>
            </div>
          ))}
        </section>

        <section role="note" className="flex gap-4 bg-brake-soft border-l-4 border-brake p-5">
          <TriangleAlert className="text-brake shrink-0" aria-hidden />
          <div className="flex flex-col gap-2">
            <h2 className={`${headline} text-ink text-[28px] leading-none`}>Not a replacement for a mechanic</h2>
            <p className="type-body text-ink">
              Wrenchly teaches you how your car works and what fair prices look like. AI answers can be wrong. Prices are estimates and vary by region.
              For brakes, airbags, hot coolant, jacking a car or EV high voltage, when in doubt, stop and see a professional.
            </p>
          </div>
        </section>

        {TEAM.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className={`${headline} text-ink text-[36px] leading-none`}>Team</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {TEAM.map((m) => (
                <li key={m.name} className="flex flex-col border-t-2 border-ink pt-3">
                  <span className="type-body font-semibold text-ink">{m.name}</span>
                  <span className="type-caption text-ink-muted">{m.role}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ArrowLink href="/onboarding">Start with my car</ArrowLink>
      </div>
    </main>
  );
}
