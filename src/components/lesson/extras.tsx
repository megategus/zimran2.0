"use client";

import { Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { PartArt } from "@/components/art/PartArt";
import { headline } from "@/components/ui/site";
import type { Car } from "@/lib/types";

// While Claude writes the lesson: rotate real NHTSA facts about this car and spin the course's part.
export function LoadingFacts({ car, part }: { car: Car | null | undefined; part: string }) {
  const facts = car
    ? [
        `${car.year} ${titleCase(car.make)} ${car.model}${car.trim ? ` ${car.trim}` : ""}`,
        ...(car.engine ? [`Engine: ${car.engine}`] : []),
        ...Object.entries(car.specs).map(([k, v]) => `${k}: ${v}`),
        car.recalls.length ? `${car.recalls.length} recall${car.recalls.length > 1 ? "s" : ""} for this model, e.g. ${car.recalls[0].component.split(":")[0].toLowerCase()}` : "No recalls on record for this model",
      ]
    : [];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1), 2500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-start gap-6" role="status">
      <PartArt part={part} size={96} label="" className="animate-[spin_3s_linear_infinite] motion-reduce:animate-none" />
      <p className={`${headline} text-ink text-[36px] leading-[0.95] md:text-[48px]`}>
        Writing a lesson for your <span className="text-brand">{car ? `${car.year} ${car.model}` : "car"}</span>…
      </p>
      {facts.length > 0 && (
        <div className="flex flex-col gap-1 border-l-4 border-brand pl-4">
          <span className="type-label text-[11px] text-ink-muted">From NHTSA, about your car</span>
          <p key={i} className="type-body-lg text-ink">{facts[i % facts.length]}</p>
        </div>
      )}
      <p className="type-caption text-ink-muted">Claude is writing this for your exact car. Usually 5–15 seconds; next time it opens instantly.</p>
    </div>
  );
}

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// One-tap lesson feedback.
export function Feedback({ lessonKey }: { lessonKey: string }) {
  const [sent, setSent] = useState<boolean | null>(null);
  const send = (helpful: boolean) => {
    setSent(helpful);
    fetch(`/api/lessons/${lessonKey}/feedback`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ helpful }) }).catch(() => {});
  };
  if (sent !== null) return <p className="type-body text-ink-muted" role="status">Thanks. {sent ? "Glad it helped." : "We'll use that to tune lessons for your car."}</p>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="type-label text-[11px] text-ink-muted">Was this lesson right for you?</span>
      <button type="button" onClick={() => send(true)} className="inline-flex items-center gap-2 border border-line-strong px-3 py-2 type-body hover:border-brand cursor-pointer"><ThumbsUp size={16} aria-hidden />Helpful</button>
      <button type="button" onClick={() => send(false)} className="inline-flex items-center gap-2 border border-line-strong px-3 py-2 type-body hover:border-brand cursor-pointer"><ThumbsDown size={16} aria-hidden />Not for my car</button>
    </div>
  );
}

// Shareable result card + native share sheet (falls back to copying the text).
export function ShareResult({ score, total, course, streak }: { score: number; total: number; course: string; streak: number }) {
  const [status, setStatus] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const text = `${score}/${total} on ${course} · ${streak}-day streak on Wrenchly. Learning my own car, 5 minutes a day.`;
  async function share() {
    const url = location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Wrenchly", text, url });
        return setStatus("shared");
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setStatus("copied");
    } catch (e) {
      // Closing the share sheet is not an error worth showing.
      if ((e as Error)?.name !== "AbortError") setStatus("failed");
    }
  }
  return (
    <div className="flex flex-col gap-4 bg-plate text-on-plate p-6">
      <span className="type-label text-[11px] opacity-70">WRENCHLY</span>
      <p className={`${headline} text-[40px] leading-[0.95]`}>
        <span className="text-brand">{score}/{total}</span> on {course}
        <br />
        {streak}-day streak
      </p>
      <button type="button" onClick={share} className="self-start inline-flex items-center gap-2 bg-brand text-on-brand px-4 py-2.5 type-label text-[12px] cursor-pointer">
        <Share2 size={16} aria-hidden />
        Share
      </button>
      <span role="status" className="type-caption opacity-80 min-h-4">
        {status === "shared" ? "Shared." : status === "copied" ? "Copied to clipboard. Paste it anywhere." : status === "failed" ? "Couldn't share from this browser." : ""}
      </span>
    </div>
  );
}

// Course badge lighting up on the result screen.
export function BadgeEarned({ name, part }: { name: string; part: string }) {
  return (
    <div className="flex items-center gap-5 bg-brand-soft px-5 py-5">
      <span className="flame-pop size-20 shrink-0 rounded-full border-[3px] border-brand bg-surface flex items-center justify-center">
        <PartArt part={part} size={48} label="" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="type-label text-[11px] text-brand">Badge earned</span>
        <span className={`${headline} text-ink text-[32px] leading-none`}>{name}</span>
      </div>
    </div>
  );
}
