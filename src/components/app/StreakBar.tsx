import { Flame } from "lucide-react";
import { Gauge } from "@/components/ui/Gauge";
import { ProgressBar, Tag } from "@/components/ui/primitives";
import { SimulateNextDay } from "./SimulateNextDay";

// Spec: docs/design/components/StreakBar/README.md
const XP_PER_LEVEL = 100;

export function StreakBar({ streak, xp, isPremium, isDemo, progress }: { streak: number; xp: number; isPremium: boolean; isDemo: boolean; progress?: number }) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-pill bg-amber text-on-amber px-3 py-1.5" aria-label={`${streak} day streak`}>
          <Flame size={18} aria-hidden />
          <span className="type-stat text-[18px] leading-none">{streak}</span>
        </span>
        <span className="inline-flex flex-col items-center">
          <Gauge
            value={into}
            label={`Level ${level}, ${into} of ${XP_PER_LEVEL} XP to level ${level + 1}`}
            center={
              <span className="flex items-baseline gap-1">
                <span className="type-label text-[10px] text-ink-muted">LVL</span>
                <span className="type-stat text-[20px] text-amber-ink">{level}</span>
              </span>
            }
          />
          <span className="type-data text-[12px] text-ink-muted">
            {into}/{XP_PER_LEVEL} XP
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
