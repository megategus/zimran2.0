import { describe, expect, it } from "vitest";
import { grade } from "./grade";
import type { Lesson } from "./types";

const lesson = { quiz: [1, 0, 2].map((answerIndex) => ({ q: "?", options: ["a", "b", "c", "d"], answerIndex })) } as Lesson;

describe("grade", () => {
  it("counts correct answers", () => {
    expect(grade(lesson, [1, 0, 2])).toBe(3);
    expect(grade(lesson, [1, 1, 1])).toBe(1);
  });
  it("rejects the wrong number of answers", () => {
    expect(() => grade(lesson, [1])).toThrow(RangeError);
  });
});
