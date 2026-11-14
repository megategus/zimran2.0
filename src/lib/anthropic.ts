import Anthropic from "@anthropic-ai/sdk";

// Server only. Reads ANTHROPIC_API_KEY from the environment.
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

// On a safety decline the API re-runs the request on a fallback model it picks by refusal category.
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

let client: Anthropic | null = null;
export function anthropic(): Anthropic {
  client ??= new Anthropic({ maxRetries: 1, timeout: 60_000 });
  return client;
}
