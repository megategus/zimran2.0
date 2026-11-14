import { Car, Flag } from "lucide-react";
import { CourseNode, type NodeState } from "./CourseNode";
import { roadPaths, W } from "./road";

type Node = { title: string; href: string; state: NodeState };
export type Station = { label: string; earned: boolean };

const STATION_H = 64;

// Winding road through the lessons. The car drives in and parks before the next lesson.
// part: PartArt key drawn in every node. station: the badge sign at the end of the road.
export function CoursePath({ nodes, part, station }: { nodes: Node[]; part: string; station?: Station }) {
  const current = nodes.findIndex((n) => n.state === "current");
  const lastDone = nodes.findLastIndex((n) => n.state === "done");
  const park = current >= 0 ? current : lastDone + 1;
  const { pts, height, road, car } = roadPaths(nodes.length, park);
  const driving = nodes.some((n) => n.state !== "soon");
  const end = pts[pts.length - 1];

  return (
    <div className="relative mx-auto" style={{ width: W, height: height + (station ? STATION_H : 0) }}>
      <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} className="absolute inset-0 overflow-visible" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={road} stroke="var(--line)" strokeWidth={22} />
        {driving && park > 0 && <path d={car} stroke="var(--brand-soft)" strokeWidth={22} pathLength={1} className="road-fill" />}
        <path d={road} stroke="var(--line-strong)" strokeWidth={2} strokeDasharray="6 10" />
      </svg>
      {nodes.map((n, i) => (
        <CourseNode key={n.title} {...n} part={part} n={i + 1} at={pts[i]} side={i % 2 ? "left" : "right"} width={W} />
      ))}
      {station && (
        // Station at the end of the road: the course badge, lit once every lesson is done.
        <div className="absolute flex items-center gap-2" style={{ left: end[0] - 22, top: height - 4 }}>
          <span className={`size-11 flex items-center justify-center border-2 ${station.earned ? "bg-brand border-brand text-on-brand" : "bg-surface border-dashed border-line-strong text-ink-muted"}`}>
            <Flag size={20} aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="type-label text-[10px] text-ink-muted">{station.earned ? "Badge earned" : "Finish for badge"}</span>
            <span className={`type-body font-semibold ${station.earned ? "text-brand" : "text-ink-muted"}`}>{station.label}</span>
          </span>
        </div>
      )}
      {driving && (
        <div aria-hidden className="car-drive absolute top-0 left-0 size-8 rounded-full bg-amber text-on-amber shadow-raise flex items-center justify-center pointer-events-none" style={{ offsetPath: `path("${car}")` }}>
          <Car size={18} />
        </div>
      )}
    </div>
  );
}
