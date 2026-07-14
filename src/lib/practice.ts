import type { Lesson } from "./schema";
import { getLesson } from "./lessons";
import rawDialogues from "../content/dialogues-01-68.json";

export interface PracticeLine {
  speaker: string;
  spanish: string;
  english: string;
}

export interface PracticeDialogue {
  lesson: number;
  title: string;
  focus: string[];
  notes?: string;
  lines: PracticeLine[];
}

interface DialoguesFile {
  schemaVersion: number;
  source: string;
  description: string;
  dialogues: PracticeDialogue[];
}

const allDialogues = (rawDialogues as unknown as DialoguesFile).dialogues;

export function getPracticeForLesson(
  number: number,
): PracticeDialogue | undefined {
  return allDialogues.find((d) => d.lesson === number);
}

export function getPracticeForLessons(
  numbers: number[],
): PracticeDialogue[] {
  const set = new Set(numbers);
  return allDialogues.filter((d) => set.has(d.lesson));
}

export function getPracticeInRange(
  start: number,
  end: number,
): PracticeDialogue[] {
  return allDialogues.filter(
    (d) => d.lesson >= start && d.lesson <= end,
  );
}

export interface AgentLessonContext {
  lesson: Lesson;
  scenario: PracticeDialogue | undefined;
}

export function getAgentContext(numbers: number[]): AgentLessonContext[] {
  const scenarioMap = new Map<number, PracticeDialogue>();
  for (const s of getPracticeForLessons(numbers)) {
    scenarioMap.set(s.lesson, s);
  }
  return numbers
    .map((n) => {
      const lesson = getLesson(n);
      return lesson
        ? { lesson, scenario: scenarioMap.get(n) }
        : null;
    })
    .filter((x): x is AgentLessonContext => x !== null)
    .sort((a, b) => a.lesson.number - b.lesson.number);
}

export function parseRange(range: string): { start: number; end: number } | null {
  const single = range.match(/^(\d+)$/);
  if (single) {
    const n = Number(single[1]);
    return n >= 1 ? { start: n, end: n } : null;
  }
  const match = range.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (start < 1 || end < start) return null;
  return { start, end };
}

export function rangeToNumbers(range: string): number[] {
  const parsed = parseRange(range);
  if (!parsed) return [];
  const result: number[] = [];
  for (let i = parsed.start; i <= parsed.end; i++) {
    result.push(i);
  }
  return result;
}
