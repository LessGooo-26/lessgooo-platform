import type { DatabaseSync } from "node:sqlite";
import { z } from "zod";
import { DomainError, safeUrl, studentFor } from "../src/campus/lib/domain";
import type { Persona } from "../src/campus/lib/model";
import {
  applicationSchema,
  careerSchema,
  noteSchema,
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
    // Abandoned partial uploads expire; completed files are never removed here.
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
      maxUploadBytes,
    };
  }
  action(p: Persona, action: string, input: unknown) {
    const owner = this.owner(p);
    if (action === "note") {
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
    const owner = p === "parent" ? "maya" : this.owner(p);
    return this.db
      .prepare(
        "SELECT * FROM media WHERE complete=1 AND (owner=? OR shared=1 OR ?=1) ORDER BY created DESC",
      )
      .all(owner, p === "teacher" ? 1 : 0) as unknown as Media[];
  }
  media(p: Persona, id: string, writing = false): Media {
    const m = this.db
      .prepare("SELECT * FROM media WHERE id=?")
      .get(id) as unknown as Media | undefined;
    const owner = p === "parent" && !writing ? "maya" : this.owner(p);
    if (
      !m ||
      (writing
        ? m.owner !== owner || p === "parent"
        : !m.complete || (m.owner !== owner && !m.shared && p !== "teacher"))
    )
      throw new DomainError("Fichier inaccessible.", 404);
    return m;
  }
  start(p: Persona, input: unknown) {
    if (p === "parent")
      throw new DomainError(
        "Utilisez la vue élève pour remettre un fichier.",
        403,
      );
    const d = parse(
      z.object({
        name: z.string().trim().min(1).max(255),
        type: z.string().max(100),
        size: z.number().int().min(1).max(maxUploadBytes),
        submission: z.string().max(100).default(""),
        shared: z.boolean().default(false),
      }),
      input,
    );
    if (d.submission) this.checkSubmission(p, d.submission);
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
        "INSERT INTO media(id,owner,name,type,size,created,submission,shared) VALUES(?,?,?,?,?,?,?,?)",
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
        p === "teacher" && d.shared ? 1 : 0,
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
      this.db.prepare("UPDATE media SET complete=1 WHERE id=?").run(id);
      if (m.submission) this.queue(m.submission, `Devoir · ${m.name}`);
      this.db.exec("COMMIT");
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
    return { ...m, complete: 1 };
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
