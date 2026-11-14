import { Flame } from "lucide-react";
import { ProgressBar, Tag } from "@/components/ui/primitives";
import { SimulateNextDay } from "./SimulateNextDay";

// Spec: docs/design/components/StreakBar/README.md
export function StreakBar({ streak, xp, isPremium, isDemo, progress }: { streak: number; xp: number; isPremium: boolean; isDemo: boolean; progress?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-pill bg-amber text-on-amber px-3 py-1.5" aria-label={`${streak} day streak`}>
          <Flame size={18} aria-hidden />
          <span className="type-stat text-[18px] leading-none">{streak}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-pill bg-surface border border-line px-3 py-1.5">
          <span className="type-stat text-[18px] leading-none text-amber-ink">{xp}</span>
          <span className="type-label text-[11px] text-ink-muted">XP</span>
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
