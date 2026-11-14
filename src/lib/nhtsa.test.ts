import { describe, expect, it } from "vitest";
import ok from "./__fixtures__/vpic-ok.json";
import bad from "./__fixtures__/vpic-bad.json";
import { isValidVin, parseRecalls, parseVpic } from "./nhtsa";

describe("parseVpic", () => {
  it("decodes a real VIN", () => {
    const car = parseVpic(ok)!;
    expect(car.make).toBe("HONDA");
    expect(car.model).toBe("Accord");
    expect(car.year).toBe(2003);
    expect(car.engine).toBe("3.0L V6");
    expect(car.specs.Body).toBe("Coupe");
    expect(car.specs).not.toHaveProperty("Drive"); // empty vPIC fields are dropped
  });

  it("returns null for an unknown VIN", () => {
    expect(parseVpic(bad)).toBeNull();
    expect(parseVpic({})).toBeNull();
  });
});

describe("isValidVin", () => {
  it("accepts 17 chars without I, O, Q", () => {
    expect(isValidVin("1HGCM82633A004352")).toBe(true);
    expect(isValidVin("XXX")).toBe(false);
    expect(isValidVin("1HGCM82633A00435O")).toBe(false);
  });
});

describe("parseRecalls", () => {
  it("maps NHTSA fields and tolerates junk", () => {
    const r = parseRecalls({ results: [{ NHTSACampaignNumber: "03V123000", Component: "AIR BAGS", Summary: "s", Remedy: "r" }] });
    expect(r).toEqual([{ campaign: "03V123000", component: "AIR BAGS", summary: "s", remedy: "r" }]);
    expect(parseRecalls(null)).toEqual([]);
  });
});
