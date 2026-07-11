import { describe, it, expect } from "vitest";
import { getAllLessons } from "./lessons";
import { LessonSchema } from "./schema";

describe("lesson schema validation", () => {
  const lessons = getAllLessons();

  it("all lessons satisfy the schema", () => {
    for (const lesson of lessons) {
      const result = LessonSchema.safeParse(lesson);
      if (!result.success) {
        throw new Error(
          `Lesson ${lesson.number}: ${result.error.message}`,
        );
      }
    }
  });

  it("lesson numbers are unique", () => {
    const numbers = lessons.map((l) => l.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("lessons are sorted numerically", () => {
    const numbers = lessons.map((l) => l.number);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });

  it("every sentence has non-empty spanish and english", () => {
    for (const lesson of lessons) {
      for (const s of lesson.sentences) {
        expect(s.spanish.trim()).toBeTruthy();
        expect(s.english.trim()).toBeTruthy();
      }
    }
  });

  it("no duplicate sentence pairs within a lesson", () => {
    for (const lesson of lessons) {
      const pairs = lesson.sentences.map(
        (s) => `${s.spanish}|${s.english}`,
      );
      expect(new Set(pairs).size).toBe(pairs.length);
    }
  });

  it("every lesson with status reviewed has content", () => {
    for (const lesson of lessons) {
      if (lesson.status === "reviewed") {
        const hasContent =
          lesson.concepts.length > 0 ||
          lesson.verbs.length > 0 ||
          lesson.keywords.length > 0 ||
          lesson.sentences.length > 0;
        expect(hasContent).toBe(true);
      }
    }
  });
});
