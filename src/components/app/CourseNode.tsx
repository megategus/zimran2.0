import { Check, Lock } from "lucide-react";
import Link from "next/link";
import type { Pt } from "./road";

export type NodeState = "done" | "current" | "locked" | "soon";

const disc: Record<NodeState, string> = {
  current: "bg-brand text-on-brand shadow-press-brand",
  done: "bg-brand-soft text-brand",
  locked: "bg-surface-sunken text-ink-muted",
  soon: "bg-surface border-2 border-dashed border-line-strong text-ink-muted",
};

// Spec: docs/design/components/CourseNode/README.md. Every node is a link.
// Disc center sits at `at`; the label goes on the side away from the road's next bend.
export function CourseNode({ state, title, href, n, at: [x, y], side, width }: { state: NodeState; title: string; href: string; n: number; at: Pt; side: "left" | "right"; width: number }) {
  const box = side === "right" ? { left: x - 32, width: width - (x - 32) } : { left: 0, width: x + 32 };
  return (
    <Link href={href} style={{ top: y - 32, ...box }} className={`group absolute flex items-center gap-3 ${side === "left" ? "flex-row-reverse text-right" : ""}`}>
      <span className={`size-16 shrink-0 rounded-full flex items-center justify-center type-stat text-[20px] transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-130 group-focus-visible:scale-130 ${disc[state]}`}>
        {state === "done" ? <Check aria-label="Done" /> : state === "locked" ? <Lock size={20} aria-label="Premium" /> : state === "soon" ? <span className="type-label text-[11px]">Soon</span> : n}
      </span>
      <span className={`type-body ${state === "locked" ? "text-ink-muted" : ""}`}>{title}</span>
    </Link>
  );
}
