import { z } from "zod";

export type ImportJob = {
  id: string;
  owner: string;
  persona: "teacher" | "adult" | "parent" | "child";
  name: string;
  url: string;
  status: "queued" | "running" | "done" | "error" | "cancelled";
  received: number;
  total: number;
  media: string;
  error: string;
  created: string;
};
export type Transcript = {
  id: string;
  owner: string;
  status: "queued" | "running" | "done" | "error";
  language: string;
  error: string;
  segments: { start: number; end: number; text: string }[];
};
export const services = [
  {
    id: "training",
    en: "DevOps & cloud training",
    fr: "Formation DevOps & cloud",
    detailEn: "Learn with practical lessons and projects.",
    detailFr: "Apprendre avec des cours et projets pratiques.",
    color: "blue",
  },
  {
    id: "interview",
    en: "Interview preparation",
    fr: "Préparation aux entretiens",
    detailEn: "Practice answers and present your projects.",
    detailFr: "Préparer vos réponses et présenter vos projets.",
    color: "orange",
  },
  {
    id: "applications",
    en: "Job application support",
    fr: "Aide aux candidatures",
    detailEn: "Work on your CV and application plan.",
    detailFr: "Préparer votre CV et votre plan de candidature.",
    color: "green",
  },
  {
    id: "kids",
    en: "Technology for children",
    fr: "Technologie pour les enfants",
    detailEn: "From computer parts to cloud discovery.",
    detailFr: "Des composants de l’ordinateur à la découverte du cloud.",
    color: "yellow",
  },
  {
    id: "workshop",
    en: "A workshop for your team",
    fr: "Un atelier pour votre équipe",
    detailEn: "Tell us what your team wants to learn.",
    detailFr: "Dites-nous ce que votre équipe veut apprendre.",
    color: "red",
  },
  {
    id: "consultation",
    en: "Private consultation",
    fr: "Consultation privée",
    detailEn: "Request a paid conversation about your needs.",
    detailFr: "Demander un échange payant sur vos besoins.",
    color: "navy",
  },
] as const;
export const serviceRequestSchema = z.object({
  service: z.enum([
    "training",
    "interview",
    "applications",
    "kids",
    "workshop",
    "consultation",
  ]),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).default(""),
  message: z.string().trim().min(10).max(4000),
  language: z.enum(["en", "fr"]),
  consent: z.literal(true),
});
export type ServiceRequest = z.infer<typeof serviceRequestSchema> & {
  id: string;
  owner: string;
  created: string;
  status: "new" | "contacted" | "closed";
  notes: string;
};
export function transcriptText(t: Transcript) {
  return t.segments.map((s) => s.text).join("\n");
}
export function transcriptVtt(t: Transcript) {
  const stamp = (n: number) =>
    new Date(Math.round(n * 1000)).toISOString().slice(11, 23);
  return (
    "WEBVTT\n\n" +
    t.segments
      .map(
        (s, i) =>
          `${i + 1}\n${stamp(s.start)} --> ${stamp(s.end)}\n${s.text.replace(/[<>]/g, "")}\n`,
      )
      .join("\n")
  );
}

export const transcriptUrl = (
  id: string,
  p: import("./model").Persona,
  format: string,
  download = false,
) =>
  `/api/transcript?id=${encodeURIComponent(id)}&persona=${p}&format=${format}${download ? "&download=1" : ""}`;
