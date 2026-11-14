"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StreakBar } from "@/components/app/StreakBar";
import { LessonCard } from "@/components/lesson/LessonCard";
import { QuizOption, type OptionState } from "@/components/lesson/QuizOption";
import { SafetyNote } from "@/components/lesson/SafetyNote";
import { ArrowButton, ArrowLink, headline, SiteNav } from "@/components/ui/site";
import { findLesson } from "@/content/catalog";
import { canAccess } from "@/lib/access";
import type { Me } from "@/lib/progress";
import type { PublicLesson } from "@/lib/types";

type Result = { score: number; total: number; correct: number[]; xpGained: number; streak: number };
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

  const load = useCallback(async () => {
    setFailed(false);
    const res = await fetch(`/api/lessons/${key}`).catch(() => null);
    if (res?.status === 402) return router.replace("/pricing");
    if (res?.status === 409) return router.replace("/onboarding");
    if (!res?.ok) return setFailed(true);
    setLesson((await res.json()).lesson);
  }, [key, router]);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setMe).catch(() => {});
    load();
  }, [load]);

  const found = findLesson(key);
  const car = me?.car;
  const carName = car ? `${car.year} ${car.model}` : "car";
  const shell = { me, title: found?.lesson.title ?? "Lesson", course: found?.course?.title ?? (found?.isPart ? "3D Brake Lab" : "") };

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
        <p className={`${headline} text-ink text-[40px] leading-[0.95] md:text-[56px] animate-pulse`} role="status">
          Writing a lesson for your <span className="text-brand">{carName}</span>…
        </p>
      </Shell>
    );

  const nCards = lesson.cards.length;
  const total = nCards + lesson.quiz.length;

  if (result) {
    const idx = found?.course?.lessons.findIndex((l) => l.key === key) ?? -1;
    const next = idx >= 0 ? found?.course?.lessons[idx + 1] : undefined;
    const nextOpen = next && me && canAccess(me.guest, next.key);
    return (
      <Shell {...shell} progress={1} streak={result.streak} xpBonus={result.xpGained}>
        <div className="flex flex-col gap-3 border-b border-line pb-8">
          <h2 className={`${headline} text-ink text-[72px] leading-[0.9] md:text-[104px]`}>
            <span className="text-brand">{result.score}</span>/{result.total}
          </h2>
          <p className="type-body-lg text-ink">correct · <span className="text-brand font-semibold">+{result.xpGained} XP</span> · {result.streak} day streak</p>
        </div>
        {lesson.quiz.map((q, qi) => (
          <div key={qi} className="flex flex-col gap-3">
            <h3 className={`${headline} text-ink text-[24px] leading-tight`}>{q.q}</h3>
            {q.options.map((o, oi) => (
              <QuizOption key={oi} letter={LETTERS[oi]} text={o} disabled state={oi === result.correct[qi] ? "correct" : oi === answers[qi] ? "wrong" : "idle"} />
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-8 border-t border-line pt-8">
          {next && (nextOpen ? <ArrowLink href={`/lesson/${next.key}`}>Next lesson</ArrowLink> : <ArrowLink href="/pricing">Unlock with Pro</ArrowLink>)}
          <ArrowLink href="/app">Back to my courses</ArrowLink>
        </div>
      </Shell>
    );
  }

  if (step < nCards) {
    const card = lesson.cards[step];
    return (
      <Shell {...shell} progress={step / total}>
        <LessonCard card={card} carLine={lesson.carLine} costs={card.kind === "fix" ? lesson.costs : undefined} n={step + 1} total={nCards} />
        {(step === 0 || card.kind === "fix") && <SafetyNote text={lesson.safety} />}
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
    if (res?.status === 402) return router.replace("/pricing");
    if (res?.ok) setResult(await res.json());
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

function Shell({ me, title, course, progress, streak, xpBonus = 0, children }: { me: Me | null; title: string; course: string; progress?: number; streak?: number; xpBonus?: number; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1120px] px-4 md:px-10 pb-16">
      <SiteNav left={[{ href: "/app", label: "My courses" }]} right={[{ href: "/pricing", label: "Pricing" }]} />
      {/* Thin red progress line under the nav. */}
      <div className="h-1 bg-line" role="progressbar" aria-label="Lesson progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress ?? 0) * 100)}>
        <div className="h-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${(progress ?? 0) * 100}%` }} />
      </div>
      <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end border-b border-line py-8">
        <div className="flex flex-col gap-2">
          {course && <span className="type-label text-[12px] text-brand">{course}</span>}
          <h1 className={`${headline} text-ink text-[32px] leading-[0.95] md:text-[44px]`}>{title}</h1>
        </div>
        {me && <StreakBar streak={streak ?? me.streak} xp={me.xp + xpBonus} isPremium={me.guest.isPremium} isDemo={false} />}
      </header>
      <div className="mx-auto max-w-[720px] pt-10 flex flex-col gap-8">{children}</div>
    </main>
  );
}
