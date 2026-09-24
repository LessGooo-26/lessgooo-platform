import { z } from "zod";

export const copySchema = z
  .object({
    fr: z.string().trim().min(1).max(12000),
    en: z.string().trim().min(1).max(12000),
  })
  .strict();
export type Copy = z.infer<typeof copySchema>;
export const pair = (fr: string, en: string): Copy => ({ fr, en });
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,90}$/);
const ids = z.array(id).max(150);
const url = z
  .string()
  .max(2048)
  .refine((s) => {
    if (!s) return true;
    try {
      const u = new URL(s);
      return u.protocol === "https:" && !u.username && !u.password;
    } catch {
      return false;
    }
  }, "HTTPS required");
const clock = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const classSchema = z
  .object({
    id,
    name: copySchema,
    system: z.enum(["fr", "en"]),
    cycle: z.enum(["primary", "secondary", "technical"]),
    exam: z.string().max(100),
    tuition: z.number().int().min(0).max(10000000).nullable(),
    tutoring: z.boolean(),
    active: z.boolean(),
  })
  .strict();
export const subjectSchema = z
  .object({
    id,
    name: copySchema,
    description: copySchema,
    prerequisites: copySchema,
    active: z.boolean(),
  })
  .strict();
export const questionSchema = z
  .object({
    id,
    prompt: copySchema,
    choices: z.array(copySchema).min(2).max(6),
    answer: z.number().int().min(0).max(5),
    explanation: copySchema,
  })
  .strict()
  .refine((q) => q.answer < q.choices.length, "Invalid answer index");
export const chapterSchema = z
  .object({
    id,
    subjectId: id,
    classIds: ids.min(1),
    order: z.number().int().min(1).max(500),
    title: copySchema,
    goal: copySchema,
    prerequisites: copySchema,
    lesson: copySchema,
    example: copySchema,
    challenge: copySchema,
    solution: copySchema,
    questions: z.array(questionSchema).min(1).max(100),
    published: z.boolean(),
  })
  .strict();
export const resourceKinds = [
  "programme",
  "booklist",
  "book",
  "paper",
  "mock",
  "exercise",
  "video",
  "audio",
  "document",
  "simulation",
  "guidance",
] as const;
export const resourceSchema = z
  .object({
    id,
    title: copySchema,
    description: copySchema,
    kind: z.enum(resourceKinds),
    classIds: ids,
    subjectId: z.string().max(90),
    url,
    mediaId: z.string().max(90),
    source: z.string().trim().min(1).max(200),
    year: z.string().max(40),
    language: z.enum(["fr", "en", "both"]),
    status: z.enum(["source", "historical", "complement", "review"]),
    rights: copySchema,
    published: z.boolean(),
  })
  .strict()
  .refine(
    (r) => Boolean(r.url) !== Boolean(r.mediaId),
    "Choose one link or uploaded file",
  );
const slot = z
  .object({ day: z.number().int().min(1).max(7), start: clock, end: clock })
  .strict()
  .refine((s) => s.end > s.start, "End must follow start");
export const timetableSchema = z
  .object({
    id,
    classId: id,
    subjectId: id,
    day: z.number().int().min(1).max(7),
    start: clock,
    end: clock,
    location: z.string().max(300),
    meetingUrl: url.refine((value) => {
      if (!value) return true;
      try {
        const u = new URL(value);
        return (
          !u.searchParams.has("zak") &&
          !(
            (u.hostname === "zoom.us" ||
              u.hostname.endsWith(".zoom.us") ||
              u.hostname === "zoom.com" ||
              u.hostname.endsWith(".zoom.com")) &&
            u.pathname.startsWith("/s/")
          )
        );
      } catch {
        return false;
      }
    }, "Participant link required"),
    status: z.enum(["draft", "confirmed", "cancelled"]),
  })
  .strict()
  .refine((s) => s.end > s.start, "End must follow start");
export const catalogSchema = z
  .object({
    schema: z.literal(1),
    schoolYear: z.string().trim().min(1).max(40),
    registration: z.number().int().min(0).max(10000000),
    tutoringSubjectIds: ids.default([
      "math",
      "pct",
      "french",
      "english",
      "svt",
      "computing",
    ]),
    billing: z.enum(["unknown", "month", "term", "year", "session"]),
    timezone: z.literal("Africa/Douala"),
    availability: z.array(slot).max(30),
    classes: z.array(classSchema).min(1).max(150),
    subjects: z.array(subjectSchema).min(1).max(100),
    chapters: z.array(chapterSchema).max(3000),
    resources: z.array(resourceSchema).max(3000),
    timetable: z.array(timetableSchema).max(1500),
  })
  .strict()
  .superRefine((c, ctx) => {
    const problem = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    if (!c.classes.some((v) => v.active))
      problem(["classes"], "Keep at least one visible class");
    if (!c.subjects.some((v) => v.active))
      problem(["subjects"], "Keep at least one visible subject");
    for (const key of [
      "classes",
      "subjects",
      "chapters",
      "resources",
      "timetable",
    ] as const) {
      const seen = new Set<string>();
      c[key].forEach((v, i) => {
        if (seen.has(v.id)) problem([key, i, "id"], "Duplicate identifier");
        seen.add(v.id);
      });
    }
    const classes = new Set(c.classes.map((v) => v.id)),
      subjects = new Set(c.subjects.map((v) => v.id));
    if (c.tutoringSubjectIds.some((id) => !subjects.has(id)))
      problem(["tutoringSubjectIds"], "Unknown tutoring subject");
    c.chapters.forEach((v, i) => {
      if (!subjects.has(v.subjectId))
        problem(["chapters", i, "subjectId"], "Unknown subject");
      if (v.classIds.some((x) => !classes.has(x)))
        problem(["chapters", i, "classIds"], "Unknown class");
      if (new Set(v.questions.map((q) => q.id)).size !== v.questions.length)
        problem(["chapters", i, "questions"], "Duplicate question identifier");
    });
    c.resources.forEach((v, i) => {
      if (v.subjectId && !subjects.has(v.subjectId))
        problem(["resources", i, "subjectId"], "Unknown subject");
      if (v.classIds.some((x) => !classes.has(x)))
        problem(["resources", i, "classIds"], "Unknown class");
    });
    c.timetable.forEach((v, i) => {
      if (!classes.has(v.classId) || !subjects.has(v.subjectId))
        problem(["timetable", i], "Unknown class or subject");
      if (
        v.status !== "cancelled" &&
        !c.availability.some(
          (s) => s.day === v.day && s.start <= v.start && s.end >= v.end,
        )
      )
        problem(["timetable", i], "Outside opening hours");
      if (
        v.status === "confirmed" &&
        c.timetable.some(
          (w, j) =>
            j < i &&
            w.status === "confirmed" &&
            w.classId === v.classId &&
            w.day === v.day &&
            w.start < v.end &&
            v.start < w.end,
        )
      )
        problem(["timetable", i], "Class timetable conflict");
    });
  });
export type SchoolCatalog = z.infer<typeof catalogSchema>;
export type SchoolClass = z.infer<typeof classSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type Timetable = z.infer<typeof timetableSchema>;
export type CatalogSnapshot = { catalog: SchoolCatalog; version: number };
export type Attempt = {
  id: string;
  owner: string;
  chapterId: string;
  title: Copy;
  correct: number;
  total: number;
  created: string;
};
export const interests = [
  "science",
  "health",
  "technology",
  "business",
  "arts",
  "society",
] as const;
export const profileSchema = z
  .object({
    classId: id,
    grades: z
      .array(
        z
          .object({
            subjectId: id,
            score: z.number().min(0),
            maximum: z.number().positive().max(1000),
          })
          .strict()
          .refine((g) => g.score <= g.maximum, "Score exceeds maximum"),
      )
      .max(100),
    interests: z.array(z.enum(interests)).max(6),
  })
  .strict()
  .refine(
    (p) => new Set(p.grades.map((g) => g.subjectId)).size === p.grades.length,
    "Duplicate subject mark",
  );
export type SchoolProfile = z.infer<typeof profileSchema>;
export type SchoolProgress = {
  profile: SchoolProfile | null;
  attempts: Attempt[];
};
export function scoreQuiz(chapter: Chapter, answers: Record<string, number>) {
  if (
    Object.keys(answers).length !== chapter.questions.length ||
    chapter.questions.some(
      (q) =>
        !Number.isInteger(answers[q.id]) ||
        answers[q.id] < 0 ||
        answers[q.id] >= q.choices.length,
    )
  )
    throw new Error("Complete every question");
  return {
    correct: chapter.questions.filter((q) => answers[q.id] === q.answer).length,
    total: chapter.questions.length,
  };
}
