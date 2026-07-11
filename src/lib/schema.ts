import { z } from "zod";

export const LessonSourceSchema = z.object({
  type: z.enum(["tribute", "official-audio", "manual", "other"]).optional(),
  url: z.string().url().optional(),
  importedAt: z.string().optional(),
  reviewedAt: z.string().optional(),
});

export const LessonSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(1),
  status: z.enum(["draft", "reviewed", "not-yet-transcribed"]),
  source: LessonSourceSchema.optional(),
  concepts: z.array(z.string().min(1)),
  verbs: z.array(
    z.object({
      spanish: z.string().min(1),
      english: z.string().min(1),
      forms: z.array(z.string()).optional(),
      note: z.string().optional(),
    }),
  ),
  keywords: z.array(
    z.object({
      spanish: z.string().min(1),
      english: z.string().min(1),
      note: z.string().optional(),
    }),
  ),
  sentences: z.array(
    z.object({
      spanish: z.string().min(1),
      english: z.string().min(1),
      note: z.string().optional(),
    }),
  ),
});

export type Lesson = z.infer<typeof LessonSchema>;
export type LessonSource = z.infer<typeof LessonSourceSchema>;
