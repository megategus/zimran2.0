import type { FoundLesson } from "@/content/catalog";
import type { Car, Recall } from "@/lib/types";

// Recall components (NHTSA uses upper-case system names) that matter for each topic.
const RECALL_MATCH: Record<string, RegExp> = {
  brakes: /BRAKE/,
  "oil-fluids": /ENGINE|FUEL|COOLING|LUBRICA/,
  "tires-wheels": /TIRE|WHEEL|SUSPENSION/,
  part: /BRAKE|WHEEL/,
};

// Topics where a lesson must carry a safety note (brakes, jacking, hot coolant).
const SAFETY_TOPICS = new Set(["brakes", "tires-wheels", "part"]);

const topicOf = (found: FoundLesson) => (found.isPart ? "part" : found.course!.key);

export const needsSafety = (found: FoundLesson) => SAFETY_TOPICS.has(topicOf(found)) || /coolant/i.test(found.lesson.objectives.join(" "));

export function relevantRecalls(car: Car, found: FoundLesson): Recall[] {
  const re = RECALL_MATCH[topicOf(found)];
  return re ? car.recalls.filter((r) => re.test(r.component.toUpperCase())).slice(0, 3) : [];
}

export function carLine(car: Car): string {
  return [`${car.year} ${car.make} ${car.model}`, car.trim, car.engine].filter(Boolean).join(" ");
}

export const SYSTEM_PROMPT = `You write short lessons for Wrenchly, a course that teaches US car owners (not mechanics) about their own car so they can judge repair quotes and do simple jobs safely.

Write for one specific car. Name it, and use its real specs, part layout and known issues where you know them. If you are not sure about a detail for this exact car, say what is typical and tell the reader where to confirm it (owner's manual, door sticker, parts store lookup). Never invent part numbers, torque values or recall details.

Voice: plain English, second person, short sentences, like a friend who is a mechanic. No emoji, no hype, no exclamation marks. Name parts the way an owner would, giving the technical term once if it helps.

Lesson shape:
- 4 cards, in this order: "what" (what the part or system is), "how" (how it works), "breaks" (how it fails, with the symptoms the driver notices), "fix" (DIY or shop: what the job involves on this car, and when to go to a pro). Each card body is 40 to 90 words.
- costs: realistic US price ranges in dollars for parts-only DIY and for an independent shop on this car.
- safety: when the topic involves brakes, lifting the car, wheels, hot coolant, airbags or high voltage, give a concrete safety note that ends with when to stop and see a pro. Otherwise null.
- quiz: 3 questions that test the lesson's objectives, each with 4 plausible options and one correct answer (answerIndex 0 to 3). Vary which position is correct.`;

export function lessonPrompt(car: Car, found: FoundLesson): string {
  const recalls = relevantRecalls(car, found);
  const specs = Object.entries(car.specs).map(([k, v]) => `${k}: ${v}`).join("; ");
  const subject = found.isPart
    ? `Part lesson for the 3D Brake Lab: ${found.lesson.title}`
    : `Course: ${found.course!.title}. Lesson: ${found.lesson.title}`;
  return [
    `Car: ${carLine(car)}`,
    specs && `Decoded specs (NHTSA): ${specs}`,
    subject,
    `Objectives:\n${found.lesson.objectives.map((o) => `- ${o}`).join("\n")}`,
    recalls.length
      ? `Open recalls on this car that touch this topic (mention them where relevant, and tell the owner a dealer fixes recalls for free):\n${recalls.map((r) => `- ${r.campaign} (${r.component}): ${r.summary}`).join("\n")}`
      : "",
    needsSafety(found) ? "This topic requires a non-null safety note." : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
