import { describe, expect, it } from "vitest";
import { streak, today, xpFor } from "./progress";

describe("streak", () => {
  it("counts consecutive days ending today", () => {
    expect(streak(["2026-11-13", "2026-11-14", "2026-11-15"], "2026-11-15")).toBe(3);
  });
  it("still counts when today is not done yet", () => {
    expect(streak(["2026-11-13", "2026-11-14"], "2026-11-15")).toBe(2);
  });
  it("is zero after a missed day", () => {
    expect(streak(["2026-11-12"], "2026-11-15")).toBe(0);
  });
  it("ignores gaps and order", () => {
    expect(streak(["2026-11-15", "2026-11-10", "2026-11-14"], "2026-11-15")).toBe(2);
  });
  it("crosses month boundaries", () => {
    expect(streak(["2026-10-31", "2026-11-01"], "2026-11-01")).toBe(2);
  });
});

describe("today", () => {
  it("shifts UTC date by offset days", () => {
    expect(today(2, new Date("2026-11-15T10:00Z"))).toBe("2026-11-17");
    expect(today(0, new Date("2026-11-15T23:59Z"))).toBe("2026-11-15");
  });
});

describe("xpFor", () => {
  it("gives 10 plus 5 per correct answer", () => {
    expect(xpFor(3)).toBe(25);
    expect(xpFor(0)).toBe(10);
  });
});
