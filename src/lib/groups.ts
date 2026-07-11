export interface CheatSheetGroup {
  label: string;
  start: number;
  end: number;
  slug: string;
}

export const CHEAT_SHEET_GROUPS: CheatSheetGroup[] = [
  { label: "Lessons 1–10", start: 1, end: 10, slug: "1-10" },
  { label: "Lessons 11–20", start: 11, end: 20, slug: "11-20" },
  { label: "Lessons 21–30", start: 21, end: 30, slug: "21-30" },
  { label: "Lessons 31–40", start: 31, end: 40, slug: "31-40" },
  { label: "Lessons 41–50", start: 41, end: 50, slug: "41-50" },
  { label: "Lessons 51–60", start: 51, end: 60, slug: "51-60" },
  { label: "Lessons 61–68", start: 61, end: 68, slug: "61-68" },
];

export function findGroupForLesson(number: number): CheatSheetGroup | undefined {
  return CHEAT_SHEET_GROUPS.find(
    (g) => number >= g.start && number <= g.end,
  );
}

export function getGroupBySlug(slug: string): CheatSheetGroup | undefined {
  return CHEAT_SHEET_GROUPS.find((g) => g.slug === slug);
}
