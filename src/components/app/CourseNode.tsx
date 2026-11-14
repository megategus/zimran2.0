import { Check, Lock } from "lucide-react";
import Link from "next/link";

export type NodeState = "done" | "current" | "locked" | "soon";

const disc: Record<NodeState, string> = {
  current: "bg-brand text-on-brand shadow-press-brand",
  done: "bg-brand-soft text-brand",
  locked: "bg-surface-sunken text-ink-muted",
  soon: "border-2 border-dashed border-line-strong text-ink-muted",
};

// Spec: docs/design/components/CourseNode/README.md. Every node is a link.
export function CourseNode({ state, title, href, n, offset }: { state: NodeState; title: string; href: string; n: number; offset: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-2 w-40 text-center ${offset ? "translate-x-10" : "-translate-x-10"}`}>
      <span className={`size-16 rounded-full flex items-center justify-center type-stat text-[20px] ${disc[state]}`}>
        {state === "done" ? <Check aria-label="Done" /> : state === "locked" ? <Lock size={20} aria-label="Premium" /> : state === "soon" ? <span className="type-label text-[11px]">Soon</span> : n}
      </span>
      <span className={`type-body ${state === "locked" ? "text-ink-muted" : ""}`}>{title}</span>
    </Link>
  );
}
