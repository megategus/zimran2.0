import { describe, expect, it } from "vitest";
import { findSentence, seasonTip } from "./season";
import type { Lesson } from "./types";

describe("seasonTip", () => {
  it("ties November to tire pressure and the sidewall lesson", () => {
    const t = seasonTip(10);
    expect(t.month).toBe("November");
    expect(t.lessonKey).toBe("tires-wheels-1");
    expect(t.text).not.toMatch(/\d/); // no hardcoded figures
  });
  it("covers every month", () => {
    for (let m = 0; m < 12; m++) expect(seasonTip(m).lessonKey).toMatch(/-\d$/);
  });
});

describe("findSentence", () => {
  const lesson = { cards: [{ kind: "what", heading: "", body: "Check pressure monthly. Cold air drops it about 1 psi for every 10°F. Use the door sticker." }] } as Lesson;
  it("quotes the sentence that matches", () => {
    expect(findSentence(lesson, /psi[^.]*°F/i)).toBe("Cold air drops it about 1 psi for every 10°F.");
  });
  it("returns null when nothing matches", () => {
    expect(findSentence(lesson, /coolant/i)).toBeNull();
  });
});
