import { Flame, Snowflake } from "lucide-react";
import { Gauge } from "@/components/ui/Gauge";
import { ProgressBar, Tag } from "@/components/ui/primitives";
import type { DayState } from "@/lib/progress";
import { SimulateNextDay } from "./SimulateNextDay";

// Spec: docs/design/components/StreakBar/README.md
const XP_PER_LEVEL = 100;

const dayStyle: Record<DayState, string> = {
  done: "bg-brand text-on-brand",
  frozen: "bg-surface border-2 border-ink text-ink",
  today: "border-2 border-dashed border-brand text-brand",
  missed: "bg-surface-sunken text-ink-muted",
  upcoming: "border border-line text-ink-muted",
};

export function StreakBar({ streak, xp, isPremium, isDemo, progress, week, freezeReady, celebrate, instant }: {
  streak: number; xp: number; isPremium: boolean; isDemo: boolean; progress?: number;
  week?: { day: string; label: string; state: DayState }[]; freezeReady?: boolean; celebrate?: boolean; instant?: boolean;
}) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  const shown = Math.floor(into);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex flex-col gap-2">
          <span className="inline-flex items-center gap-2">
            <span key={celebrate ? `c${streak}` : "s"} className={`inline-flex items-center gap-1 rounded-pill bg-amber text-on-amber px-3 py-1.5 ${celebrate ? "flame-pop" : ""}`} aria-label={`${streak} day streak`}>
              <Flame size={18} aria-hidden />
              <span className="type-stat text-[18px] leading-none">{streak}</span>
            </span>
            {freezeReady !== undefined && (
              <span title={freezeReady ? "Streak freeze ready: one missed day this week won't break your streak" : "Streak freeze used this week"} className={`inline-flex items-center gap-1 type-label text-[10px] ${freezeReady ? "text-ink" : "text-ink-muted line-through"}`}>
                <Snowflake size={14} aria-hidden />
                Freeze
              </span>
            )}
          </span>
          {/* Week strip: last 7 days. Never color alone: frozen shows a snowflake, today is dashed. */}
          {week && (
            <span className="flex gap-1" aria-label="This week, Monday to Sunday">
              {week.map((d) => (
                <span key={d.day} title={`${d.day}: ${d.state}`} className={`size-6 flex items-center justify-center type-label text-[10px] ${dayStyle[d.state]}`}>
                  {d.state === "frozen" ? <Snowflake size={12} aria-label="frozen" /> : d.label}
                </span>
              ))}
            </span>
          )}
        </span>
        <span className="inline-flex flex-col items-center relative">
          <Gauge
            value={into}
            instant={instant}
            label={`Level ${level}, ${shown} of ${XP_PER_LEVEL} XP to level ${level + 1}`}
            center={
              <span className="flex items-baseline gap-1">
                <span className="type-label text-[10px] text-ink-muted">LVL</span>
                <span key={level} className={`type-stat text-[20px] text-amber-ink ${celebrate ? "flame-pop" : ""}`}>{level}</span>
              </span>
            }
          />
          <span className="type-data text-[12px] text-ink-muted">
            {shown}/{XP_PER_LEVEL} XP
          </span>
        </span>
        {isPremium && <span className="rounded-pill bg-plate text-on-plate px-3 py-1.5 type-label text-[11px]">PRO</span>}
        {isDemo && (
          <span className="ml-auto inline-flex items-center gap-2">
            <Tag tone="amber">DEMO</Tag>
            <SimulateNextDay />
          </span>
        )}
      </div>
      {progress !== undefined && <ProgressBar value={progress} label="Lesson progress" />}
    </div>
  );
}
