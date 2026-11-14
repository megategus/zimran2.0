import { describe, expect, it } from "vitest";
import { canAccess, isFreeLesson } from "./access";
import type { Guest } from "./types";

const free = { isPremium: false } as Guest;
const paid = { isPremium: true } as Guest;

describe("canAccess", () => {
  it("lets free guests open lesson 1 only", () => {
    expect(canAccess(free, "brakes-1")).toBe(true);
    expect(canAccess(free, "brakes-2")).toBe(false);
  });
  it("keeps 3D part lessons premium", () => {
    expect(canAccess(free, "part-caliper")).toBe(false);
    expect(canAccess(paid, "part-caliper")).toBe(true);
  });
  it("opens everything for premium", () => {
    expect(canAccess(paid, "tires-wheels-3")).toBe(true);
  });
  it("rejects unknown keys for everyone", () => {
    expect(canAccess(free, "nope-9")).toBe(false);
    expect(canAccess(paid, "nope-9")).toBe(false);
  });
});

describe("isFreeLesson", () => {
  it("marks first lesson of each live course free", () => {
    expect(isFreeLesson("oil-fluids-1")).toBe(true);
    expect(isFreeLesson("oil-fluids-3")).toBe(false);
  });
});
