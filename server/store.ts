import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  DomainError,
  applyAction,
  filterCampus,
} from "../src/campus/lib/domain";
import { seedCampus } from "../src/campus/lib/seed";
import type { Campus, Persona, Snapshot } from "../src/campus/lib/model";
import { curriculum } from "../src/campus/lib/curriculum";

// This database holds a single local demonstration, never authenticated school records.
export class CampusStore {
  readonly db: DatabaseSync;
  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS campus (id INTEGER PRIMARY KEY CHECK(id=1), state TEXT NOT NULL, version INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, bytes BLOB NOT NULL);`);
    this.db
      .prepare("INSERT OR IGNORE INTO campus VALUES (1, ?, 1)")
      .run(JSON.stringify(seedCampus()));
    const current = this.read();
    // Normalize identifiers from the first local draft, retaining every submission.
    let normalized = false;
    const oldDemoNames: Record<string, string> = {
      alex: "Alex Martin",
      samira: "Samira Diallo",
      lucas: "Lucas Bernard",
      maya: "Maya Martin",
      noah: "Noah Wilson",
      ines: "Inès Mboa",
    };
    const oldParents = ["Camille Martin", "Jordan Wilson", "Ariane Mboa"];
    for (const student of current.state.students) {
      const replacement = seedCampus().students.find(
        (s) => s.id === student.id,
      );
      if (replacement && student.name === oldDemoNames[student.id]) {
        student.name = replacement.name;
        normalized = true;
      }
      if (replacement && oldParents.includes(student.parent)) {
        student.parent = replacement.parent;
        normalized = true;
      }
    }
    for (const old of [...current.state.lessons]) {
      if (!old.id.startsWith("kids-kids-")) continue;
      const id = old.id.replace("kids-kids-", "kids-");
      if (!curriculum.some((l) => l.id === id)) continue;
      const canonical = current.state.lessons.find((l) => l.id === id);
      if (
        canonical &&
        (
          [
            "title",
            "track",
            "module",
            "minutes",
            "level",
            "explanation",
            "task",
            "criteria",
            "resource",
          ] as const
        ).some((key) => canonical[key] !== old[key])
      )
        continue;
      for (const sub of current.state.submissions)
        if (sub.lesson === old.id) sub.lesson = id;
      if (canonical)
        current.state.lessons = current.state.lessons.filter(
          (l) => l.id !== old.id,
        );
      else old.id = id;
      normalized = true;
    }
    const missing = curriculum.filter(
      (l) => !current.state.lessons.some((existing) => existing.id === l.id),
    );
    if (missing.length || normalized) {
      current.state.lessons.push(...missing);
      current.state.lessons.sort((a, b) =>
        a.module.localeCompare(b.module, "fr"),
      );
      this.save(current.state, current.version);
    }
  }
  read() {
    const row = this.db
      .prepare("SELECT state, version FROM campus WHERE id=1")
      .get()!;
    const state = JSON.parse(String(row.state)) as Campus;
    state.lessons.sort((a, b) => a.module.localeCompare(b.module, "fr"));
    return {
      state,
      version: Number(row.version),
    };
  }
  snapshot(persona: Persona): Snapshot {
    const { state, version } = this.read();
    return {
      state: filterCampus(state, persona),
      version,
      persona,
      demo: true,
    };
  }
  save(state: Campus, version: number) {
    const result = this.db
      .prepare(
        "UPDATE campus SET state=?, version=version+1 WHERE id=1 AND version=?",
      )
      .run(JSON.stringify(state), version);
    if (!result.changes)
      throw new DomainError(
        "Les données ont changé. Actualisez puis réessayez.",
        409,
      );
  }
  mutate(persona: Persona, version: number, action: string, data: unknown) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const current = this.read();
      if (version !== current.version)
        throw new DomainError(
          "Les données ont changé. Actualisez puis réessayez.",
          409,
        );
      this.save(applyAction(current.state, persona, action, data), version);
      if (action === "reset") this.db.exec("DELETE FROM files");
      this.db.exec("COMMIT");
      return this.snapshot(persona);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  attach(
    persona: Persona,
    submissionId: string,
    filename: string,
    bytes: Uint8Array,
    version: number,
  ) {
    if (persona !== "adult" && persona !== "child")
      throw new DomainError("Joignez le fichier depuis la vue élève.", 403);
    if (!bytes.length || bytes.length > 5 * 1024 * 1024)
      throw new DomainError("Fichier vide ou supérieur à 5 Mo.", 413);
    // Arbitrary formats are opaque downloads, never executed or served inline.
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const current = this.read();
      if (version !== current.version)
        throw new DomainError(
          "Les données ont changé. Actualisez puis réessayez.",
          409,
        );
      const visible = filterCampus(current.state, persona).submissions.find(
        (s) => s.id === submissionId,
      );
      if (!visible || visible.status !== "pending")
        throw new DomainError("Travail inaccessible ou déjà corrigé.", 403);
      const sub = current.state.submissions.find((s) => s.id === submissionId)!;
      const id = crypto.randomUUID();
      this.db.prepare("INSERT INTO files VALUES (?, ?)").run(id, bytes);
      if (sub.file)
        this.db.prepare("DELETE FROM files WHERE id=?").run(sub.file.id);
      sub.file = {
        id,
        name: filename.replace(/[^\p{L}\p{N}. _-]/gu, "_").slice(0, 120),
      };
      this.save(current.state, current.version);
      this.db.exec("COMMIT");
      return this.snapshot(persona);
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  file(persona: Persona, id: string) {
    const submission = this.snapshot(persona).state.submissions.find(
      (s) => s.file?.id === id,
    );
    const row =
      submission &&
      this.db.prepare("SELECT bytes FROM files WHERE id=?").get(id);
    if (!row || !submission?.file)
      throw new DomainError("Fichier introuvable.", 404);
    return { name: submission.file.name, bytes: row.bytes as Uint8Array };
  }
  close() {
    this.db.close();
  }
}
