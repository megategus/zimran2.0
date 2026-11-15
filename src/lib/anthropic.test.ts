import { describe, expect, it } from "vitest";
import { FALLBACK, fallbackFor } from "./anthropic";

describe("fallbackFor", () => {
  it("sends no refusal fallback for Haiku, the default for Sonnet", () => {
    expect(fallbackFor("claude-haiku-5-5")).toEqual({});
    expect(fallbackFor("claude-sonnet-5-5")).toBe(FALLBACK);
  });
});
