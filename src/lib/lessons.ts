import type { Lesson } from "./schema";

const lessonModules = import.meta.glob<{ default: Lesson }>(
  "/src/content/lessons/*.json",
  { eager: true },
);

export function getAllLessons(): Lesson[] {
  const lessons = Object.values(lessonModules).map((mod) => mod.default);
  lessons.sort((a, b) => a.number - b.number);
  return lessons;
}

export function getLesson(number: number): Lesson | undefined {
  return getAllLessons().find((l) => l.number === number);
}

export function getLessonsInRange(start: number, end: number): Lesson[] {
  return getAllLessons().filter(
    (l) => l.number >= start && l.number <= end,
  );
}

export function getMaxLessonNumber(): number {
  const lessons = getAllLessons();
  if (lessons.length === 0) return 0;
  return lessons[lessons.length - 1].number;
}
