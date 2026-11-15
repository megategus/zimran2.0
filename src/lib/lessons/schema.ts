import { z } from "zod";

const KINDS = ["what", "how", "breaks", "fix"] as const;

export const LessonSchema = z
  .object({
    title: z.string().min(1),
    carLine: z.string().min(1).describe('The car this lesson is for, e.g. "2019 Honda Civic EX, 1.5L I4"'),
    cards: z
      .array(z.object({ kind: z.enum(KINDS), heading: z.string().min(1), body: z.string().min(1) }))
      .length(4)
      .describe("Exactly 4 cards in this order: what, how, breaks, fix"),
    costs: z.object({
      diy: z.string().describe('US dollar range for doing it yourself, e.g. "$45-$80"'),
      shop: z.string().describe('US dollar range at an independent shop, e.g. "$180-$320"'),
    }),
    safety: z.string().nullable().describe("Safety note, or null when the topic has no hazard"),
    quiz: z
      .array(
        z.object({
          q: z.string().min(1),
          options: z.array(z.string().min(1)).length(4),
          answerIndex: z.number().int().min(0).max(3),
          why: z.string().min(1).describe("One sentence on why the correct answer is right, in plain words").optional(),
        }),
      )
      .length(3),
  })
  .refine((l) => l.cards.every((c, i) => c.kind === KINDS[i]), { message: "cards must be what, how, breaks, fix in order" });
