import type { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { DomainError, safeUrl, studentFor } from "../src/campus/lib/domain";
import type { Persona } from "../src/campus/lib/model";
import { personas } from "../src/campus/lib/model";
import { previewType } from "./media-stream";
import {
  applicationSchema,
  careerSchema,
  noteSchema,
  gallerySchema,
  profileSchema,
  type Gallery,
  type Profile,
  type CareerInterest,
  type JobApplication,
  type Media,
  type Note,
  type SyncJob,
} from "../src/campus/lib/workspace";
import type { CampusStore } from "./store";

export const maxUploadBytes = 200 * 1024 * 1024;
export const chunkBytes = 4 * 1024 * 1024;
const parse = <T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): z.output<T> => {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new DomainError(
      result.error.issues[0]?.message || "Valeur invalide.",
    );
  return result.data;
};
export class WorkspaceStore {
  db: DatabaseSync;
  constructor(readonly campus: CampusStore) {
    this.db = campus.db;
    this.db
      .exec(`CREATE TABLE IF NOT EXISTS workspace_items(id TEXT PRIMARY KEY, kind TEXT NOT NULL, owner TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, size INTEGER NOT NULL, received INTEGER NOT NULL DEFAULT 0, complete INTEGER NOT NULL DEFAULT 0, created TEXT NOT NULL, submission TEXT NOT NULL, shared INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS media_chunks(media TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE, offset INTEGER NOT NULL, bytes BLOB NOT NULL, PRIMARY KEY(media,offset));
      CREATE TABLE IF NOT EXISTS sync_jobs(id TEXT PRIMARY KEY, label TEXT NOT NULL, status TEXT NOT NULL, error TEXT NOT NULL, url TEXT NOT NULL, updated TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS integration_config(id TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS checkout(reference TEXT PRIMARY KEY, amount INTEGER NOT NULL, currency TEXT NOT NULL, email TEXT NOT NULL, provider TEXT NOT NULL, status TEXT NOT NULL, url TEXT NOT NULL, description TEXT NOT NULL);`);
    const columns = this.db
      .prepare("PRAGMA table_info(media)")
      .all()
      .map((c) => c.name);
    if (!columns.includes("gallery"))
      this.db.exec(
        "ALTER TABLE media ADD COLUMN gallery TEXT NOT NULL DEFAULT ''",
      );
    if (!columns.includes("preview")) {
      this.db.exec(
        "ALTER TABLE media ADD COLUMN preview TEXT NOT NULL DEFAULT ''",
      );
      for (const file of this.db
        .prepare("SELECT id FROM media WHERE complete=1")
        .all()) {
        const first = this.db
          .prepare("SELECT bytes FROM media_chunks WHERE media=? AND offset=0")
          .get(file.id);
        if (first)
          this.db
            .prepare("UPDATE media SET preview=? WHERE id=?")
            .run(previewType(first.bytes as Uint8Array), file.id);
      }
    }
    // Abandoned partial uploads expire; completed files are never removed here.
    const teacherProfile = this.items<Profile>("profile", "teacher")[0];
    if (teacherProfile?.name === "Eddy")
      this.put("profile", "teacher", { ...teacherProfile, name: "Carles" });
    this.db
      .prepare("DELETE FROM media WHERE complete=0 AND created < ?")
      .run(new Date(Date.now() - 86400000).toISOString());
  }
  owner(p: Persona) {
    return p === "teacher"
      ? "teacher"
      : p === "parent"
        ? "parent"
        : studentFor(p)!;
  }
  items<T>(kind: string, owner?: string): T[] {
    const rows =
      owner === undefined
        ? this.db
            .prepare("SELECT data FROM workspace_items WHERE kind=?")
            .all(kind)
        : this.db
            .prepare(
              "SELECT data FROM workspace_items WHERE kind=? AND owner=?",
            )
            .all(kind, owner);
    return rows.map((r) => JSON.parse(String(r.data)) as T);
  }
  put<T extends { id: string }>(kind: string, owner: string, value: T) {
    this.db
      .prepare(
        "INSERT INTO workspace_items VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
      )
      .run(value.id, kind, owner, JSON.stringify(value));
  }
  snapshot(p: Persona) {
    const owner = this.owner(p);
    return {
      notes: this.items<Note>("note", owner),
      interests:
        p === "teacher"
          ? this.items<CareerInterest>("career")
          : p === "adult"
            ? this.items<CareerInterest>("career", owner)
            : [],
      applications:
        p === "adult" || p === "teacher"
          ? this.items<JobApplication>("application", owner)
          : [],
      media: this.mediaList(p),
      galleries: this.galleries(p),
      profile: this.items<Profile>("profile", owner)[0] || {
        id: `profile:${owner}`,
        owner,
        name: personas.find((x) => x.value === p)!.name,
        email: "",
        phone: "",
        bio: "",
        avatar: "",
      },
      maxUploadBytes,
    };
  }
  action(p: Persona, action: string, input: unknown) {
    const owner = this.owner(p);
    if (action === "profile") {
      const d = parse(profileSchema, input);
      if (d.avatar) {
        const file = this.media(p, d.avatar);
        if (
          file.owner !== owner ||
          !file.preview.startsWith("image/") ||
          file.size > 8 * 1024 * 1024
        )
          throw new DomainError(
            "Choose your own JPG, PNG, GIF or WebP photo, up to 8 MB.",
          );
      }
      this.put("profile", owner, { ...d, id: `profile:${owner}`, owner });
    } else if (action === "gallery") {
      const d = parse(gallerySchema, input);
      if (
        d.id &&
        !this.items<Gallery>("gallery", owner).some((g) => g.id === d.id)
      )
        throw new DomainError("Gallery not found.", 404);
      const gallery = {
        ...d,
        id: d.id || crypto.randomUUID(),
        owner,
        shared: p === "teacher" && d.shared,
      };
      this.db.exec("BEGIN IMMEDIATE");
      try {
        this.put("gallery", owner, gallery);
        this.db
          .prepare("UPDATE media SET shared=? WHERE gallery=? AND owner=?")
          .run(gallery.shared ? 1 : 0, gallery.id, owner);
        this.db.exec("COMMIT");
      } catch (e) {
        this.db.exec("ROLLBACK");
        throw e;
      }
    } else if (action === "mediaGallery") {
      const d = parse(
        z.object({ id: z.string(), gallery: z.string().max(100) }),
        input,
      );
      const file = this.media(p, d.id, true);
      if (
        !file.complete ||
        !file.preview.startsWith("image/") ||
        file.submission
      )
        throw new DomainError(
          "Only completed photos can be moved to a gallery.",
        );
      const gallery = d.gallery ? this.ownGallery(p, d.gallery) : undefined;
      this.db
        .prepare("UPDATE media SET gallery=?,shared=? WHERE id=?")
        .run(d.gallery, gallery?.shared ? 1 : 0, d.id);
    } else if (action === "note") {
      const d = parse(noteSchema, input);
      const old = d.id
        ? this.items<Note>("note", owner).find((n) => n.id === d.id)
        : undefined;
      if (d.id && !old) throw new DomainError("Note introuvable.", 404);
      if (old && old.revision !== d.revision)
        throw new DomainError(
          "Cette note a changé. Rechargez avant de modifier.",
          409,
        );
      this.put("note", owner, {
        ...d,
        id: old?.id || crypto.randomUUID(),
        owner,
        revision: (old?.revision || 0) + 1,
        updated: new Date().toISOString(),
      });
    } else if (action === "career") {
      if (!["teacher", "adult"].includes(p))
        throw new DomainError("Espace carrière réservé aux adultes.", 403);
      const d = parse(careerSchema, input);
      if (
        this.items<CareerInterest>("career", owner).some(
          (i) =>
            i.email.toLowerCase() === d.email.toLowerCase() &&
            i.status !== "closed",
        )
      )
        throw new DomainError("Une demande existe déjà pour cet email.");
      this.put("career", owner, {
        ...d,
        id: crypto.randomUUID(),
        owner,
        created: new Date().toISOString(),
        status: "new",
      });
    } else if (action === "careerStatus") {
      if (p !== "teacher") throw new DomainError("Vue formateur requise.", 403);
      const d = parse(
        z.object({
          id: z.string(),
          status: z.enum(["new", "contacted", "closed"]),
        }),
        input,
      );
      const old = this.items<CareerInterest>("career").find(
        (i) => i.id === d.id,
      );
      if (!old) throw new DomainError("Demande introuvable.", 404);
      this.put("career", old.owner, { ...old, status: d.status });
    } else if (action === "application") {
      if (!["teacher", "adult"].includes(p))
        throw new DomainError("Espace carrière réservé aux adultes.", 403);
      const d = parse(applicationSchema, input);
      if (
        d.id &&
        !this.items<JobApplication>("application", owner).some(
          (i) => i.id === d.id,
        )
      )
        throw new DomainError("Candidature introuvable.", 404);
      this.put("application", owner, {
        ...d,
        url: safeUrl(d.url),
        id: d.id || crypto.randomUUID(),
        owner,
      });
    } else throw new DomainError("Action inconnue.");
    return this.snapshot(p);
  }
  mediaList(p: Persona): Media[] {
    const owner = this.owner(p);
    return this.db
      .prepare(
        "SELECT * FROM media WHERE complete=1 AND (owner=? OR owner=? OR shared=1 OR ?=1) ORDER BY created DESC",
      )
      .all(
        owner,
        p === "parent" ? "maya" : owner,
        p === "teacher" ? 1 : 0,
      ) as unknown as Media[];
  }
  galleries(p: Persona) {
    return this.items<Gallery>("gallery").filter(
      (g) =>
        g.owner === this.owner(p) ||
        g.shared ||
        p === "teacher" ||
        (p === "parent" && g.owner === "maya"),
    );
  }
  ownGallery(p: Persona, id: string) {
    const g = this.items<Gallery>("gallery", this.owner(p)).find(
      (g) => g.id === id,
    );
    if (!g) throw new DomainError("Gallery not found.", 404);
    return g;
  }
  media(p: Persona, id: string, writing = false): Media {
    const m = this.db
      .prepare("SELECT * FROM media WHERE id=?")
      .get(id) as unknown as Media | undefined;
    const owner = this.owner(p);
    if (
      !m ||
      (writing
        ? m.owner !== owner
        : !m.complete ||
          (m.owner !== owner &&
            !(p === "parent" && m.owner === "maya") &&
            !m.shared &&
            p !== "teacher"))
    )
      throw new DomainError("Fichier inaccessible.", 404);
    return m;
  }
  start(p: Persona, input: unknown) {
    const d = parse(
      z.object({
        name: z.string().trim().min(1).max(255),
        type: z.string().max(100),
        size: z.number().int().min(1).max(maxUploadBytes),
        submission: z.string().max(100).default(""),
        shared: z.boolean().default(false),
        gallery: z.string().max(100).default(""),
      }),
      input,
    );
    if (d.submission) this.checkSubmission(p, d.submission);
    const gallery = d.gallery ? this.ownGallery(p, d.gallery) : undefined;
    if (gallery && d.submission)
      throw new DomainError("Homework files cannot be added to galleries.");
    const count = Number(
      this.db
        .prepare("SELECT count(*) AS n FROM media WHERE owner=? AND complete=0")
        .get(this.owner(p))!.n,
    );
    if (count >= 10)
      throw new DomainError(
        "Trop de transferts incomplets. Réessayez après leur expiration.",
        429,
      );
    const id = crypto.randomUUID();
    this.db
      .prepare(
        "INSERT INTO media(id,owner,name,type,size,created,submission,shared,gallery) VALUES(?,?,?,?,?,?,?,?,?)",
      )
      .run(
        id,
        this.owner(p),
        Array.from(d.name)
          .map((c) =>
            c.charCodeAt(0) < 32 || c === "/" || c === "\\" ? "_" : c,
          )
          .join(""),
        d.type,
        d.size,
        new Date().toISOString(),
        d.submission,
        gallery ? Number(gallery.shared) : p === "teacher" && d.shared ? 1 : 0,
        d.gallery,
      );
    return { id, chunkBytes };
  }
  checkSubmission(p: Persona, id: string) {
    if (!["adult", "child"].includes(p))
      throw new DomainError("Vue élève requise.", 403);
    const sub = this.campus
      .snapshot(p)
      .state.submissions.find((s) => s.id === id);
    if (!sub || sub.status !== "pending")
      throw new DomainError("Travail inaccessible ou déjà corrigé.", 403);
    return sub;
  }
  chunk(p: Persona, id: string, offset: number, bytes: Uint8Array) {
    const m = this.media(p, id, true);
    if (m.complete || offset !== m.received || !Number.isInteger(offset))
      throw new DomainError("Position de transfert invalide.", 409);
    if (
      !bytes.length ||
      bytes.length > chunkBytes ||
      m.received + bytes.length > m.size
    )
      throw new DomainError("Bloc de fichier invalide.", 413);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db
        .prepare("INSERT INTO media_chunks VALUES(?,?,?)")
        .run(id, offset, bytes);
      this.db
        .prepare("UPDATE media SET received=received+? WHERE id=?")
        .run(bytes.length, id);
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
    return { received: m.received + bytes.length };
  }
  finish(p: Persona, id: string) {
    const m = this.media(p, id, true);
    if (m.complete) return m;
    if (m.received !== m.size)
      throw new DomainError("Transfert incomplet.", 409);
    const first = this.db
      .prepare("SELECT bytes FROM media_chunks WHERE media=? AND offset=0")
      .get(id);
    const preview = first ? previewType(first.bytes as Uint8Array) : "";
    if (m.gallery && !preview.startsWith("image/"))
      throw new DomainError("Galleries accept JPG, PNG, GIF and WebP photos.");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      if (m.submission) {
        this.checkSubmission(p, m.submission);
        const current = this.campus.read();
        current.state.submissions.find((s) => s.id === m.submission)!.file = {
          id: m.id,
          name: m.name,
        };
        this.campus.save(current.state, current.version);
      }
      this.db
        .prepare("UPDATE media SET complete=1,preview=?,shared=? WHERE id=?")
        .run(
          preview,
          m.gallery ? Number(this.ownGallery(p, m.gallery).shared) : m.shared,
          id,
        );
      if (m.submission) this.queue(m.submission, `Devoir · ${m.name}`);
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
    return { ...m, preview, complete: 1 };
  }
  *byteRange(id: string, start: number, end: number) {
    const rows = this.db
      .prepare(
        "SELECT offset,bytes FROM media_chunks WHERE media=? AND offset<=? AND offset+length(bytes)>? ORDER BY offset",
      )
      .iterate(id, end, start);
    for (const row of rows) {
      const offset = Number(row.offset),
        bytes = row.bytes as Uint8Array;
      yield bytes.subarray(
        Math.max(0, start - offset),
        Math.min(bytes.length, end - offset + 1),
      );
    }
  }
  cancel(p: Persona, id: string) {
    const file = this.media(p, id, true);
    if (file.complete)
      throw new DomainError("Completed files cannot be cancelled.", 409);
    this.db.prepare("DELETE FROM media WHERE id=?").run(id);
    return { cancelled: true };
  }
  bytes(id: string) {
    return this.db
      .prepare("SELECT bytes FROM media_chunks WHERE media=? ORDER BY offset")
      .iterate(id);
  }
  queue(id: string, label: string) {
    this.db
      .prepare(
        "INSERT INTO sync_jobs VALUES(?,?,'pending','','',?) ON CONFLICT(id) DO UPDATE SET label=excluded.label,status='pending',error='',updated=excluded.updated",
      )
      .run(id, label, new Date().toISOString());
  }
  jobs(): SyncJob[] {
    return this.db
      .prepare("SELECT * FROM sync_jobs ORDER BY updated DESC")
      .all() as unknown as SyncJob[];
  }
  config(key: string): string {
    return String(
      this.db
        .prepare("SELECT value FROM integration_config WHERE id=?")
        .get(key)?.value || "",
    );
  }
  setConfig(key: string, value: string) {
    this.db
      .prepare(
        "INSERT INTO integration_config VALUES(?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value",
      )
      .run(key, value);
  }
}
