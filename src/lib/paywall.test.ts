import { describe, expect, it } from "vitest";
import { paywallReason, pricingHref } from "./paywall";

describe("paywall", () => {
  it("builds a pricing link that says where the user came from", () => {
    expect(pricingHref()).toBe("/pricing");
    expect(pricingHref("brakes-2")).toBe("/pricing?from=brakes-2");
  });
  it("names the locked lesson, chat or lab", () => {
    expect(paywallReason("brakes-2")?.what).toContain("Squeals");
    expect(paywallReason("chat")?.what).toBe("The AI Mechanic");
    expect(paywallReason("lab")?.what).toBe("The 3D Brake Lab");
  });
  it("ignores unknown or missing reasons", () => {
    expect(paywallReason("nope-9")).toBeNull();
    expect(paywallReason(undefined)).toBeNull();
  });
});
