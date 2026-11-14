import { describe, expect, it } from "vitest";
import { roadPaths } from "./road";

const end = (d: string) => d.trim().split(/[ ,]+/).slice(-2).map(Number);

describe("roadPaths", () => {
  it("zigzags nodes down the strip", () => {
    expect(roadPaths(3, 0).pts).toEqual([[56, 100], [204, 250], [56, 400]]);
    expect(roadPaths(3, 0).height).toBe(496);
  });
  it("parks above the first node", () => {
    expect(roadPaths(3, 0).car).toBe("M 56,0 L 56,30");
  });
  it("parks on the curve, clear of both nodes", () => {
    const [x, y] = end(roadPaths(3, 1).car);
    // clear of both discs: radius 32 + car half-length 24
    expect(Math.hypot(x - 204, y - 250)).toBeGreaterThan(56);
    expect(Math.hypot(x - 56, y - 100)).toBeGreaterThan(56);
  });
  it("parks past the last node when all are done", () => {
    expect(end(roadPaths(3, 3).car)).toEqual([56, 470]);
  });
});
