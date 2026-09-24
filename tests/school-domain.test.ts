import { expect, test } from "vitest";
import { initialCatalog } from "../src/school/catalog";
import { catalogSchema, profileSchema, scoreQuiz } from "../src/school/model";
import { suggestPaths } from "../src/school/guidance";
import { makePractice, practiceTopics } from "../src/school/practice";
import { publicSnapshot } from "../src/school/public-snapshot";

test("public exports remove local media, meeting links, drafts and inactive references", () => {
  const c = structuredClone(initialCatalog);
  c.registration = 3500;
  c.classes.find((v) => v.id === "fr-4e")!.active = false;
  c.subjects.find((v) => v.id === "english")!.active = false;
  c.chapters[0].published = false;
  c.resources[0].url = "";
  c.resources[0].mediaId = "private-local-id";
  c.timetable = [
    {
      id: "lesson",
      classId: "fr-3e",
      subjectId: "math",
      day: 1,
      start: "16:00",
      end: "17:00",
      location: "",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      status: "confirmed",
    },
  ];
  const result = publicSnapshot(c);
  expect(result.registration).toBe(3500);
  expect(result.resources.some((r) => r.mediaId)).toBe(false);
  expect(result.timetable[0].meetingUrl).toBe("");
  expect(
    result.chapters.some(
      (ch) =>
        ch.subjectId === "english" ||
        ch.classIds.includes("fr-4e") ||
        !ch.published,
    ),
  ).toBe(false);
  expect(catalogSchema.safeParse(result).success).toBe(true);
  expect(c.classes.find((v) => v.id === "fr-4e")).toBeDefined();
  c.classes.forEach((v) => {
    v.active = false;
  });
  expect(catalogSchema.safeParse(c).success).toBe(false);
});

test("owner-confirmed tuition and hours do not invent a billing period or class allocation", () => {
  const c = catalogSchema.parse(initialCatalog);
  expect(c.registration).toBe(2000);
  expect(c.billing).toBe("unknown");
  expect(
    c.classes.filter((v) => v.tutoring).map((v) => [v.id, v.tuition]),
  ).toEqual([
    ["fr-4e", 5000],
    ["fr-3e", 5000],
    ["fr-2nde", 5000],
    ["fr-1re", 10000],
    ["fr-terminale", 10000],
  ]);
  expect(
    c.classes
      .filter((v) => v.system === "en")
      .every((v) => v.tuition === null && !v.tutoring),
  ).toBe(true);
  expect(c.availability).toEqual([
    ...Array.from({ length: 5 }, (_, i) => ({
      day: i + 1,
      start: "16:00",
      end: "18:00",
    })),
    { day: 6, start: "08:00", end: "12:00" },
  ]);
  expect(c.timetable).toEqual([]);
});
test("school material has bilingual explanations and does not present mocks or old booklists as current official papers", () => {
  const c = initialCatalog;
  for (const chapter of c.chapters)
    for (const lang of ["fr", "en"] as const) {
      expect(chapter.lesson[lang].length).toBeGreaterThan(100);
      expect(chapter.example[lang]).not.toBe("");
      expect(chapter.solution[lang]).not.toBe("");
      expect(
        chapter.questions.every(
          (q) =>
            q.prompt[lang] && q.explanation[lang] && q.choices[q.answer][lang],
        ),
      ).toBe(true);
    }
  expect(c.resources.find((r) => r.id === "bac")?.kind).toBe("mock");
  expect(c.resources.find((r) => r.id === "manuals")?.status).toBe(
    "historical",
  );
  expect(c.resources.find((r) => r.id === "manuals")?.year).toBe("2023–2024");
  expect(
    c.resources.every(
      (r) => new URL(r.url).protocol === "https:" && r.rights.fr && r.rights.en,
    ),
  ).toBe(true);
});
test("catalogue validation rejects duplicate IDs, dangling references, unsafe links and inconsistent quizzes", () => {
  const duplicate = structuredClone(initialCatalog);
  duplicate.classes.push(duplicate.classes[0]);
  expect(catalogSchema.safeParse(duplicate).success).toBe(false);
  const reference = structuredClone(initialCatalog);
  reference.chapters[0].classIds = ["unknown"];
  expect(catalogSchema.safeParse(reference).success).toBe(false);
  const unsafe = structuredClone(initialCatalog);
  unsafe.resources[0].url = "javascript:alert(1)";
  expect(catalogSchema.safeParse(unsafe).success).toBe(false);
  unsafe.resources[0].url = "https://password:secret@example.com";
  expect(catalogSchema.safeParse(unsafe).success).toBe(false);
  const quiz = structuredClone(initialCatalog);
  quiz.chapters[0].questions[0].answer = 5;
  expect(catalogSchema.safeParse(quiz).success).toBe(false);
  quiz.chapters[0].questions[0].answer = 1;
  quiz.chapters[0].questions.push(quiz.chapters[0].questions[0]);
  expect(catalogSchema.safeParse(quiz).success).toBe(false);
});
test("timetable accepts drafts but rejects overlapping confirmed classes and sessions outside opening hours", () => {
  const c = structuredClone(initialCatalog);
  const slot = {
    id: "math-monday",
    classId: "fr-3e",
    subjectId: "math",
    day: 1,
    start: "16:00",
    end: "17:00",
    location: "",
    meetingUrl: "",
    status: "confirmed" as const,
  };
  c.timetable = [
    slot,
    {
      ...slot,
      id: "pct-monday",
      subjectId: "pct",
      start: "16:30",
      end: "18:00",
    },
  ];
  expect(catalogSchema.safeParse(c).success).toBe(false);
  c.timetable[1].status = "draft";
  expect(catalogSchema.safeParse(c).success).toBe(true);
  c.timetable[1].status = "confirmed";
  c.timetable[1].start = "17:00";
  expect(catalogSchema.safeParse(c).success).toBe(true);
  c.timetable[1].end = "19:00";
  expect(catalogSchema.safeParse(c).success).toBe(false);
  c.timetable[1].status = "cancelled";
  expect(catalogSchema.safeParse(c).success).toBe(true);
  c.timetable[0].meetingUrl = "https://zoom.us/s/123?zak=host-token";
  expect(catalogSchema.safeParse(c).success).toBe(false);
});
test("quiz scoring requires every actual question and cannot inflate results with extra answer IDs", () => {
  const chapter = initialCatalog.chapters[0];
  const answers = Object.fromEntries(
    chapter.questions.map((q) => [q.id, q.answer]),
  );
  expect(scoreQuiz(chapter, answers)).toEqual({
    correct: chapter.questions.length,
    total: chapter.questions.length,
  });
  expect(() => scoreQuiz(chapter, {})).toThrow();
  expect(() => scoreQuiz(chapter, { ...answers, fake: 0 })).toThrow();
  expect(() =>
    scoreQuiz(chapter, { ...answers, [chapter.questions[0].id]: 99 }),
  ).toThrow();
});
test("guidance keeps missing marks unknown, normalises scales, prioritises interests and excludes no paths", () => {
  const blank = suggestPaths({
    classId: "fr-terminale",
    grades: [],
    interests: [],
  });
  expect(blank).toHaveLength(6);
  expect(blank.every((p) => p.average === null)).toBe(true);
  const profile = {
    classId: "fr-terminale",
    grades: [
      { subjectId: "math", score: 10, maximum: 20 },
      { subjectId: "computing", score: 80, maximum: 100 },
    ],
    interests: ["arts" as const],
  };
  const paths = suggestPaths(profile);
  expect(paths[0].id).toBe("arts");
  expect(paths.find((p) => p.id === "technology")?.average).toBeCloseTo(0.65);
  expect(paths).toHaveLength(6);
  expect(
    profileSchema.safeParse({
      ...profile,
      grades: [{ subjectId: "math", score: 21, maximum: 20 }],
    }).success,
  ).toBe(false);
  expect(
    profileSchema.safeParse({
      ...profile,
      grades: [profile.grades[0], profile.grades[0]],
    }).success,
  ).toBe(false);
});
test("fresh arithmetic practice is deterministic, finite and offers different problems", () => {
  for (const topic of practiceTopics) {
    expect(makePractice(topic, 165)).toEqual(makePractice(topic, 165));
    expect(makePractice(topic, 165).prompt).not.toEqual(
      makePractice(topic, 197).prompt,
    );
    expect(Number.isFinite(makePractice(topic, 99999).answer)).toBe(true);
  }
  expect(makePractice("equations", 165).answer).toBe(2);
  expect(makePractice("percent", 0).answer).toBe(10);
});
