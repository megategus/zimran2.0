import { Check, X } from "lucide-react";
import { headline } from "@/components/ui/site";

export type OptionState = "idle" | "selected" | "correct" | "wrong";

const styles: Record<OptionState, string> = {
  idle: "bg-surface border-line enabled:hover:border-ink",
  selected: "bg-surface border-brand",
  correct: "bg-surface-sunken border-ink", // brand is red; keep correct visibly apart from wrong
  wrong: "bg-brake-soft border-brake",
};

const letterColor: Record<OptionState, string> = { idle: "text-ink-muted", selected: "text-brand", correct: "text-ink", wrong: "text-brake" };

// Spec: docs/design/components/QuizOption/README.md. State never by color alone.
export function QuizOption({ letter, text, state, onClick, disabled }: { letter: string; text: string; state: OptionState; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={`w-full text-left flex items-center gap-4 border-2 px-4 py-4 transition-colors duration-150 enabled:cursor-pointer ${styles[state]}`}
    >
      <span className={`${headline} text-[24px] leading-none w-6 shrink-0 ${letterColor[state]}`}>{letter}</span>
      <span className="type-body text-ink flex-1">{text}</span>
      {state === "correct" && <span className="flex items-center gap-1 type-label text-[12px] text-ink"><Check size={16} aria-hidden />Correct</span>}
      {state === "wrong" && <span className="flex items-center gap-1 type-label text-[12px] text-brake"><X size={16} aria-hidden />Not quite</span>}
    </button>
  );
}
