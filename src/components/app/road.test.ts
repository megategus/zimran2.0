import { describe, expect, it } from "vitest";
import { roadPaths } from "./road";

const end = (d: string) => d.trim().split(/[ ,]+/).slice(-2).map(Number);

describe("roadPaths", () => {
  it("zigzags nodes down the strip", () => {
    expect(roadPaths(3, 0).pts).toEqual([[56, 70], [204, 220], [56, 370]]);
    expect(roadPaths(3, 0).height).toBe(450);
  });
  it("parks above the first node", () => {
    expect(roadPaths(3, 0).car).toBe("M 56,0 L 56,18");
  });
  it("parks on the curve, clear of both nodes", () => {
    const [x, y] = end(roadPaths(3, 1).car);
    expect(Math.hypot(x - 204, y - 220)).toBeGreaterThan(46);
    expect(Math.hypot(x - 56, y - 70)).toBeGreaterThan(46);
  });
  it("parks past the last node when all are done", () => {
    expect(end(roadPaths(3, 3).car)).toEqual([56, 422]);
  });
});
