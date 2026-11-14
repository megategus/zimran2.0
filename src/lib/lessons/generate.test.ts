import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Car, Lesson } from "@/lib/types";

const create = vi.fn();
vi.mock("@/lib/anthropic", () => ({
  MODEL: "test-model",
  FALLBACK: {},
  anthropic: () => ({ beta: { messages: { create } } }),
}));
vi.mock("@/lib/db", () => ({ db: () => { throw new Error("db not used in these tests"); } }));

const { generateLesson, LessonGenError, toPublic } = await import("./generate");
const { LessonSchema } = await import("./schema");

const car: Car = {
  id: "c1", guestId: "g1", vin: null, year: 2019, make: "HONDA", model: "Civic", trim: "EX",
  engine: "1.5L I4", specs: {}, recalls: [{ campaign: "19V000", component: "SERVICE BRAKES", summary: "s", remedy: "r" }],
};

const valid: Lesson = {
  title: "How your brakes stop the car",
  carLine: "2019 HONDA Civic EX 1.5L I4",
  cards: (["what", "how", "breaks", "fix"] as const).map((kind) => ({ kind, heading: kind, body: "body" })),
  costs: { diy: "$45-$80", shop: "$180-$320" },
  safety: "Use jack stands.",
  quiz: [0, 1, 2].map((i) => ({ q: `q${i}`, options: ["a", "b", "c", "d"], answerIndex: i })),
};

const reply = (obj: unknown) => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(obj) }] });

describe("generateLesson", () => {
  beforeEach(() => create.mockReset());

  it("retries once on invalid output, then throws LessonGenError", async () => {
    create.mockResolvedValue(reply({ ...valid, quiz: [] }));
    await expect(generateLesson(car, "brakes-1")).rejects.toBeInstanceOf(LessonGenError);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("returns a schema-valid lesson", async () => {
    create.mockResolvedValue(reply(valid));
    const lesson = await generateLesson(car, "brakes-1");
    expect(LessonSchema.safeParse(lesson).success).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("rejects a brakes lesson without a safety note", async () => {
    create.mockResolvedValue(reply({ ...valid, safety: null }));
    await expect(generateLesson(car, "brakes-1")).rejects.toBeInstanceOf(LessonGenError);
  });

  it("puts the car and its brake recall into the prompt", async () => {
    create.mockResolvedValue(reply(valid));
    await generateLesson(car, "brakes-1");
    const prompt = create.mock.calls[0][0].messages[0].content as string;
    expect(prompt).toContain("2019 HONDA Civic");
    expect(prompt).toContain("19V000");
  });

  it("recovers from an API error on the first attempt", async () => {
    create.mockRejectedValueOnce(new Error("overloaded")).mockResolvedValueOnce(reply(valid));
    await expect(generateLesson(car, "part-caliper")).resolves.toBeTruthy();
  });
});

describe("LessonSchema as output format", () => {
  it("converts to a JSON schema the API accepts", async () => {
    const { betaZodOutputFormat } = await import("@anthropic-ai/sdk/helpers/beta/zod");
    const f = betaZodOutputFormat(LessonSchema) as unknown as { type: string; schema: Record<string, unknown> };
    expect(f.type).toBe("json_schema");
    expect(JSON.stringify(f.schema)).toContain("answerIndex");
  });
});

describe("toPublic", () => {
  it("strips answerIndex", () => {
    expect(toPublic(valid).quiz[0]).not.toHaveProperty("answerIndex");
  });
});
