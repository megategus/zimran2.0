import { Car } from "lucide-react";
import { CourseNode, type NodeState } from "./CourseNode";
import { roadPaths, W } from "./road";

type Node = { title: string; href: string; state: NodeState };

// Winding road through the lessons. The car drives in and parks before the next lesson.
export function CoursePath({ nodes }: { nodes: Node[] }) {
  const current = nodes.findIndex((n) => n.state === "current");
  const lastDone = nodes.findLastIndex((n) => n.state === "done");
  const park = current >= 0 ? current : lastDone + 1;
  const { pts, height, road, car } = roadPaths(nodes.length, park);
  const driving = nodes.some((n) => n.state !== "soon");

  return (
    <div className="relative mx-auto" style={{ width: W, height }}>
      <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} className="absolute inset-0 overflow-visible" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={road} stroke="var(--surface-sunken)" strokeWidth={22} />
        {driving && park > 0 && <path d={car} stroke="var(--brand-soft)" strokeWidth={22} pathLength={1} className="road-fill" />}
        <path d={road} stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="6 10" />
      </svg>
      {nodes.map((n, i) => (
        <CourseNode key={n.title} {...n} n={i + 1} at={pts[i]} side={i % 2 ? "left" : "right"} width={W} />
      ))}
      {driving && (
        <div aria-hidden className="car-drive absolute top-0 left-0 size-8 rounded-full bg-amber text-on-amber shadow-raise flex items-center justify-center pointer-events-none" style={{ offsetPath: `path("${car}")` }}>
          <Car size={18} />
        </div>
      )}
    </div>
  );
}
