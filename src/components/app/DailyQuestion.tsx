"use client";

import { Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizOption, type OptionState } from "@/components/lesson/QuizOption";
import { headline } from "@/components/ui/site";

type Q = { key: string; q: string; options: string[]; lessonTitle: string };
type Done = { correct: boolean; answerIndex: number; picked?: number; xpGained?: number };

// Question of the day: one quiz question from a finished lesson. 10 seconds, +5 XP if right, once a day.
export function DailyQuestion() {
  const router = useRouter();
  const [q, setQ] = useState<Q | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/daily").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (!d?.question) return;
      setQ(d.question);
      if (d.answered) setDone(d.answered);
    }).catch(() => {});
  }, []);

  if (!q) return null;

  async function answer(i: number) {
    setBusy(true);
    const res = await fetch("/api/daily", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answer: i }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setDone({ ...data, picked: i });
      router.refresh();
    }
  }

  const stateOf = (i: number): OptionState => !done ? "idle" : i === done.answerIndex ? "correct" : i === done.picked ? "wrong" : "idle";

  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <div className="flex items-center gap-2 type-label text-[12px] text-brand">
        <Sun size={16} aria-hidden /> Question of the day · +5 XP
      </div>
      <h2 className={`${headline} text-ink text-[28px] leading-[0.95] md:text-[36px]`}>{q.q}</h2>
      <p className="type-caption text-ink-muted">From “{q.lessonTitle}”</p>
      <div className="grid gap-2 md:grid-cols-2">
        {q.options.map((o, i) => (
          <QuizOption key={i} letter={"ABCD"[i]} text={o} state={stateOf(i)} disabled={!!done || busy} onClick={() => answer(i)} />
        ))}
      </div>
      {done && (
        <p className="type-body font-semibold" role="status">
          {done.correct ? <span className="text-brand">Right. {done.xpGained ? `+${done.xpGained} XP.` : ""}</span> : <span className="text-ink">Not this time. New question tomorrow.</span>}
        </p>
      )}
    </section>
  );
}
