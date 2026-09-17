import { z } from "zod";

export const ownerEmail = "lessgooo.ai26@gmail.com";
export const blockSchema = z.object({
  id: z.string().min(1).max(100),
  type: z.enum(["text", "heading", "todo", "code", "quote", "divider"]),
  text: z.string().max(20000),
  checked: z.boolean().optional(),
});
export const noteSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().trim().min(1).max(160),
  icon: z.enum(["📝", "🚀", "💡", "🎯", "☁️", "🌈"]).default("📝"),
  blocks: z.array(blockSchema).max(150),
  revision: z.number().int().min(0),
});
export type NoteBlock = z.infer<typeof blockSchema>;
export type Note = z.infer<typeof noteSchema> & {
  id: string;
  owner: string;
  updated: string;
};
export const careerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(254),
  service: z.enum(["interview", "applications", "both"]),
  goal: z.string().trim().min(10).max(3000),
  consent: z.literal(true),
});
export type CareerInterest = z.infer<typeof careerSchema> & {
  id: string;
  owner: string;
  created: string;
  status: "new" | "contacted" | "closed";
};
export const applicationSchema = z.object({
  id: z.string().max(100).optional(),
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(150),
  url: z.string().max(2000),
  status: z.enum(["saved", "applied", "interview", "offer", "closed"]),
  nextStep: z.string().max(1500),
  date: z.string().max(30),
});
export type JobApplication = z.infer<typeof applicationSchema> & {
  id: string;
  owner: string;
};
export type Media = {
  id: string;
  owner: string;
  name: string;
  type: string;
  size: number;
  received: number;
  complete: number;
  created: string;
  submission: string;
  shared: number;
  gallery: string;
  preview: string;
};
export const gallerySchema = z.object({
  id: z.string().max(100).optional(),
  name: z.string().trim().min(1).max(100),
  purpose: z.string().trim().max(500),
  color: z.enum(["blue", "green", "yellow", "orange", "red", "navy"]),
  shared: z.boolean().default(false),
});
export type Gallery = z.infer<typeof gallerySchema> & {
  id: string;
  owner: string;
};
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.union([z.literal(""), z.string().email().max(254)]),
  phone: z.string().trim().max(40),
  bio: z.string().trim().max(500),
  avatar: z.string().max(100),
});
export type Profile = z.infer<typeof profileSchema> & {
  id: string;
  owner: string;
};
export type SyncJob = {
  id: string;
  label: string;
  status: "pending" | "synced" | "error";
  error: string;
  url: string;
  updated: string;
};
export type IntegrationStatus = {
  email: string;
  drive: {
    configured: boolean;
    connected: boolean;
    email: string;
    folder: string;
  };
  payment: { configured: boolean; mode: string };
  jobs: SyncJob[];
};
export function noteMarkdown(note: Pick<Note, "title" | "blocks">) {
  return (
    `# ${note.title}\n\n` +
    note.blocks
      .map((b) =>
        b.type === "heading"
          ? `## ${b.text}`
          : b.type === "todo"
            ? `- [${b.checked ? "x" : " "}] ${b.text}`
            : b.type === "code"
              ? `\`\`\`\n${b.text}\n\`\`\``
              : b.type === "quote"
                ? b.text
                    .split("\n")
                    .map((t) => "> " + t)
                    .join("\n")
                : b.type === "divider"
                  ? "---"
                  : b.text,
      )
      .join("\n\n")
  );
}
