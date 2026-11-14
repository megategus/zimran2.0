// Geometry for the course road: nodes zigzag down a W-wide strip, joined by S-curves.
export type Pt = [number, number];

export const W = 260;
const X = [56, 204];
const TOP = 70; // first node center
const ROW = 150; // vertical gap between nodes
const TAIL = 80; // road below the last node
const PARK = 52; // how far before a node the car stops on a straight
const T = 0.55; // where on a curve the car stops

const r = (n: number) => Math.round(n * 10) / 10;
const p = (pt: Pt) => `${r(pt[0])},${r(pt[1])}`;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const seg = (a: Pt, b: Pt): Pt[] => [a, [a[0], a[1] + ROW / 2], [b[0], b[1] - ROW / 2], b];
const curve = (c: Pt[]) => ` C ${p(c[1])} ${p(c[2])} ${p(c[3])}`;

// First part of a cubic bezier, cut at t (de Casteljau).
function cut([p0, p1, p2, p3]: Pt[], t: number): Pt[] {
  const a = lerp(p0, p1, t), b = lerp(p1, p2, t), c = lerp(p2, p3, t);
  const d = lerp(a, b, t), e = lerp(b, c, t);
  return [p0, a, d, lerp(d, e, t)];
}

// n nodes; the car parks just before node k (k === n: past the last node).
export function roadPaths(n: number, k: number) {
  const pts: Pt[] = Array.from({ length: n }, (_, i) => [X[i % 2], TOP + i * ROW]);
  const last = pts[n - 1];
  const height = last[1] + TAIL;
  const start = `M ${p([pts[0][0], 0])} L ${p(pts[0])}`;
  const curves = (upTo: number) => pts.slice(1, upTo + 1).map((b, i) => curve(seg(pts[i], b))).join("");

  const road = `${start}${curves(n - 1)} L ${p([last[0], height])}`;
  const car =
    k === 0 ? `M ${p([pts[0][0], 0])} L ${p([pts[0][0], TOP - PARK])}`
    : k >= n ? `${start}${curves(n - 1)} L ${p([last[0], last[1] + PARK])}`
    : `${start}${curves(k - 1)}${curve(cut(seg(pts[k - 1], pts[k]), T))}`;
  return { pts, height, road, car };
}
