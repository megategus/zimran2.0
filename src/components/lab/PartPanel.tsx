"use client";

import { Check, TriangleAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PublicLesson } from "@/lib/types";

type Result = { score: number; total: number; correct: number[]; xpGained: number; streak: number };

// Mini-lesson for one part. Mount with key={partKey} so state resets per part.
export function PartPanel({ partKey, name, onXp }: { partKey: string; name: string; onXp: (xp: number) => void }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<PublicLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLesson(null);
    try {
      const res = await fetch(`/api/lessons/${partKey}`);
      if (res.status === 402) return router.replace("/pricing");
      if (res.status === 409) return router.replace("/onboarding");
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.lesson) throw new Error();
      setLesson(data.lesson);
    } catch {
      setError("We couldn't write this lesson. Try again.");
    }
  }, [partKey, router]);

  useEffect(() => { void load(); }, [load]);

  async function check() {
    if (!lesson) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${partKey}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.status === 402) return router.replace("/pricing");
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.score !== "number") throw new Error();
      setResult(data);
      onXp(data.xpGained ?? 0);
    } catch {
      setError("Couldn't check your answers. Try again.");
    } finally {
      setChecking(false);
    }
  }

  if (error && !lesson) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="type-h2">{name}</h2>
        <p role="alert">{error}</p>
        <div><Button variant="secondary" onClick={load}>Try again</Button></div>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        <h2 className="type-h2">{name}</h2>
        <p className="text-ink-muted">Writing a lesson about the {name.toLowerCase()} on your car…</p>
      </div>
    );
  }

  const done = lesson.quiz.length > 0 && lesson.quiz.every((_, i) => answers[i] !== undefined);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="type-h2">{lesson.title}</h2>
        <p className="type-data text-ink-muted">{lesson.carLine}</p>
      </div>

      {lesson.cards.map((card) => (
        <section key={card.kind} className="flex flex-col gap-1">
          <h3 className="type-h3">{card.heading}</h3>
          <p className="type-body-lg whitespace-pre-line">{card.body}</p>
        </section>
      ))}

      <div className="rounded-md bg-surface-sunken p-4 flex flex-col gap-1">
        <div className="flex justify-between gap-4"><span>DIY</span><span className="type-data">{lesson.costs.diy}</span></div>
        <div className="flex justify-between gap-4"><span>Shop</span><span className="type-data">{lesson.costs.shop}</span></div>
        <p className="type-caption text-ink-muted">Estimate, varies by region.</p>
      </div>

      {lesson.safety && (
        <div role="note" className="rounded-md bg-brake-soft p-4 flex gap-3">
          <TriangleAlert size={20} className="text-brake shrink-0 mt-0.5" aria-hidden />
          <p><strong className="text-brake">Safety.</strong> {lesson.safety}</p>
        </div>
      )}

      <h3 className="type-label text-ink-muted">Quick quiz</h3>
      {lesson.quiz.map((item, qi) => (
        <fieldset key={qi} className="flex flex-col gap-2" disabled={!!result}>
          <legend className="type-h3 mb-2">{item.q}</legend>
          {item.options.map((opt, oi) => {
            const picked = answers[qi] === oi;
            const right = result ? result.correct?.[qi] === oi : false;
            const wrong = !!result && picked && !right;
            const tone = right ? "border-brand bg-brand-soft" : wrong ? "border-brake bg-brake-soft" : picked ? "border-brand bg-brand-soft" : "border-line-strong bg-surface";
            return (
              <label key={oi} className={`flex items-center gap-3 rounded-md border-2 px-4 py-3 ${result ? "" : "cursor-pointer"} ${tone}`}>
                <input type="radio" name={`${partKey}-q${qi}`} className="sr-only" checked={picked} onChange={() => setAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })} />
                <span className="flex-1">{opt}</span>
                {right && <span className="flex items-center gap-1 type-label text-brand"><Check size={20} aria-hidden />Correct</span>}
                {wrong && <span className="flex items-center gap-1 type-label text-brake"><X size={20} aria-hidden />Not quite</span>}
              </label>
            );
          })}
        </fieldset>
      ))}

      {error && <p role="alert" className="type-caption text-brake">{error}</p>}
      {result ? (
        <p className="rounded-md bg-surface-sunken p-4" role="status">
          <span className="type-stat">{result.score}/{result.total}</span>{" "}
          <span className="type-data text-amber-ink">+{result.xpGained} XP</span>
          <span className="text-ink-muted"> · Pick another part to keep going.</span>
        </p>
      ) : (
        <Button full onClick={check} disabled={!done || checking}>{checking ? "Checking…" : "Check answers"}</Button>
      )}
    </div>
  );
}
