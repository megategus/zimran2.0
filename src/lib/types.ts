// Shared contracts. Frozen after Task A0: change only through Agent A.

export type Guest = {
  id: string;
  isPremium: boolean;
  dayOffset: number;
  xp: number;
  isDemo: boolean;
};

export type Recall = {
  campaign: string;
  component: string;
  summary: string;
  remedy: string;
};

export type Car = {
  id: string;
  guestId: string;
  vin: string | null;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  engine: string | null;
  specs: Record<string, string>;
  recalls: Recall[];
};

export type CardKind = "what" | "how" | "breaks" | "fix";

export type QuizItem = { q: string; options: string[]; answerIndex: number };

export type Lesson = {
  title: string;
  carLine: string;
  cards: { kind: CardKind; heading: string; body: string }[];
  costs: { diy: string; shop: string };
  safety: string | null;
  quiz: QuizItem[];
};

// What the client receives: answers stay on the server.
export type PublicLesson = Omit<Lesson, "quiz"> & { quiz: { q: string; options: string[] }[] };

export type CourseKey =
  | "brakes"
  | "oil-fluids"
  | "tires-wheels"
  | "electrical"
  | "cooling"
  | "suspension"
  | "transmission"
  | "ev-basics";

export type LessonKey = string;
