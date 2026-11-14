import { Box, Camera, CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";
import { PartArt } from "@/components/art/PartArt";
import { CarCard } from "@/components/app/CarCard";
import type { NodeState } from "@/components/app/CourseNode";
import { CoursePath } from "@/components/app/CoursePath";
import { DailyQuestion } from "@/components/app/DailyQuestion";
import { StreakBar } from "@/components/app/StreakBar";
import { TodayCard } from "@/components/app/TodayCard";
import { Tag } from "@/components/ui/primitives";
import { ArrowLink, headline, SiteNav } from "@/components/ui/site";
import { COURSES, findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { peekGuest } from "@/lib/guest";
import { getCachedLesson } from "@/lib/lessons/generate";
import { snapshot } from "@/lib/progress";
import { findSentence, seasonTip } from "@/lib/season";

export const dynamic = "force-dynamic";

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Course reward, shown at the station at the end of each road and in the badges column.
const BADGES: Record<string, string> = { brakes: "Brake Boss", "oil-fluids": "Fluid Expert", "tires-wheels": "Tire Whisperer" };

export default async function AppHome() {
  const guest = await peekGuest();
  if (!guest) redirect("/onboarding");
  const me = await snapshot(guest);
  if (!me.car) redirect("/onboarding");
  const car = me.car;
  const pro = guest.isPremium;
  const done = new Set(me.progress.map((p) => p.lessonKey));
  const stateOf = (key: string): NodeState => (done.has(key) ? "done" : canAccess(guest, key) ? "current" : "locked");

  const live = COURSES.filter((c) => c.status === "live");
  const complete = (key: string) => live.find((c) => c.key === key)!.lessons.every((l) => done.has(l.key));
  const undone = live.flatMap((c) => c.lessons.filter((l) => !done.has(l.key)).map((l) => ({ ...l, course: c.title })));
  const nextLesson = undone.find((l) => canAccess(guest, l.key)) ?? undone[0];
  const next = nextLesson ? { title: nextLesson.title, course: nextLesson.course, href: canAccess(guest, nextLesson.key) ? `/lesson/${nextLesson.key}` : "/pricing", locked: !canAccess(guest, nextLesson.key) } : null;

  // Seasonal tip: the figure comes from this car's cached lesson, never hardcoded.
  const tip = seasonTip(new Date(me.today).getUTCMonth());
  const tipLesson = await getCachedLesson(car.id, tip.lessonKey).catch(() => null);
  const quote = tipLesson ? findSentence(tipLesson, tip.quote) : null;

  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav
        left={[{ href: "#courses", label: "Courses" }, { href: pro ? "/chat" : "/pricing", label: "AI Mechanic" }]}
        right={[{ href: pro ? "/lab" : "/pricing", label: "3D Lab" }, { href: "/pricing", label: pro ? "Plan" : "Go Pro" }]}
      />

      {/* Today + seasonal tip */}
      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr] pt-8">
        <TodayCard next={next} doneKeys={[...done]} />
        <aside className="flex flex-col gap-2 bg-surface-sunken px-5 py-5">
          <span className="flex items-center gap-2 type-label text-[12px] text-ink-muted"><CalendarDays size={14} aria-hidden />{tip.month} tip</span>
          <p className="type-body text-ink">{tip.text}</p>
          {quote && <p className="type-body text-ink border-l-2 border-brand pl-3">“{quote}”</p>}
          <ArrowLink href={canAccess(guest, tip.lessonKey) ? `/lesson/${tip.lessonKey}` : "/pricing"}>{findLesson(tip.lessonKey)?.lesson.title}</ArrowLink>
        </aside>
      </section>

      {/* Header: the car as the headline */}
      <section className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end border-b border-line pt-10 md:pt-14 pb-10">
        <div className="flex flex-col gap-3">
          <span className="type-label text-[12px] text-ink-muted">Your garage · {titleCase(car.make)}</span>
          <h1 className={`${headline} text-ink text-[64px] leading-[0.9] md:text-[104px]`}>
            <span className="text-brand">{car.year}</span>
            <br />
            {car.model}
          </h1>
        </div>
        <StreakBar streak={me.streak} xp={me.xp} isPremium={pro} isDemo={guest.isDemo} week={me.week} freezeReady={me.freezeReady} />
      </section>

      {/* Pro tools, big */}
      <section className="grid gap-4 md:grid-cols-2 py-10">
        {[
          { Icon: Camera, title: "AI Mechanic", body: `Send a photo of a worn part or a repair quote. Get an answer about your ${car.model}.`, href: pro ? "/chat" : "/pricing", cta: pro ? "Ask a question" : "Unlock with Pro" },
          { Icon: Box, title: "3D Brake Lab", body: "Pull a brake assembly apart piece by piece and learn what each part does.", href: pro ? "/lab" : "/pricing", cta: pro ? "Open the lab" : "Unlock with Pro" },
        ].map(({ Icon, ...t }) => (
          <div key={t.title} className="relative overflow-hidden bg-plate text-on-plate p-8 md:p-10 min-h-[280px] flex flex-col gap-5">
            <Icon size={44} className="text-brand" aria-hidden />
            <div className="flex items-center gap-3">
              <h2 className={`${headline} text-[44px] leading-none md:text-[56px]`}>{t.title}</h2>
              {!pro && <Tag tone="brand">PRO</Tag>}
            </div>
            <p className="type-body-lg opacity-80 max-w-[40ch]">{t.body}</p>
            <div className="mt-auto"><ArrowLink href={t.href}>{t.cta}</ArrowLink></div>
          </div>
        ))}
      </section>

      {/* Specs + badges */}
      <section className="grid gap-12 md:grid-cols-[1.1fr_1fr] border-y border-line py-12">
        <CarCard car={car} />
        <div className="flex flex-col gap-5">
          <h2 className={`${headline} text-ink text-[36px] leading-none`}>Badges</h2>
          <ul className="grid grid-cols-3 gap-4">
            {live.map((c) => {
              const earned = complete(c.key);
              return (
                <li key={c.key} className="flex flex-col items-center gap-2 text-center">
                  <span className={`size-20 rounded-full flex items-center justify-center border-[3px] ${earned ? "border-brand bg-brand-soft" : "border-dashed border-line-strong [&_svg]:grayscale [&_svg]:opacity-40"}`}>
                    <PartArt part={c.part} size={48} label="" />
                  </span>
                  <span className={`type-body font-semibold ${earned ? "text-ink" : "text-ink-muted"}`}>{BADGES[c.key]}</span>
                  <span className="type-caption text-ink-muted">{earned ? "Earned" : `Finish ${c.title}`}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <DailyQuestion />

      {/* Courses */}
      <section id="courses" className="pt-12 md:pt-16 flex flex-col gap-10 scroll-mt-4">
        <h2 className={`${headline} text-ink text-[56px] leading-[0.92] md:text-[80px]`}>
          Your
          <br />
          courses.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
          {COURSES.map((c) => {
            const isLive = c.status === "live";
            const finished = isLive && complete(c.key);
            const nextCourse = finished ? live.find((o) => o.key !== c.key && !complete(o.key)) : undefined;
            const nextHref = nextCourse && (nextCourse.lessons.find((l) => !done.has(l.key) && canAccess(guest, l.key)) ? `/lesson/${nextCourse.lessons.find((l) => !done.has(l.key))!.key}` : "/pricing");
            return (
              <div key={c.key} className="flex flex-col gap-6 border-t-2 border-ink pt-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <PartArt part={c.part} size={48} label="" className={isLive ? "" : "grayscale opacity-60"} />
                    <h3 className={`${headline} text-ink text-[32px] leading-none`}>{c.title}</h3>
                  </div>
                  {isLive ? <span className="type-caption font-semibold text-brand">{c.lessons.filter((l) => done.has(l.key)).length}/{c.lessons.length} done</span> : <Tag tone="muted">SOON</Tag>}
                </div>
                {finished && (
                  <div className="flex flex-col gap-3 bg-brand-soft px-5 py-4">
                    <p className={`${headline} text-ink text-[24px] leading-tight`}>You know your {c.title.toLowerCase()} better than most drivers.</p>
                    {nextCourse && nextHref && <ArrowLink href={nextHref}>Next: {nextCourse.title}</ArrowLink>}
                  </div>
                )}
                <CoursePath
                  part={c.part}
                  station={isLive ? { label: BADGES[c.key], earned: finished } : undefined}
                  nodes={
                    isLive
                      ? c.lessons.map((l) => {
                          const state = stateOf(l.key);
                          return { title: l.title, state, href: state === "locked" ? "/pricing" : `/lesson/${l.key}` };
                        })
                      : [{ title: c.outline?.[0] ?? c.title, state: "soon", href: `/course/${c.key}` }]
                  }
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
