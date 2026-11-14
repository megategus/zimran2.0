import type { Lesson } from "./types";

// Number of correct answers. Throws RangeError when the answer count does not match the quiz.
export function grade(lesson: Lesson, answers: number[]): number {
  if (answers.length !== lesson.quiz.length) throw new RangeError(`Expected ${lesson.quiz.length} answers, got ${answers.length}`);
  return lesson.quiz.reduce((n, q, i) => n + (q.answerIndex === answers[i] ? 1 : 0), 0);
}
