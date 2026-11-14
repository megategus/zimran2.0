import { describe, expect, it } from "vitest";
import { validateImage } from "./validate";

describe("validateImage", () => {
  it("accepts a small png and no image", () => {
    expect(validateImage({ type: "image/png", size: 1e6 })).toBeNull();
    expect(validateImage(null)).toBeNull();
  });
  it("rejects other types and files over 5 MB", () => {
    expect(validateImage({ type: "application/pdf", size: 1 })).not.toBeNull();
    expect(validateImage({ type: "image/jpeg", size: 6e6 })).not.toBeNull();
  });
});
