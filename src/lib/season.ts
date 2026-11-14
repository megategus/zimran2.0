import type { Lesson, LessonKey } from "./types";

// Seasonal tip per month. No figures here: the number is quoted from the car's own cached lesson (findSentence).
type Tip = { text: string; lessonKey: LessonKey; quote: RegExp };

const COLD: Tip = { text: "Cold air lowers tire pressure. Check yours against the door sticker this week.", lessonKey: "tires-wheels-1", quote: /(psi[^.]*(°F|degree|cold|temperature))|((°F|degree|cold|temperature)[^.]*psi)/i };
const SPRING: Tip = { text: "Pothole season. Check tread depth and watch for uneven wear.", lessonKey: "tires-wheels-2", quote: /(tread|penny)[^.]*(inch|\/32)/i };
const SUMMER: Tip = { text: "Road-trip heat is hard on oil. Check the dipstick before a long drive.", lessonKey: "oil-fluids-1", quote: /(quart|capacity|0W|5W)/i };
const FALL: Tip = { text: "Wet leaves and early dark. Make sure your brakes are ready.", lessonKey: "brakes-2", quote: /(mm|inch)[^.]*(pad|thick)|(pad|thick)[^.]*(mm|inch)/i };

const BY_MONTH: Tip[] = [COLD, COLD, SPRING, SPRING, SPRING, SUMMER, SUMMER, SUMMER, FALL, FALL, COLD, COLD];
const NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function seasonTip(month: number) {
  return { month: NAMES[month], ...BY_MONTH[month] };
}

// First sentence across the lesson cards that matches, or null.
export function findSentence(lesson: Lesson, re: RegExp): string | null {
  for (const c of lesson.cards) {
    const hit = c.body.match(/[^.!?]+[.!?]/g)?.map((s) => s.trim()).find((s) => re.test(s));
    if (hit) return hit;
  }
  return null;
}
