"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StreakBar } from "@/components/app/StreakBar";
import { LessonCard } from "@/components/lesson/LessonCard";
import { QuizOption, type OptionState } from "@/components/lesson/QuizOption";
import { SafetyNote } from "@/components/lesson/SafetyNote";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
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

  if (failed)
    return (
      <Shell me={me}>
        <Card className="flex flex-col gap-4">
          <p className="type-body-lg">We couldn&apos;t write this lesson right now.</p>
          <Button onClick={load}>Try again</Button>
        </Card>
      </Shell>
    );

  if (!lesson)
    return (
      <Shell me={me}>
        <p className="type-h2 animate-pulse" role="status">Writing a lesson for your {carName}…</p>
      </Shell>
    );

  const nCards = lesson.cards.length;
  const total = nCards + lesson.quiz.length;

  if (result) {
    const idx = found?.course?.lessons.findIndex((l) => l.key === key) ?? -1;
    const next = idx >= 0 ? found?.course?.lessons[idx + 1] : undefined;
    const nextOpen = next && me && canAccess(me.guest, next.key);
    return (
      <Shell me={me} streak={result.streak} xpBonus={result.xpGained}>
        <Card className="flex flex-col gap-2">
          <h1 className="type-h1">{result.score} of {result.total} correct</h1>
          <p className="type-body-lg">+{result.xpGained} XP · {result.streak} day streak</p>
        </Card>
        {lesson.quiz.map((q, qi) => (
          <div key={qi} className="flex flex-col gap-3">
            <h2 className="type-h3">{q.q}</h2>
            {q.options.map((o, oi) => (
              <QuizOption key={oi} letter={LETTERS[oi]} text={o} disabled state={oi === result.correct[qi] ? "correct" : oi === answers[qi] ? "wrong" : "idle"} />
            ))}
          </div>
        ))}
        {next ? (
          nextOpen ? <ButtonLink href={`/lesson/${next.key}`} full>Next lesson</ButtonLink> : <ButtonLink href="/pricing" variant="pro" full>Unlock with Premium</ButtonLink>
        ) : null}
        <ButtonLink href="/app" variant="secondary" full>Back to my courses</ButtonLink>
      </Shell>
    );
  }

  if (step < nCards) {
    const card = lesson.cards[step];
    return (
      <Shell me={me} progress={step / total}>
        <LessonCard card={card} carLine={lesson.carLine} costs={card.kind === "fix" ? lesson.costs : undefined} />
        {(step === 0 || card.kind === "fix") && <SafetyNote text={lesson.safety} />}
        <div className="flex gap-3">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button full onClick={() => setStep(step + 1)}>{step === nCards - 1 ? "Start quiz" : "Continue"}</Button>
        </div>
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
    <Shell me={me} progress={step / total}>
      <span className="type-label text-[12px] text-brand">QUESTION {qi + 1} OF {lesson.quiz.length}</span>
      <h2 className="type-h2">{q.q}</h2>
      <div className="flex flex-col gap-3">
        {q.options.map((o, oi) => {
          const state: OptionState = answers[qi] === oi ? "selected" : "idle";
          return <QuizOption key={oi} letter={LETTERS[oi]} text={o} state={state} onClick={() => setAnswers((a) => Object.assign([...a], { [qi]: oi }))} />;
        })}
      </div>
      <Button full disabled={answers[qi] === undefined || submitting} onClick={last ? submit : () => setStep(step + 1)}>
        {last ? (submitting ? "Checking…" : "Finish") : "Next question"}
      </Button>
    </Shell>
  );
}

function Shell({ me, progress, streak, xpBonus = 0, children }: { me: Me | null; progress?: number; streak?: number; xpBonus?: number; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[640px] px-4 py-6 md:py-10 flex flex-col gap-5">
      {me && <StreakBar streak={streak ?? me.streak} xp={me.xp + xpBonus} isPremium={me.guest.isPremium} isDemo={false} progress={progress} />}
      {children}
    </main>
  );
}
