import { describe, expect, it } from "vitest";
import { nextLessonKey, START_LESSON } from "./prewarm";

describe("nextLessonKey", () => {
  it("steps through a course and stops at its end", () => {
    expect(START_LESSON).toBe("brakes-1");
    expect(nextLessonKey("brakes-1")).toBe("brakes-2");
    expect(nextLessonKey("brakes-3")).toBeNull();
  });
  it("has no next for parts or unknown keys", () => {
    expect(nextLessonKey("part-caliper")).toBeNull();
    expect(nextLessonKey("nope-9")).toBeNull();
  });
});
