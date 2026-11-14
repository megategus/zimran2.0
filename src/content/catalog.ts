import type { CourseKey, LessonKey } from "@/lib/types";

export type CatalogLesson = { key: LessonKey; title: string; objectives: string[] };

export type Course = {
  key: CourseKey;
  title: string;
  status: "live" | "soon";
  part: string; // PartArt key for the course header
  lessons: CatalogLesson[];
  outline?: string[];
};

export type Part = { key: LessonKey; name: string; objectives: string[] };

export const COURSES: Course[] = [
  {
    key: "brakes",
    title: "Brakes",
    status: "live",
    part: "rotor",
    lessons: [
      { key: "brakes-1", title: "How your brakes stop the car", objectives: ["Name pads, rotors, calipers and brake fluid", "Explain how pedal pressure becomes clamping force", "Know what brake type this car has front and rear"] },
      { key: "brakes-2", title: "Squeals, grinding and a soft pedal", objectives: ["Match common noises and feelings to worn parts", "Know the minimum pad thickness and how to check it", "Tell urgent symptoms from ones that can wait"] },
      { key: "brakes-3", title: "Pads and rotors: DIY or shop", objectives: ["Know what a pad and rotor job involves on this car", "Know fair shop prices for this car", "Spot an upsell, like rotors replaced when they could be resurfaced"] },
    ],
  },
  {
    key: "oil-fluids",
    title: "Oil & Fluids",
    status: "live",
    part: "dipstick",
    lessons: [
      { key: "oil-fluids-1", title: "Reading your dipstick", objectives: ["Find and read the oil dipstick", "Know this engine's oil grade and capacity", "Read oil color and level"] },
      { key: "oil-fluids-2", title: "The other fluids under your hood", objectives: ["Find coolant, brake fluid and washer reservoirs", "Know which fluids are sealed and which you top up", "Never open a hot coolant cap"] },
      { key: "oil-fluids-3", title: "Oil change: DIY or shop", objectives: ["Know the oil change interval for this car", "Know what a DIY oil change needs", "Know fair quick-lube prices and common upsells"] },
    ],
  },
  {
    key: "tires-wheels",
    title: "Tires & Wheels",
    status: "live",
    part: "wheel",
    lessons: [
      { key: "tires-wheels-1", title: "Reading your tire sidewall", objectives: ["Decode this car's tire size", "Find the correct pressure on the door sticker", "Know what the TPMS light means"] },
      { key: "tires-wheels-2", title: "Tread, wear patterns and alignment", objectives: ["Measure tread with the penny test", "Read uneven wear patterns", "Know when to rotate and align"] },
      { key: "tires-wheels-3", title: "Changing a flat safely", objectives: ["Find the jack points and spare on this car", "Know the lug nut torque and star pattern", "Use jack stands and a flat surface"] },
    ],
  },
  { key: "electrical", title: "Electrical", status: "soon", part: "battery", lessons: [], outline: ["Battery health and jump-starts", "Fuses, relays and dead accessories", "Alternator warning signs"] },
  { key: "cooling", title: "Cooling", status: "soon", part: "coolant", lessons: [], outline: ["How coolant keeps your engine alive", "Overheating: what to do on the road", "Radiator, thermostat and water pump"] },
  { key: "suspension", title: "Suspension", status: "soon", part: "shock", lessons: [], outline: ["Shocks, struts and springs", "Clunks and bouncing", "When alignment is not enough"] },
  { key: "transmission", title: "Transmission", status: "soon", part: "gear", lessons: [], outline: ["Automatic vs CVT vs manual", "Slipping and harsh shifts", "Fluid service myths"] },
  { key: "ev-basics", title: "EV Basics", status: "soon", part: "ev-plug", lessons: [], outline: ["Battery, motor and regen braking", "Charging levels at home and on the road", "High-voltage safety: what never to touch"] },
];

export const PARTS: Part[] = [
  { key: "part-rotor", name: "Brake rotor", objectives: ["What the rotor does", "Warping, scoring and minimum thickness", "Resurface or replace"] },
  { key: "part-caliper", name: "Caliper", objectives: ["How the piston clamps the pads", "Sticking caliper symptoms", "Why caliper work needs a brake bleed"] },
  { key: "part-pads", name: "Brake pads", objectives: ["Friction material and the wear tab", "Ceramic vs semi-metallic", "How long pads last on this car"] },
  { key: "part-bracket", name: "Caliper bracket", objectives: ["What holds the caliper in place", "Slide pins and lubrication", "Torque matters on bracket bolts"] },
  { key: "part-hub", name: "Wheel hub", objectives: ["Hub, bearing and wheel studs", "Humming noise from a bad bearing", "Why lug nut torque matters"] },
];

export type FoundLesson = { course?: Course; lesson: CatalogLesson; isPart: boolean };

export function findLesson(key: LessonKey): FoundLesson | null {
  const part = PARTS.find((p) => p.key === key);
  if (part) return { lesson: { key: part.key, title: part.name, objectives: part.objectives }, isPart: true };
  for (const course of COURSES) {
    const lesson = course.lessons.find((l) => l.key === key);
    if (lesson) return { course, lesson, isPart: false };
  }
  return null;
}
