import { ButtonLink } from "@/components/ui/Button";

// Placeholder. Real landing is Task C3.
export default function Home() {
  return (
    <main className="mx-auto max-w-[960px] px-4 py-16 flex flex-col gap-6">
      <span className="type-h3">Wrenchly</span>
      <h1 className="type-display">Stop overpaying for car repairs.</h1>
      <p className="type-body-lg text-ink-muted max-w-[65ch]">Learn your own car in 5 minutes a day.</p>
      <div className="flex flex-wrap gap-4">
        <ButtonLink href="/onboarding">Start with my car</ButtonLink>
        <ButtonLink href="/app" variant="secondary">Try demo</ButtonLink>
      </div>
    </main>
  );
}
