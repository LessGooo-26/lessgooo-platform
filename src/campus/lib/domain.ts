import { z } from "zod";
import type { Campus, Persona } from "./model";
import { seedCampus } from "./seed";
export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const text = (max = 500) => z.string().trim().max(max);
const req = (max = 500) => text(max).min(1, "Ce champ est requis.");
const ident = req(100);
const track = z.enum(["kids", "devops"]);
const date = req(50).refine(
  (v) => Number.isFinite(Date.parse(v)),
  "Date invalide",
);
export function safeUrl(value: string, zoom = false) {
  if (!value) return "";
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw new DomainError("Adresse web invalide.");
  }
  if (u.protocol !== "https:" || u.username || u.password)
    throw new DomainError("Utilisez une adresse HTTPS.");
  if (
    zoom &&
    !(
      u.hostname === "zoom.us" ||
      u.hostname.endsWith(".zoom.us") ||
      u.hostname === "zoom.com" ||
      u.hostname.endsWith(".zoom.com")
    )
  )
    throw new DomainError("Utilisez le lien participant Zoom.");
  if (zoom && u.pathname.startsWith("/s/"))
    throw new DomainError("Un lien hôte Zoom ne doit pas être partagé.");
  return u.toString();
}
const url = text(2000).transform((v) => safeUrl(v));
const zoom = text(2000).transform((v) => safeUrl(v, true));
const schemas = {
  student: z.object({
    id: text(100).optional(),
    name: req(100),
    track,
    email: text(254).refine(
      (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Email invalide",
    ),
    parent: text(100),
    credits: z.number().int().min(0).max(100),
    active: z.boolean().default(true),
  }),
  lesson: z.object({
    id: text(100).optional(),
    title: req(150),
    track,
    module: req(100),
    minutes: z.number().int().min(5).max(300),
    level: req(60),
    explanation: req(12000),
    task: req(12000),
    criteria: req(5000),
    resource: url,
  }),
  session: z.object({
    id: text(100).optional(),
    title: req(150),
    track,
    start: date,
    duration: z.number().int().min(15).max(360),
    zoom,
    replay: url,
    status: z.enum(["scheduled", "cancelled"]).default("scheduled"),
  }),
  attendance: z.object({
    session: ident,
    student: ident,
    status: z.enum(["present", "absent", "excused"]),
  }),
  submit: z.object({ lesson: ident, text: req(12000), url }),
  review: z.object({
    id: ident,
    status: z.enum(["validated", "revise"]),
    feedback: req(5000),
    level: z.enum(["avec aide", "autonome", "réutilisé ailleurs"]),
  }),
  slot: z.object({
    id: text(100).optional(),
    start: date,
    duration: z.number().int().min(15).max(180),
    zoom,
  }),
  book: z.object({ id: ident, goal: req(1000), student: ident.optional() }),
  cancel: z.object({ id: ident }),
  complete: z.object({ id: ident }),
  stage: z.object({
    id: text(100).optional(),
    student: ident,
    status: z.enum([
      "preparation",
      "submitted",
      "accepted",
      "active",
      "completed",
    ]),
    mentor: text(100),
    start: text(40),
    end: text(40),
    notes: text(5000),
  }),
  activity: z.object({ id: ident, text: req(5000) }),
  payment: z.object({
    student: ident,
    amount: z.number().int().positive().max(1000000000),
    currency: z.enum(["USD", "CAD", "XAF"]),
    date: date,
    reference: req(100),
    description: req(300),
    status: z.enum(["pending", "verified"]),
  }),
  paymentStatus: z.object({
    id: ident,
    status: z.enum(["verified", "refunded"]),
  }),
  help: z.object({ question: req(3000) }),
  answer: z.object({ id: ident, answer: req(5000) }),
  reset: z.object({ confirm: z.literal("REINITIALISER") }),
};
export type ActionName = keyof typeof schemas;
export function studentFor(p: Persona) {
  return p === "adult"
    ? "alex"
    : p === "child" || p === "parent"
      ? "maya"
      : null;
}
export function filterCampus(c: Campus, p: Persona): Campus {
  if (p === "teacher") return c;
  const id = studentFor(p)!;
  const t = c.students.find((s) => s.id === id)?.track;
  return {
    ...c,
    students: c.students.filter((s) => s.id === id),
    lessons: c.lessons.filter((l) => l.track === t),
    sessions: c.sessions
      .filter((s) => s.track === t)
      .map((s) => ({
        ...s,
        attendance: s.attendance[id] ? { [id]: s.attendance[id] } : {},
      })),
    submissions: c.submissions.filter((s) => s.student === id),
    slots:
      p === "adult"
        ? c.slots.filter((s) => !s.student || s.student === id)
        : [],
    stages: p === "adult" ? c.stages.filter((s) => s.student === id) : [],
    payments: p === "child" ? [] : c.payments.filter((x) => x.student === id),
    help: c.help.filter((x) => x.student === id),
    audit: [],
  };
}
export function applyAction(
  original: Campus,
  persona: Persona,
  name: string,
  input: unknown,
): Campus {
  if (!Object.hasOwn(schemas, name)) throw new DomainError("Action inconnue");
  const schema = schemas[name as ActionName];
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    throw new DomainError(
      parsed.error.issues[0]?.message || "Valeurs invalides",
    );
  let c = structuredClone(original);
  const now = new Date().toISOString();
  const id = () => crypto.randomUUID();
  const teacher = () => {
    if (persona !== "teacher")
      throw new DomainError("Cette action est réservée au formateur.", 403);
  };
  const find = <T extends { id: string }>(list: T[], key: string): T => {
    const value = list.find((v) => v.id === key);
    if (!value) throw new DomainError("Élément introuvable.", 404);
    return value;
  };
  const student = () => {
    const key = studentFor(persona);
    if (!key)
      throw new DomainError(
        "Choisissez la vue élève pour remettre un travail.",
        403,
      );
    return find(c.students, key);
  };
  const upsert = <T extends { id: string }>(
    list: T[],
    value: Omit<T, "id"> & { id?: string },
  ) => {
    if (value.id) {
      const i = list.findIndex((x) => x.id === value.id);
      if (i < 0) throw new DomainError("Élément introuvable.", 404);
      list[i] = { ...list[i], ...value };
    } else {
      list.push({ ...value, id: id() } as T);
    }
  };
  const overlaps = (start: string, duration: number, skip = "") => {
    const a = Date.parse(start),
      b = a + duration * 60000;
    return [
      ...c.sessions.filter((s) => s.status !== "cancelled"),
      ...c.slots,
    ].some(
      (s) =>
        s.id !== skip &&
        a < Date.parse(s.start) + s.duration * 60000 &&
        b > Date.parse(s.start),
    );
  };
  switch (name) {
    case "student": {
      const d = parsed.data as z.infer<typeof schemas.student>;

      teacher();
      if (d.track === "kids" && !d.parent)
        throw new DomainError("Le nom du parent est requis.");
      if (d.id) {
        const old = find(c.students, d.id);
        if (old.track !== d.track)
          throw new DomainError(
            "Créez un nouveau dossier pour changer de parcours.",
          );
      }
      upsert(c.students, d);
      break;
    }
    case "lesson": {
      const d = parsed.data as z.infer<typeof schemas.lesson>;

      teacher();
      if (d.id && find(c.lessons, d.id).track !== d.track)
        throw new DomainError(
          "Le parcours d’une leçon existante ne peut pas être changé.",
        );
      upsert(c.lessons, d);
      break;
    }
    case "session": {
      const d = parsed.data as z.infer<typeof schemas.session>;

      teacher();
      if (d.status !== "cancelled" && overlaps(d.start, d.duration, d.id))
        throw new DomainError(
          "Ce créneau chevauche une séance ou un coaching.",
        );
      upsert(c.sessions, {
        ...d,
        start: new Date(d.start).toISOString(),
        attendance: d.id ? find(c.sessions, d.id).attendance : {},
      });
      break;
    }
    case "attendance": {
      const d = parsed.data as z.infer<typeof schemas.attendance>;
      {
        teacher();
        const s = find(c.sessions, d.session),
          u = find(c.students, d.student);
        if (u.track !== s.track)
          throw new DomainError("Cet élève appartient à un autre parcours.");
        s.attendance[d.student] = d.status;
        break;
      }
    }
    case "submit": {
      const d = parsed.data as z.infer<typeof schemas.submit>;
      {
        if (persona === "parent" || persona === "teacher")
          throw new DomainError(
            "Utilisez la vue élève pour remettre le travail.",
            403,
          );
        const s = student(),
          l = find(c.lessons, d.lesson);
        if (l.track !== s.track)
          throw new DomainError(
            "Cette leçon ne fait pas partie du parcours.",
            403,
          );
        if (
          c.submissions.some(
            (x) =>
              x.lesson === d.lesson &&
              x.student === s.id &&
              x.status === "pending",
          )
        )
          throw new DomainError(
            "Un travail est déjà en attente de correction pour cette leçon.",
          );
        c.submissions.unshift({
          id: id(),
          student: s.id,
          lesson: d.lesson,
          text: d.text,
          url: d.url,
          created: now,
          status: "pending",
          feedback: "",
          level: "",
        });
        break;
      }
    }
    case "review": {
      const d = parsed.data as z.infer<typeof schemas.review>;

      teacher();
      Object.assign(find(c.submissions, d.id), {
        status: d.status,
        feedback: d.feedback,
        level: d.level,
      });
      break;
    }
    case "slot": {
      const d = parsed.data as z.infer<typeof schemas.slot>;

      teacher();
      if (Date.parse(d.start) < Date.now())
        throw new DomainError("Choisissez un créneau futur.");
      if (overlaps(d.start, d.duration, d.id))
        throw new DomainError(
          "Ce créneau chevauche une séance ou un coaching.",
        );
      if (d.id) {
        const slot = find(c.slots, d.id);
        if (slot.status === "completed")
          throw new DomainError("Cette séance est terminée.");
        Object.assign(slot, {
          start: d.start,
          duration: d.duration,
          zoom: d.zoom,
        });
      } else
        c.slots.push({
          ...d,
          id: id(),
          student: null,
          status: "open",
          goal: "",
        });
      break;
    }
    case "book": {
      const d = parsed.data as z.infer<typeof schemas.book>;
      {
        if (persona !== "adult" && persona !== "teacher")
          throw new DomainError(
            "Cette réservation est réservée aux adultes.",
            403,
          );
        const slot = find(c.slots, d.id),
          s = find(
            c.students,
            persona === "teacher" ? d.student || "" : studentFor(persona)!,
          );
        if (slot.status !== "open" || slot.student)
          throw new DomainError("Ce créneau est déjà réservé.", 409);
        if (s.track !== "devops" || !s.active || s.credits < 1)
          throw new DomainError("Aucun crédit disponible pour cet élève.");
        if (Date.parse(slot.start) < Date.now())
          throw new DomainError("Ce créneau est passé.");
        slot.student = s.id;
        slot.status = "booked";
        slot.goal = d.goal;
        s.credits--;
        break;
      }
    }
    case "cancel": {
      const d = parsed.data as z.infer<typeof schemas.cancel>;
      {
        const slot = find(c.slots, d.id);
        if (persona !== "teacher" && slot.student !== studentFor(persona))
          throw new DomainError("Réservation inaccessible.", 403);
        if (slot.status !== "booked")
          throw new DomainError("Cette réservation ne peut plus être annulée.");
        if (Date.parse(slot.start) < Date.now())
          throw new DomainError(
            "La séance a commencé. Contactez le formateur.",
          );
        find(c.students, slot.student!).credits++;
        slot.student = null;
        slot.status = "open";
        slot.goal = "";
        break;
      }
    }
    case "complete": {
      const d = parsed.data as z.infer<typeof schemas.complete>;

      teacher();
      {
        const slot = find(c.slots, d.id);
        if (slot.status !== "booked")
          throw new DomainError("Séance non réservée.");
        slot.status = "completed";
        break;
      }
    }
    case "stage": {
      const d = parsed.data as z.infer<typeof schemas.stage>;

      teacher();
      {
        const s = find(c.students, d.student);
        if (s.track !== "devops")
          throw new DomainError("Les stages concernent le parcours adulte.");
        if (!d.id && c.stages.some((x) => x.student === d.student))
          throw new DomainError("Un dossier existe déjà pour cet élève.");
        if (
          ["accepted", "active", "completed"].includes(d.status) &&
          (!d.mentor || !d.start || !d.end)
        )
          throw new DomainError("Tuteur et dates requis pour une affectation.");
        if (
          d.start &&
          (!Number.isFinite(Date.parse(d.start)) ||
            !d.end ||
            Date.parse(d.end) < Date.parse(d.start))
        )
          throw new DomainError("Dates du stage invalides.");
        upsert(c.stages, {
          ...d,
          activities: d.id ? find(c.stages, d.id).activities : [],
        });
        break;
      }
    }
    case "activity": {
      const d = parsed.data as z.infer<typeof schemas.activity>;
      {
        const s = find(c.stages, d.id);
        if (persona !== "teacher" && s.student !== studentFor(persona))
          throw new DomainError("Dossier inaccessible.", 403);
        s.activities.unshift({ id: id(), date: now, text: d.text });
        break;
      }
    }
    case "payment": {
      const d = parsed.data as z.infer<typeof schemas.payment>;

      teacher();
      find(c.students, d.student);
      if (
        c.payments.some(
          (p) => p.reference.toLowerCase() === d.reference.toLowerCase(),
        )
      )
        throw new DomainError("Cette référence est déjà enregistrée.");
      c.payments.unshift({ ...d, id: id() });
      break;
    }
    case "paymentStatus": {
      const d = parsed.data as z.infer<typeof schemas.paymentStatus>;

      teacher();
      {
        const p = find(c.payments, d.id);
        if (d.status === "refunded" && p.status !== "verified")
          throw new DomainError(
            "Seul un paiement vérifié peut être remboursé.",
          );
        if (d.status === "verified" && p.status !== "pending")
          throw new DomainError("Ce paiement a déjà été traité.");
        p.status = d.status;
        break;
      }
    }
    case "help": {
      const d = parsed.data as z.infer<typeof schemas.help>;
      {
        const s = student();
        c.help.unshift({
          id: id(),
          student: s.id,
          question: d.question,
          answer: "",
          created: now,
        });
        break;
      }
    }
    case "answer": {
      const d = parsed.data as z.infer<typeof schemas.answer>;

      teacher();
      find(c.help, d.id).answer = d.answer;
      break;
    }
    case "reset": {
      teacher();
      c = seedCampus();
      break;
    }
  }
  c.audit.unshift({ id: id(), date: now, action: name, actor: persona });
  c.audit = c.audit.slice(0, 200);
  if (JSON.stringify(c).length > 1500000)
    throw new DomainError(
      "Limite de la version d’essai atteinte. Exportez les données.",
    );
  return c;
}
