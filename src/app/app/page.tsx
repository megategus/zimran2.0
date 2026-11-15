import { Box, Camera, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
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
import { BADGES, COURSES, findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { pricingHref } from "@/lib/paywall";
import { peekGuest } from "@/lib/guest";
import { getCachedLesson } from "@/lib/lessons/generate";
import { snapshot } from "@/lib/progress";
import { findSentence, seasonTip } from "@/lib/season";

export const dynamic = "force-dynamic";

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());


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
  const next = nextLesson ? { title: nextLesson.title, course: nextLesson.course, href: canAccess(guest, nextLesson.key) ? `/lesson/${nextLesson.key}` : pricingHref(nextLesson.key), locked: !canAccess(guest, nextLesson.key) } : null;

  // Seasonal tip: the figure comes from this car's cached lesson, never hardcoded.
  const tip = seasonTip(new Date(me.today).getUTCMonth());
  const tipLesson = await getCachedLesson(car, tip.lessonKey).catch(() => null);
  const quote = tipLesson ? findSentence(tipLesson, tip.quote) : null;

  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav
        left={[{ href: "#courses", label: "Courses" }, { href: pro ? "/chat" : pricingHref("chat"), label: "AI Mechanic" }]}
        right={[{ href: pro ? "/lab" : pricingHref("lab"), label: "3D Lab" }, { href: "/pricing", label: pro ? "Plan" : "Go Pro" }]}
      />

      {/* Today + seasonal tip */}
      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr] pt-8">
        <TodayCard next={next} doneKeys={[...done]} />
        <aside className="flex flex-col gap-2 bg-surface-sunken px-5 py-5">
          <span className="flex items-center gap-2 type-label text-[12px] text-ink-muted"><CalendarDays size={14} aria-hidden />{tip.month} tip</span>
          <p className="type-body text-ink">{tip.text}</p>
          {quote && <p className="type-body text-ink border-l-2 border-brand pl-3">“{quote}”</p>}
          {tip.lessonKey !== nextLesson?.key && <ArrowLink href={canAccess(guest, tip.lessonKey) ? `/lesson/${tip.lessonKey}` : pricingHref(tip.lessonKey)}>{findLesson(tip.lessonKey)?.lesson.title}</ArrowLink>}
        </aside>
      </section>

      {/* Header: the car as the headline */}
      <section className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end border-b border-line pt-8 md:pt-14 pb-8 md:pb-10">
        <div className="flex flex-col gap-3">
          <span className="type-label text-[12px] text-ink-muted">Your garage · {titleCase(car.make)}</span>
          <h1 className={`${headline} text-ink text-[44px] leading-[0.9] md:text-[96px]`}>
            <span className="text-brand">{car.year}</span>
            <br />
            {car.model}
          </h1>
        </div>
        <StreakBar streak={me.streak} xp={me.xp} isPremium={pro} isDemo={guest.isDemo} week={me.week} freezeReady={me.freezeReady} />
      </section>

      {/* Pro tools: big, right under the car, the first thing after the header. */}
      <section className="grid gap-4 md:grid-cols-2 pt-8">
        {[
          { Icon: Camera, title: "AI Mechanic", body: `Send a photo of a worn part or a repair quote. Get an answer about your ${car.model}.`, href: pro ? "/chat" : pricingHref("chat"), cta: pro ? "Ask a question" : "Unlock with Pro" },
          { Icon: Box, title: "3D Brake Lab", body: "Pull a brake assembly apart piece by piece and learn what each part does.", href: pro ? "/lab" : pricingHref("lab"), cta: pro ? "Open the lab" : "Unlock with Pro" },
        ].map(({ Icon, ...t }) => (
          <Link key={t.title} href={t.href} className="group relative overflow-hidden bg-plate text-on-plate p-8 md:p-10 min-h-[300px] flex flex-col gap-5 transition-transform duration-200 hover:-translate-y-1">
            <span aria-hidden className="absolute -right-6 -bottom-6 size-40 rounded-full bg-brand opacity-20 transition-transform duration-300 group-hover:scale-125" />
            <Icon size={56} className="text-brand relative" aria-hidden />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 relative min-w-0">
              <h2 className={`${headline} text-[48px] leading-none md:text-[56px] lg:text-[72px] break-words min-w-0`}>{t.title}</h2>
              {!pro && <Tag tone="brand">PRO</Tag>}
            </div>
            <p className="type-body-lg opacity-80 max-w-[40ch] relative">{t.body}</p>
            <span className="mt-auto relative inline-flex items-center gap-3 type-body font-semibold text-brand">
              <span className="size-9 bg-brand text-on-brand flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"><ChevronRight size={18} aria-hidden /></span>
              {t.cta}
            </span>
          </Link>
        ))}
      </section>

      {/* Specs + badges */}
      <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] border-b border-line py-10">
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
        <h2 className={`${headline} text-ink text-[44px] leading-[0.92] md:text-[80px]`}>
          Your
          <br />
          courses.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
          {live.map((c) => {
            const isLive = true;
            const finished = isLive && complete(c.key);
            const nextCourse = finished ? live.find((o) => o.key !== c.key && !complete(o.key)) : undefined;
            const nextHref = nextCourse && (nextCourse.lessons.find((l) => !done.has(l.key) && canAccess(guest, l.key)) ? `/lesson/${nextCourse.lessons.find((l) => !done.has(l.key))!.key}` : pricingHref(nextCourse.lessons.find((l) => !done.has(l.key))?.key));
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
                          return { title: l.title, state, href: state === "locked" ? pricingHref(l.key) : `/lesson/${l.key}` };
                        })
                      : [{ title: c.outline?.[0] ?? c.title, state: "soon", href: `/course/${c.key}` }]
                  }
                />
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-6">
          <span className="type-label text-[11px] text-ink-muted mr-2">Coming soon</span>
          {COURSES.filter((c) => c.status === "soon").map((c) => (
            <Link key={c.key} href={`/course/${c.key}`} className="inline-flex items-center gap-1.5 border border-line-strong px-3 py-1.5 type-caption text-ink hover:border-brand">
              <PartArt part={c.part} size={48} label="" className="size-5 grayscale" />
              {c.title}
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}
