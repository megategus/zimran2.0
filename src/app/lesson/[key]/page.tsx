"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StreakBar } from "@/components/app/StreakBar";
import { readResume, RESUME_KEY } from "@/components/app/TodayCard";
import { LessonCard } from "@/components/lesson/LessonCard";
import { QuizOption, type OptionState } from "@/components/lesson/QuizOption";
import { SafetyNote } from "@/components/lesson/SafetyNote";
import { BadgeEarned, Feedback, LoadingFacts, ShareResult } from "@/components/lesson/extras";
import { ArrowButton, ArrowLink, headline, SiteNav } from "@/components/ui/site";
import { BADGES, COURSES, findLesson, SHOP_QUERY } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import { pricingHref } from "@/lib/paywall";
import type { Me } from "@/lib/progress";
import type { PublicLesson } from "@/lib/types";

type Result = { score: number; total: number; correct: number[]; why?: (string | null)[]; xpGained: number; streak: number };
const LETTERS = ["A", "B", "C", "D"];

export default function LessonPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [lesson, setLesson] = useState<PublicLesson | null>(null);
  const [failed, setFailed] = useState(false);
  const [step, setStep] = useState(0); // 0..cards-1 = cards, then quiz questions
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [simple, setSimple] = useState<Record<number, string>>({}); // "Explain like I'm new" rewrites per card
  const [showSimple, setShowSimple] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [xpView, setXpView] = useState<{ xp: number; instant?: boolean } | null>(null); // staged XP for the level-up sweep

  const load = useCallback(async () => {
    setFailed(false);
    const res = await fetch(`/api/lessons/${key}`).catch(() => null);
    if (res?.status === 402) return router.replace(pricingHref(key));
    if (res?.status === 409) return router.replace("/onboarding");
    if (!res?.ok) return setFailed(true);
    setLesson((await res.json()).lesson);
    // Came back to an abandoned lesson: restore where it stopped.
    const r = readResume();
    if (r?.key === key) {
      setStep(r.step);
      setAnswers(r.answers ?? []);
    }
  }, [key, router]);

  // Save progress while the lesson is open, so /app can offer "Continue lesson". Cleared on finish.
  useEffect(() => {
    try {
      if (result) localStorage.removeItem(RESUME_KEY);
      else if (lesson && step > 0) localStorage.setItem(RESUME_KEY, JSON.stringify({ key, title: lesson.title, step, total: lesson.cards.length + lesson.quiz.length, answers }));
    } catch {}
  }, [key, lesson, step, answers, result]);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {});
    load();
  }, [load]);

  const found = findLesson(key);
  const car = me?.car;
  const shell = { me, title: found?.lesson.title ?? "Lesson", course: found?.course?.title ?? (found?.isPart ? "3D Brake Lab" : ""), xpView };
  const part = found?.course?.part ?? "rotor";

  if (failed)
    return (
      <Shell {...shell}>
        <p className={`${headline} text-ink text-[40px] leading-[0.95]`}>We couldn&apos;t write this lesson right now.</p>
        <ArrowButton onClick={load}>Try again</ArrowButton>
      </Shell>
    );

  if (!lesson)
    return (
      <Shell {...shell}>
        <LoadingFacts car={car} part={part} />
      </Shell>
    );

  const nCards = lesson.cards.length;
  const total = nCards + lesson.quiz.length;

  if (result) {
    const idx = found?.course?.lessons.findIndex((l) => l.key === key) ?? -1;
    const next = idx >= 0 ? found?.course?.lessons[idx + 1] : undefined;
    const nextOpen = next && me && canAccess(me.guest, next.key);
    // Next lesson locked: point at another free lesson first, Pro second.
    const freeNext = !nextOpen && me
      ? COURSES.filter((c) => c.status === "live").flatMap((c) => c.lessons).find((l) => l.key !== key && canAccess(me.guest, l.key) && !me.progress.some((p) => p.lessonKey === l.key))
      : undefined;
    const streakUp = result.streak > (me?.streak ?? 0);
    // This lesson finished the course: the badge lights up.
    const doneKeys = new Set([...(me?.progress.map((p) => p.lessonKey) ?? []), key]);
    const badge = found?.course && found.course.lessons.every((l) => doneKeys.has(l.key)) ? BADGES[found.course.key] : undefined;
    return (
      <Shell {...shell} progress={1} streak={result.streak} celebrate>
        <div className="flex flex-col gap-3 border-b border-line pb-8">
          <h2 className={`${headline} text-ink text-[72px] leading-[0.9] md:text-[104px]`}>
            <span className="text-brand">{result.score}</span>/{result.total}
          </h2>
          <p className="type-body-lg text-ink">correct · <span className="text-brand font-semibold">+{result.xpGained} XP</span></p>
          <p role="status" className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 rounded-pill bg-amber text-on-amber px-3 py-1.5 type-stat text-[18px] leading-none ${streakUp ? "flame-pop" : ""}`} aria-hidden>
              <Flame size={18} />{result.streak}
            </span>
            <span className="type-body-lg text-ink">
              {streakUp
                ? result.streak === 1 ? "Streak started! Come back tomorrow to keep it going." : `Day ${result.streak}! Today counts toward your streak.`
                : `Today already counts. ${result.streak}-day streak, see you tomorrow.`}
            </span>
          </p>
        </div>
        {badge && <BadgeEarned name={badge} part={part} />}
        <ShareResult score={result.score} total={result.total} course={shell.course || lesson.title} streak={result.streak} />
        {lesson.quiz.map((q, qi) => (
          <div key={qi} className="flex flex-col gap-3">
            <h3 className={`${headline} text-ink text-[24px] leading-tight`}>{q.q}</h3>
            {q.options.map((o, oi) => (
              <QuizOption key={oi} letter={LETTERS[oi]} text={o} disabled state={oi === result.correct[qi] ? "correct" : oi === answers[qi] ? "wrong" : "idle"} />
            ))}
            {result.why?.[qi] && (
              <p className={`type-body border-l-4 pl-3 ${answers[qi] === result.correct[qi] ? "border-line-strong text-ink-muted" : "border-brake text-ink"}`}>
                <span className="font-semibold">{answers[qi] === result.correct[qi] ? "Right. " : "Why: "}</span>{result.why[qi]}
              </p>
            )}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-8 border-t border-line pt-8">
          {next && nextOpen && <ArrowLink href={`/lesson/${next.key}`}>Next lesson</ArrowLink>}
          {!nextOpen && freeNext && <ArrowLink href={`/lesson/${freeNext.key}`}>Next free lesson: {freeNext.title}</ArrowLink>}
          {next && !nextOpen && (
            <Link href={pricingHref(next.key)} className="type-body text-ink underline underline-offset-4 hover:text-brand">Unlock “{next.title}” with Pro</Link>
          )}
          <ArrowLink href="/app">Back to my courses</ArrowLink>
        </div>
        <Feedback lessonKey={key} />
      </Shell>
    );
  }

  if (step < nCards) {
    const card = lesson.cards[step];
    return (
      <Shell {...shell} progress={step / total}>
        <LessonCard card={showSimple && simple[step] ? { ...card, body: simple[step] } : card} carLine={lesson.carLine} costs={card.kind === "fix" ? lesson.costs : undefined} n={step + 1} total={nCards} />
        <button
          type="button"
          disabled={simplifying}
          onClick={async () => {
            if (simple[step]) return setShowSimple((v) => !v);
            setSimplifying(true);
            const res = await fetch(`/api/lessons/${key}/simplify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ card: step }) }).catch(() => null);
            const data = await res?.json().catch(() => null);
            setSimplifying(false);
            if (data?.body) {
              setSimple((m) => ({ ...m, [step]: data.body }));
              setShowSimple(true);
            }
          }}
          className="self-start type-body text-brand underline underline-offset-4 cursor-pointer disabled:text-ink-muted"
        >
          {simplifying ? "Rewriting it simpler…" : showSimple && simple[step] ? "Show original" : "Explain like I'm new"}
        </button>
        {(step === 0 || card.kind === "fix") && <SafetyNote text={lesson.safety} shopQuery={found?.course ? SHOP_QUERY[found.course.key] : undefined} />}
        <Nav onBack={step > 0 ? () => setStep(step - 1) : undefined}>
          <ArrowButton onClick={() => setStep(step + 1)}>{step === nCards - 1 ? "Start quiz" : "Continue"}</ArrowButton>
        </Nav>
      </Shell>
    );
  }

  const qi = step - nCards;
  const q = lesson.quiz[qi];
  const last = qi === lesson.quiz.length - 1;
  const submit = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/lessons/${key}/complete`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) }).catch(() => null);
    setSubmitting(false);
    if (res?.status === 402) return router.replace(pricingHref(key));
    if (res?.ok) {
      const r: Result = await res.json();
      setResult(r);
      // XP sweep: if this crosses a level, run the needle to the end, snap to zero, then on to the new value.
      const from = me?.xp ?? 0, to = from + r.xpGained, top = Math.floor(to / 100) * 100;
      if (me && Math.floor(from / 100) < Math.floor(to / 100)) {
        setXpView({ xp: top - 0.01 });
        setTimeout(() => setXpView({ xp: top, instant: true }), 950);
        setTimeout(() => setXpView({ xp: to }), 1050);
      } else setXpView({ xp: to });
    }
    else setFailed(true);
  };
  return (
    <Shell {...shell} progress={step / total}>
      <div className="flex items-baseline gap-3">
        <span className={`${headline} text-brand text-[44px] leading-none`}>Q{qi + 1}</span>
        <span className="type-label text-[12px] text-ink-muted">/ {lesson.quiz.length} · QUIZ</span>
      </div>
      <h2 className={`${headline} text-ink text-[36px] leading-[0.95] md:text-[48px]`}>{q.q}</h2>
      <div className="flex flex-col gap-3">
        {q.options.map((o, oi) => {
          const state: OptionState = answers[qi] === oi ? "selected" : "idle";
          return <QuizOption key={oi} letter={LETTERS[oi]} text={o} state={state} onClick={() => setAnswers((a) => Object.assign([...a], { [qi]: oi }))} />;
        })}
      </div>
      <Nav onBack={() => setStep(step - 1)}>
        <ArrowButton disabled={answers[qi] === undefined || submitting} onClick={last ? submit : () => setStep(step + 1)}>
          {last ? (submitting ? "Checking…" : "Finish") : "Next question"}
        </ArrowButton>
      </Nav>
    </Shell>
  );
}

function Nav({ onBack, children }: { onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 border-t border-line pt-6">
      {onBack ? (
        <button type="button" onClick={onBack} className="type-body text-ink-muted underline underline-offset-4 decoration-line-strong hover:text-ink cursor-pointer">
          Back
        </button>
      ) : <span />}
      {children}
    </div>
  );
}

function Shell({ me, title, course, progress, streak, xpView, celebrate, children }: { me: Me | null; title: string; course: string; progress?: number; streak?: number; xpView?: { xp: number; instant?: boolean } | null; celebrate?: boolean; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav left={[{ href: "/app", label: "My courses" }]} right={me?.guest.isPremium ? [{ href: "/chat", label: "AI Mechanic" }] : [{ href: "/pricing", label: "Go Pro" }]} />
      {/* Thin red progress line under the nav. */}
      <div className="h-1 bg-line" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress ?? 0) * 100)}>
        <div className="h-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${(progress ?? 0) * 100}%` }} />
      </div>
      <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end border-b border-line py-8">
        <div className="flex flex-col gap-2">
          {course && <span className="type-label text-[12px] text-brand">{course}</span>}
          <h1 className={`${headline} text-ink text-[32px] leading-[0.95] md:text-[44px]`}>{title}</h1>
          {me?.car && <p className="type-caption text-ink-muted">Written for your {me.car.model} by Claude · data from NHTSA</p>}
        </div>
        {me && <StreakBar streak={streak ?? me.streak} xp={xpView?.xp ?? me.xp} instant={xpView?.instant} isPremium={me.guest.isPremium} isDemo={false} celebrate={celebrate} />}
      </header>
      <div className="mx-auto max-w-[720px] pt-10 flex flex-col gap-8">{children}</div>
    </main>
  );
}
