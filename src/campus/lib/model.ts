export type Track = "devops" | "kids";
export type Persona = "teacher" | "adult" | "parent" | "child";
export type Student = {
  id: string;
  name: string;
  track: Track;
  email: string;
  parent: string;
  credits: number;
  active: boolean;
};
export type Lesson = {
  id: string;
  title: string;
  track: Track;
  module: string;
  minutes: number;
  level: string;
  explanation: string;
  task: string;
  criteria: string;
  resource: string;
};
export type Session = {
  id: string;
  title: string;
  track: Track;
  start: string;
  duration: number;
  zoom: string;
  replay: string;
  status: "scheduled" | "cancelled";
  attendance: Record<string, string>;
};
export type Submission = {
  id: string;
  student: string;
  lesson: string;
  text: string;
  url: string;
  file?: { id: string; name: string };
  created: string;
  status: "pending" | "revise" | "validated";
  feedback: string;
  level: string;
};
export type Slot = {
  id: string;
  start: string;
  duration: number;
  student: string | null;
  goal: string;
  status: "open" | "booked" | "completed";
  zoom: string;
};
export type Stage = {
  id: string;
  student: string;
  status: "preparation" | "submitted" | "accepted" | "active" | "completed";
  mentor: string;
  start: string;
  end: string;
  notes: string;
  activities: { id: string; date: string; text: string }[];
};
export type Payment = {
  id: string;
  student: string;
  amount: number;
  currency: string;
  date: string;
  reference: string;
  status: "pending" | "verified" | "refunded";
  description: string;
};
export type Help = {
  id: string;
  student: string;
  question: string;
  answer: string;
  created: string;
};
export type Campus = {
  schema: 1;
  students: Student[];
  lessons: Lesson[];
  sessions: Session[];
  submissions: Submission[];
  slots: Slot[];
  stages: Stage[];
  payments: Payment[];
  help: Help[];
  audit: { id: string; date: string; action: string; actor: string }[];
};
export type Snapshot = {
  state: Campus;
  version: number;
  persona: Persona;
  demo: true;
};
export const personas: {
  value: Persona;
  label: string;
  name: string;
  student?: string;
}[] = [
  { value: "teacher", label: "Formateur", name: "Carles" },
  {
    value: "adult",
    label: "Élève DevOps",
    name: "DevOps learner",
    student: "alex",
  },
  { value: "parent", label: "Parent", name: "Parent" },
  {
    value: "child",
    label: "Élève Kids",
    name: "Young learner",
    student: "maya",
  },
];
export const trackLabel = (t: string) =>
  t === "kids" ? "LessGooo Kids" : "DevOps & Cloud";
export const stageLabels: Record<string, string> = {
  preparation: "En préparation",
  submitted: "Dossier transmis",
  accepted: "Accepté",
  active: "Stage en cours",
  completed: "Stage terminé",
};
export function progress(c: Campus, student: string) {
  const s = c.students.find((x) => x.id === student);
  const lessons = new Set(
    c.lessons.filter((l) => l.track === s?.track).map((l) => l.id),
  );
  const total = lessons.size;
  const done = new Set(
    c.submissions
      .filter(
        (x) =>
          x.student === student &&
          x.status === "validated" &&
          lessons.has(x.lesson),
      )
      .map((x) => x.lesson),
  ).size;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}
