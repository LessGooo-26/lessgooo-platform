import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DomainError, studentFor } from "../src/campus/lib/domain";
import type { Persona } from "../src/campus/lib/model";
import {
  catalogSchema,
  profileSchema,
  scoreQuiz,
  type CatalogSnapshot,
  type Attempt,
  type SchoolProgress,
} from "../src/school/model";
import { initialCatalog } from "../src/school/catalog";
import { publicSnapshot } from "../src/school/public-snapshot";
import type { CampusStore } from "./store";

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new DomainError("SCHOOL_INVALID");
  return result.data;
}
const writable = (p: Persona) => {
  if (p === "parent") throw new DomainError("SCHOOL_READ_ONLY", 403);
};
const owner = (p: Persona) => studentFor(p) || "teacher";
export class SchoolStore {
  private sessions = new Map<
    string,
    { owner: string; classId: string; seen: number }
  >();
  constructor(
    private campus: CampusStore,
    private now = () => Date.now(),
  ) {
    campus.db
      .exec(`CREATE TABLE IF NOT EXISTS school_catalog(id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL, version INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS school_profiles(owner TEXT PRIMARY KEY, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS school_attempts(id TEXT PRIMARY KEY, owner TEXT NOT NULL, data TEXT NOT NULL, created TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS school_attempt_owner ON school_attempts(owner, created);`);
    campus.db
      .prepare("INSERT OR IGNORE INTO school_catalog VALUES(1,?,1)")
      .run(JSON.stringify(catalogSchema.parse(initialCatalog)));
  }
  read(): CatalogSnapshot {
    const row = this.campus.db
      .prepare("SELECT data,version FROM school_catalog WHERE id=1")
      .get() as { data: string; version: number };
    return {
      catalog: catalogSchema.parse(JSON.parse(row.data)),
      version: row.version,
    };
  }
  catalog(teacher = false, publicSite = false): CatalogSnapshot {
    const result = this.read();
    if (teacher) return result;
    if (publicSite)
      return { ...result, catalog: publicSnapshot(result.catalog) };
    const c = result.catalog;
    c.classes = c.classes.filter((v) => v.active);
    c.subjects = c.subjects.filter((v) => v.active);
    c.tutoringSubjectIds = c.tutoringSubjectIds.filter((id) =>
      c.subjects.some((s) => s.id === id),
    );
    const classes = new Set(c.classes.map((v) => v.id)),
      subjects = new Set(c.subjects.map((v) => v.id));
    c.chapters = c.chapters.filter(
      (v) =>
        v.published &&
        subjects.has(v.subjectId) &&
        v.classIds.some((id) => classes.has(id)),
    );
    c.resources = c.resources.filter(
      (v) =>
        v.published &&
        (!v.subjectId || subjects.has(v.subjectId)) &&
        (!v.classIds.length || v.classIds.some((id) => classes.has(id))) &&
        (!publicSite || !v.mediaId),
    );
    c.timetable = c.timetable.filter(
      (v) =>
        v.status !== "cancelled" &&
        classes.has(v.classId) &&
        subjects.has(v.subjectId),
    );
    return result;
  }
  save(p: Persona, input: unknown) {
    if (p !== "teacher") throw new DomainError("SCHOOL_FORBIDDEN", 403);
    const d = parse(
      z
        .object({
          version: z.number().int().positive(),
          catalog: catalogSchema,
        })
        .strict(),
      input,
    );
    for (const resource of d.catalog.resources)
      if (resource.mediaId) {
        const m = this.campus.db
          .prepare(
            "SELECT id FROM media WHERE id=? AND complete=1 AND shared=1 AND owner='teacher'",
          )
          .get(resource.mediaId);
        if (!m) throw new DomainError("SCHOOL_MEDIA");
      }
    const result = this.campus.db
      .prepare(
        "UPDATE school_catalog SET data=?,version=version+1 WHERE id=1 AND version=?",
      )
      .run(JSON.stringify(d.catalog), d.version);
    if (Number(result.changes) !== 1)
      throw new DomainError("SCHOOL_CONFLICT", 409);
    return this.read();
  }
  progress(p: Persona): SchoolProgress {
    const row = this.campus.db
      .prepare("SELECT data FROM school_profiles WHERE owner=?")
      .get(owner(p)) as { data: string } | undefined;
    const rows = this.campus.db
      .prepare(
        "SELECT data FROM school_attempts WHERE owner=? ORDER BY created DESC, rowid DESC LIMIT 200",
      )
      .all(owner(p)) as { data: string }[];
    return {
      profile: row ? JSON.parse(row.data) : null,
      attempts: rows.map((v) => JSON.parse(v.data)),
    };
  }
  profile(p: Persona, input: unknown) {
    writable(p);
    const d = parse(profileSchema, input),
      c = this.catalog().catalog;
    if (
      !c.classes.some((v) => v.id === d.classId) ||
      d.grades.some((g) => !c.subjects.some((s) => s.id === g.subjectId))
    )
      throw new DomainError("SCHOOL_INVALID");
    this.campus.db
      .prepare(
        "INSERT INTO school_profiles VALUES(?,?) ON CONFLICT(owner) DO UPDATE SET data=excluded.data",
      )
      .run(owner(p), JSON.stringify(d));
    return this.progress(p);
  }
  attempt(p: Persona, input: unknown) {
    writable(p);
    const d = parse(
      z
        .object({
          version: z.number().int().positive(),
          chapterId: z.string().max(90),
          answers: z.record(z.number().int().min(0).max(5)),
        })
        .strict(),
      input,
    );
    if (d.version !== this.read().version)
      throw new DomainError("SCHOOL_LESSON_CHANGED", 409);
    const chapter = this.catalog().catalog.chapters.find(
      (v) => v.id === d.chapterId,
    );
    if (!chapter) throw new DomainError("SCHOOL_NOT_FOUND", 404);
    let result: ReturnType<typeof scoreQuiz>;
    try {
      result = scoreQuiz(chapter, d.answers);
    } catch {
      throw new DomainError("SCHOOL_ANSWERS");
    }
    const attempt: Attempt = {
      id: randomUUID(),
      owner: owner(p),
      chapterId: chapter.id,
      title: chapter.title,
      ...result,
      created: new Date(this.now()).toISOString(),
    };
    this.campus.db
      .prepare("INSERT INTO school_attempts VALUES(?,?,?,?)")
      .run(attempt.id, attempt.owner, JSON.stringify(attempt), attempt.created);
    return { attempt, progress: this.progress(p) };
  }
  presence(p: Persona, input?: unknown) {
    const time = this.now();
    for (const [key, s] of this.sessions)
      if (time - s.seen > 90000) this.sessions.delete(key);
    if (input !== undefined) {
      if (p === "parent") throw new DomainError("SCHOOL_READ_ONLY", 403);
      const d = parse(
        z
          .object({
            token: z.string().uuid(),
            classId: z.string().max(90),
            active: z.boolean(),
          })
          .strict(),
        input,
      );
      const previous = this.sessions.get(d.token);
      if (previous && previous.owner !== owner(p))
        throw new DomainError("SCHOOL_FORBIDDEN", 403);
      if (d.active) {
        if (!this.catalog().catalog.classes.some((c) => c.id === d.classId))
          throw new DomainError("SCHOOL_INVALID");
        if (!previous && this.sessions.size >= 250)
          throw new DomainError("SCHOOL_BUSY", 429);
        this.sessions.set(d.token, {
          owner: owner(p),
          classId: d.classId,
          seen: time,
        });
      } else this.sessions.delete(d.token);
    }
    const active = [...this.sessions.values()];
    const online = new Set(active.map((s) => s.owner));
    const roster =
      p === "teacher"
        ? this.campus.read().state.students.map((s) => ({
            id: s.id,
            name: s.name,
            online: online.has(s.id),
            classIds: [
              ...new Set(
                active.filter((v) => v.owner === s.id).map((v) => v.classId),
              ),
            ],
          }))
        : [];
    return { count: online.size, self: online.has(owner(p)), roster };
  }
  report(p: Persona) {
    if (p !== "teacher") throw new DomainError("SCHOOL_FORBIDDEN", 403);
    return this.campus.read().state.students.map((s) => {
      const rows = this.campus.db
        .prepare(
          "SELECT data FROM school_attempts WHERE owner=? ORDER BY created DESC, rowid DESC LIMIT 20",
        )
        .all(s.id) as { data: string }[];
      return {
        id: s.id,
        name: s.name,
        attempts: rows.map((v) => JSON.parse(v.data) as Attempt),
      };
    });
  }
}
