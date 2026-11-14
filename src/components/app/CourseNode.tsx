import { Check, Lock } from "lucide-react";
import Link from "next/link";
import { PartArt } from "@/components/art/PartArt";
import type { Pt } from "./road";

export type NodeState = "done" | "current" | "locked" | "soon";

const disc: Record<NodeState, string> = {
  current: "bg-surface border-[3px] border-brand shadow-press-brand",
  done: "bg-brand-soft border-2 border-brand",
  locked: "bg-surface-sunken border-2 border-line [&_svg[role=img]]:grayscale [&_svg[role=img]]:opacity-50",
  soon: "bg-surface border-2 border-dashed border-line-strong [&_svg[role=img]]:grayscale [&_svg[role=img]]:opacity-60",
};

// Spec: docs/design/components/CourseNode/README.md. Every node is a link.
// Disc shows the course's part art; a corner badge carries the state (never color alone).
export function CourseNode({ state, title, href, part, at: [x, y], side, width }: { state: NodeState; title: string; href: string; n: number; part: string; at: Pt; side: "left" | "right"; width: number }) {
  const box = side === "right" ? { left: x - 32, width: width - (x - 32) } : { left: 0, width: x + 32 };
  return (
    <Link href={href} style={{ top: y - 32, ...box }} className={`group absolute flex items-center gap-3 ${side === "left" ? "flex-row-reverse text-right" : ""}`}>
      <span className={`relative size-16 shrink-0 rounded-full flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-130 group-focus-visible:scale-130 ${disc[state]}`}>
        <PartArt part={part} size={48} label="" />
        {state === "done" && <span className="absolute -right-1 -bottom-1 size-6 rounded-full bg-brand text-on-brand flex items-center justify-center"><Check size={14} aria-label="Done" /></span>}
        {state === "locked" && <span className="absolute -right-1 -bottom-1 size-6 rounded-full bg-plate text-on-plate flex items-center justify-center"><Lock size={12} aria-label="Premium" /></span>}
        {state === "soon" && <span className="absolute -right-2 -bottom-1 px-1.5 bg-surface border border-line-strong type-label text-[9px] text-ink-muted">SOON</span>}
      </span>
      <span className={`type-body ${state === "locked" ? "text-ink-muted" : ""}`}>{title}</span>
    </Link>
  );
}
