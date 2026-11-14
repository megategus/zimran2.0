import { Check, X } from "lucide-react";

export type OptionState = "idle" | "selected" | "correct" | "wrong";

const styles: Record<OptionState, string> = {
  idle: "bg-surface border-line-strong shadow-press-neutral",
  selected: "bg-surface border-brand shadow-press-neutral",
  correct: "bg-brand-soft border-brand",
  wrong: "bg-brake-soft border-brake",
};

// Spec: docs/design/components/QuizOption/README.md. State never by color alone.
export function QuizOption({ letter, text, state, onClick, disabled }: { letter: string; text: string; state: OptionState; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={`w-full text-left flex items-center gap-3 rounded-md border-2 px-4 py-3 transition-transform duration-120 enabled:active:translate-y-1 enabled:cursor-pointer ${styles[state]}`}
    >
      <span className={`type-stat text-[16px] w-6 shrink-0 ${state === "selected" || state === "correct" ? "text-brand" : state === "wrong" ? "text-brake" : ""}`}>{letter}</span>
      <span className="type-body flex-1">{text}</span>
      {state === "correct" && <span className="flex items-center gap-1 type-label text-[12px] text-brand"><Check size={16} aria-hidden />Correct</span>}
      {state === "wrong" && <span className="flex items-center gap-1 type-label text-[12px] text-brake"><X size={16} aria-hidden />Not quite</span>}
    </button>
  );
}
