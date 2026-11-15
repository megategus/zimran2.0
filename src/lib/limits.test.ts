import { describe, expect, it } from "vitest";
import { clientIp, LIMITS, overLimit } from "./limits";

describe("overLimit", () => {
  it("blocks at the guest or IP cap, not before", () => {
    expect(overLimit(LIMITS.perGuest - 1, 0)).toBe(false);
    expect(overLimit(LIMITS.perGuest, 0)).toBe(true);
    expect(overLimit(0, LIMITS.perIp)).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry, then x-real-ip", () => {
    expect(clientIp(new Request("http://x", { headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" } }))).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x", { headers: { "x-real-ip": "5.6.7.8" } }))).toBe("5.6.7.8");
    expect(clientIp(new Request("http://x"))).toBeNull();
  });
});
