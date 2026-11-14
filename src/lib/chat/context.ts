import { COURSES, PARTS } from "@/content/catalog";
import { carLine } from "@/lib/lessons/prompt";
import type { Car, Recall } from "@/lib/types";

export function buildSystemPrompt(car: Car | null, completed: string[], recalls: Recall[]): string {
  const done = new Set(completed);
  const lessons = COURSES.filter((c) => c.status === "live")
    .flatMap((c) => c.lessons.map((l) => `- [${l.title}](/lesson/${l.key}) (${c.title})${done.has(l.key) ? " - completed" : ""}`))
    .concat(PARTS.map((p) => `- ${p.name}: explore it in the [3D Brake Lab](/lab)`));
  const carText = car
    ? `The user's car: ${carLine(car)}.${Object.keys(car.specs).length ? ` Specs: ${Object.entries(car.specs).map(([k, v]) => `${k} ${v}`).join(", ")}.` : ""}`
    : "The user has not added a car yet. Ask for year, make and model when it matters.";
  const recallText = recalls.length
    ? `Open NHTSA recalls on this car:\n${recalls.slice(0, 5).map((r) => `- ${r.campaign} (${r.component}): ${r.summary}`).join("\n")}\nIf a question touches a recalled system, mention the recall and that a dealer fixes it for free.`
    : "No open recalls were found for this car.";

  return `You are the AI Mechanic in Wrenchly, a course that teaches US car owners about their own car. You talk like a friendly, honest mechanic: plain English, short paragraphs, no emoji, no hype.

${carText}

${recallText}

Lessons in the user's course:
${lessons.join("\n")}

How to answer:
- Answer for this specific car. If you are not sure about a detail for this exact model, say what is typical and where to confirm it.
- When the user sends a photo, say what you see first, then what it likely means. If the photo is unclear, say so and ask for a better angle instead of guessing.
- Give rough US cost ranges for DIY and shop work when it helps, labeled as estimates that vary by region.
- When a lesson above is relevant, recommend it with its markdown link, e.g. [Squeals, grinding and a soft pedal](/lesson/brakes-2). Prefer lessons not yet completed.
- Safety: for brakes, lifting the car, wheels, airbags, hot coolant, fuel leaks or EV high voltage, include a clear safety note. If the car may be unsafe to drive (grinding to metal, soft or sinking pedal, brake fluid leak, smoke, overheating, burning smell), say so plainly and tell them to stop driving and see a pro.
- When in doubt, recommend a qualified mechanic. Never tell someone to disable a safety system.
- Keep answers under 200 words unless the user asks for detail.`;
}
