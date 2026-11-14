import { describe, expect, it } from "vitest";
import { streak, streakInfo, today, week, xpFor } from "./progress";

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

describe("streak freeze", () => {
  it("bridges one missed day", () => {
    expect(streakInfo(["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-14", "2026-11-15"], "2026-11-15")).toEqual({ streak: 5, frozen: ["2026-11-13"] });
  });
  it("bridges only one miss per 7 days", () => {
    expect(streakInfo(["2026-11-09", "2026-11-10", "2026-11-12", "2026-11-14", "2026-11-15"], "2026-11-15")).toEqual({ streak: 3, frozen: ["2026-11-13"] });
  });
  it("never bridges two missed days in a row", () => {
    expect(streakInfo(["2026-11-11", "2026-11-12", "2026-11-15"], "2026-11-15").streak).toBe(1);
  });
  it("bridges again after a week", () => {
    const days = ["2026-11-01", "2026-11-02", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10", "2026-11-12"];
    expect(streakInfo(days, "2026-11-12")).toEqual({ streak: 10, frozen: ["2026-11-11", "2026-11-03"] });
  });
});

describe("week", () => {
  it("labels the last 7 days", () => {
    const w = week(["2026-11-14", "2026-11-15"], ["2026-11-13"], "2026-11-15");
    expect(w.map((d) => d.state)).toEqual(["missed", "missed", "missed", "missed", "frozen", "done", "done"]);
    expect(w[6]).toEqual({ day: "2026-11-15", label: "S", state: "done" });
    expect(week([], [], "2026-11-15")[6].state).toBe("today");
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
