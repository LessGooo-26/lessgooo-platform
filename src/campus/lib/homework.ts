import type { Campus, Lesson, Submission } from "./model";

export type HomeworkItem = {
  lesson: Lesson;
  student: Campus["students"][number];
  submission?: Submission;
  status: "missing" | Submission["status"];
};
export function homeworkItems(c: Campus, studentId: string): HomeworkItem[] {
  const student = c.students.find((s) => s.id === studentId);
  if (!student) return [];
  const lessons = [
    ...new Map(
      c.lessons.filter((l) => l.track === student.track).map((l) => [l.id, l]),
    ).values(),
  ];
  lessons.sort((a, b) =>
    a.module.localeCompare(b.module, "en", { numeric: true }),
  );
  return lessons.map((lesson) => {
    const attempts = c.submissions
      .filter((s) => s.student === studentId && s.lesson === lesson.id)
      .sort((a, b) => b.created.localeCompare(a.created));
    const submission = attempts[0];
    return {
      lesson,
      student,
      submission,
      status: submission?.status || "missing",
    };
  });
}

// Only untouched, bundled examples are translated. Learner work and edited feedback stay verbatim.
const examples: Record<
  string,
  Partial<Record<"text" | "feedback", [string, string]>>
> = {
  sub1: {
    text: [
      "pwd affiche où je suis. ls liste les fichiers. J’ai créé mon dossier de notes et vérifié son chemin. Un chemin absolu commence depuis /, un chemin relatif part du dossier actuel.",
      "pwd shows where I am. ls lists the files. I created my notes folder and checked its path. An absolute path starts at /; a relative path starts in the current folder.",
    ],
    feedback: [
      "Les repères sont acquis. Pour la suite, explique les autorisations de ton dossier.",
      "You can find your way around. Next, explain the permissions on your folder.",
    ],
  },
  sub2: {
    text: [
      "J’ai utilisé chmod 600 notes.txt. Le propriétaire peut lire et écrire. Le groupe et les autres n’ont aucun droit.",
      "I used chmod 600 notes.txt. The owner can read and write. The group and everyone else have no permissions.",
    ],
  },
  sub3: {
    text: [
      "J’ai mis mon dessin dans Mes projets LessGooo puis Dessins. Le dossier est la boîte et le fichier est mon dessin.",
      "I put my drawing in My LessGooo projects, then Drawings. The folder is the box and the file is my drawing.",
    ],
    feedback: [
      "Tu retrouves ton fichier seule. Prochaine mission : créer ton personnage Scratch.",
      "You can find your file on your own. Next mission: create your Scratch character.",
    ],
  },
};
export function homeworkText(
  submission: Submission,
  field: "text" | "feedback",
  locale: "en" | "fr",
) {
  const entry = examples[submission.id]?.[field];
  return entry && submission[field] === entry[0]
    ? entry[locale === "en" ? 1 : 0]
    : submission[field];
}
