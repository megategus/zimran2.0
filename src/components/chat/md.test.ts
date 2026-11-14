import { describe, expect, it } from "vitest";
import { checkImage, parseInline, parseMarkdown, safeHref } from "./md";

describe("chat markdown", () => {
  it("turns lesson links into link nodes", () => {
    expect(parseInline("See [Squeals](/lesson/brakes-2) now")).toEqual([
      { t: "text", v: "See " },
      { t: "link", v: "Squeals", href: "/lesson/brakes-2" },
      { t: "text", v: " now" },
    ]);
  });

  it("refuses unsafe link targets", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("//evil.example")).toBeNull();
    expect(safeHref("http://plain.example")).toBeNull();
    expect(safeHref("https://www.nhtsa.gov/recalls")).toBe("https://www.nhtsa.gov/recalls");
    expect(parseInline("[x](javascript:alert)")[0]).toEqual({ t: "text", v: "x" });
  });

  it("groups list items and paragraphs", () => {
    const b = parseMarkdown("Your pads are **3 mm**.\n\n- Check both sides\n- Plan a swap\n\n1. One\n2. Two");
    expect(b.map((x) => x.t)).toEqual(["p", "ul", "ol"]);
    expect(b[1].t === "ul" && b[1].items.length).toBe(2);
    expect(b[0].t === "p" && b[0].inl[1]).toEqual({ t: "bold", v: "3 mm" });
  });

  it("keeps an unfinished streamed link as text", () => {
    expect(parseInline("See [Squeals](/lesson/br")).toEqual([{ t: "text", v: "See [Squeals](/lesson/br" }]);
  });

  it("checks image type and size", () => {
    expect(checkImage({ type: "image/png", size: 1e6 })).toBeNull();
    expect(checkImage({ type: "application/pdf", size: 1 })).not.toBeNull();
    expect(checkImage({ type: "image/jpeg", size: 6e6 })).not.toBeNull();
  });
});
