import { describe, expect, it } from "vitest";
import { plainComponent, recallHeadline, shortSummary, sortRecalls } from "./recalls";

const r = (component: string) => ({ campaign: component, component, summary: "", remedy: "" });

describe("recalls", () => {
  it("puts airbags and brakes before the rest", () => {
    expect(sortRecalls([r("EXTERIOR LIGHTING"), r("SERVICE BRAKES, HYDRAULIC"), r("AIR BAGS:FRONTAL")]).map((x) => x.component)).toEqual([
      "AIR BAGS:FRONTAL", "SERVICE BRAKES, HYDRAULIC", "EXTERIOR LIGHTING",
    ]);
  });
  it("turns NHTSA component codes into plain words", () => {
    expect(plainComponent("AIR BAGS:FRONTAL:DRIVER SIDE:INFLATOR MODULE")).toBe("Air bags · frontal · driver side · inflator module");
  });
  it("never claims a recall is open", () => {
    expect(recallHeadline(24)).toBe("24 recalls for this model");
    expect(recallHeadline(1)).toBe("1 recall for this model");
    expect(recallHeadline(0)).not.toMatch(/open/i);
  });
  it("shortens long summaries at a word boundary", () => {
    const s = shortSummary("word ".repeat(100), 30);
    expect(s.length).toBeLessThanOrEqual(31);
    expect(s.endsWith("…")).toBe(true);
  });
});
