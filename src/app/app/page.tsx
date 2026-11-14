import { redirect } from "next/navigation";
import { CarCard } from "@/components/app/CarCard";
import type { NodeState } from "@/components/app/CourseNode";
import { CoursePath } from "@/components/app/CoursePath";
import { StreakBar } from "@/components/app/StreakBar";
import { Tag } from "@/components/ui/primitives";
import { ArrowLink, headline, SiteNav } from "@/components/ui/site";
import { COURSES } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { peekGuest } from "@/lib/guest";
import { snapshot } from "@/lib/progress";

export const dynamic = "force-dynamic";

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default async function AppHome() {
  const guest = await peekGuest();
  if (!guest) redirect("/onboarding");
  const me = await snapshot(guest);
  if (!me.car) redirect("/onboarding");
  const car = me.car;
  const done = new Set(me.progress.map((p) => p.lessonKey));
  const stateOf = (key: string): NodeState => (done.has(key) ? "done" : canAccess(guest, key) ? "current" : "locked");
  const pro = guest.isPremium;

  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav
        left={[{ href: "#courses", label: "Courses" }, { href: pro ? "/chat" : "/pricing", label: "AI Mechanic" }]}
        right={[{ href: pro ? "/lab" : "/pricing", label: "3D Lab" }, { href: "/pricing", label: pro ? "Plan" : "Go Pro" }]}
      />

      {/* Header: the car as the headline, like the reference "1998 Batista". */}
      <section className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end border-b border-line pt-10 md:pt-16 pb-10">
        <div className="flex flex-col gap-3">
          <span className="type-label text-[12px] text-ink-muted">Your garage · {titleCase(car.make)}</span>
          <h1 className={`${headline} text-ink text-[64px] leading-[0.9] md:text-[104px]`}>
            <span className="text-brand">{car.year}</span>
            <br />
            {car.model}
          </h1>
        </div>
        <StreakBar streak={me.streak} xp={me.xp} isPremium={pro} isDemo={guest.isDemo} />
      </section>

      {/* Specs left, Pro tools right. */}
      <section className="grid gap-12 md:grid-cols-[1.1fr_1fr] border-b border-line py-12 md:py-16">
        <CarCard car={car} />
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className={`${headline} text-ink text-[36px] leading-none`}>AI Mechanic</h2>
              {!pro && <Tag tone="plate">PRO</Tag>}
            </div>
            <p className="type-body text-ink-muted max-w-[38ch]">Send a photo of a worn part or a repair quote. Get an answer about your {car.model}.</p>
            <ArrowLink href={pro ? "/chat" : "/pricing"}>{pro ? "Ask a question" : "Unlock with Pro"}</ArrowLink>
          </div>
          <div className="flex flex-col gap-4 border-t border-line pt-10">
            <div className="flex items-center gap-3">
              <h2 className={`${headline} text-ink text-[36px] leading-none`}>3D Brake Lab</h2>
              {!pro && <Tag tone="plate">PRO</Tag>}
            </div>
            <p className="type-body text-ink-muted max-w-[38ch]">Pull a brake assembly apart piece by piece and learn what each part does.</p>
            <ArrowLink href={pro ? "/lab" : "/pricing"}>{pro ? "Open the lab" : "Unlock with Pro"}</ArrowLink>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="pt-12 md:pt-16 flex flex-col gap-10 scroll-mt-4">
        <h2 className={`${headline} text-ink text-[56px] leading-[0.92] md:text-[80px]`}>
          Your
          <br />
          courses.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
          {COURSES.map((c) => (
            <div key={c.key} className="flex flex-col gap-6 border-t-2 border-ink pt-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className={`${headline} text-ink text-[32px] leading-none`}>{c.title}</h3>
                {c.status === "soon" ? (
                  <Tag tone="muted">SOON</Tag>
                ) : (
                  <span className="type-caption font-semibold text-brand">
                    {c.lessons.filter((l) => done.has(l.key)).length}/{c.lessons.length} done
                  </span>
                )}
              </div>
              <CoursePath
                nodes={
                  c.status === "live"
                    ? c.lessons.map((l) => {
                        const state = stateOf(l.key);
                        return { title: l.title, state, href: state === "locked" ? "/pricing" : `/lesson/${l.key}` };
                      })
                    : [{ title: c.outline?.[0] ?? c.title, state: "soon", href: `/course/${c.key}` }]
                }
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
