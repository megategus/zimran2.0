import { describe, expect, it } from "vitest";
import { pickDaily } from "./daily";
import type { Lesson } from "./types";

const lesson = (n: number) => ({ quiz: Array.from({ length: n }, (_, i) => ({ q: `q${i}`, options: [], answerIndex: 0 })) }) as unknown as Lesson;

describe("pickDaily", () => {
  it("is null with no finished lessons", () => {
    expect(pickDaily([], "2026-11-15")).toBeNull();
  });
  it("is stable within a day and moves the next day", () => {
    const ls = [{ key: "brakes-1", lesson: lesson(3) }, { key: "oil-fluids-1", lesson: lesson(3) }];
    const a = pickDaily(ls, "2026-11-15"), b = pickDaily(ls, "2026-11-15"), c = pickDaily(ls, "2026-11-16");
    expect(a).toEqual(b);
    expect(c).not.toEqual(a);
  });
});
