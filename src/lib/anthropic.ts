import Anthropic from "@anthropic-ai/sdk";

// Server only. Reads ANTHROPIC_API_KEY from the environment.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

// Lessons and "explain simpler" rewrites: structured, short, cached. A cheap model is enough; set ANTHROPIC_LESSON_MODEL to override.
export const LESSON_MODEL = process.env.ANTHROPIC_LESSON_MODEL || "claude-haiku-5-5";

// On a safety decline the API re-runs the request on a fallback model it picks by refusal category.
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

// Haiku has no server-side refusal fallback, so it gets no fallback params.
export const fallbackFor = (model: string) => (model.startsWith("claude-haiku") ? {} : FALLBACK);

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  client ??= new Anthropic({ maxRetries: 1, timeout: 60_000 });
  return client;
}
