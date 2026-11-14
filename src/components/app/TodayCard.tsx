"use client";

import { useEffect, useState } from "react";
import { ArrowLink, headline } from "@/components/ui/site";

// Lesson page saves {key, title, step, total, answers} here while a lesson is open; cleared on finish.
export const RESUME_KEY = "wrenchly:resume";
export type Resume = { key: string; title: string; step: number; total: number; answers: number[] };

export function readResume(): Resume | null {
  try {
    return JSON.parse(localStorage.getItem(RESUME_KEY) ?? "null");
  } catch {
    return null;
  }
}

type Next = { title: string; course: string; href: string; locked: boolean } | null;

// Top of /app: "Continue" for an abandoned lesson, else today's next lesson.
export function TodayCard({ next, doneKeys }: { next: Next; doneKeys: string[] }) {
  const [resume, setResume] = useState<Resume | null>(null);
  useEffect(() => {
    const r = readResume();
    setResume(r && r.step > 0 && !doneKeys.includes(r.key) ? r : null);
  }, [doneKeys]);

  if (resume)
    return (
      <Shell label="Pick up where you left off">
        <h2 className={`${headline} text-ink text-[32px] leading-[0.95] md:text-[40px]`}>{resume.title}</h2>
        <div className="flex flex-wrap items-center gap-6">
          <span className="type-data text-ink-muted">Step {resume.step + 1} of {resume.total}</span>
          <ArrowLink href={`/lesson/${resume.key}`}>Continue lesson</ArrowLink>
        </div>
      </Shell>
    );

  if (!next)
    return (
      <Shell label="Today">
        <h2 className={`${headline} text-ink text-[32px] leading-[0.95] md:text-[40px]`}>Every live lesson done. New courses are on the way.</h2>
      </Shell>
    );

  return (
    <Shell label={`Today · ${next.course}`}>
      <h2 className={`${headline} text-ink text-[32px] leading-[0.95] md:text-[40px]`}>{next.title}</h2>
      <ArrowLink href={next.href}>{next.locked ? "Unlock with Pro" : "Start today's lesson"}</ArrowLink>
    </Shell>
  );
}

function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-l-4 border-brand bg-surface px-5 py-5">
      <span className="type-label text-[12px] text-brand">{label}</span>
      {children}
    </section>
  );
}
