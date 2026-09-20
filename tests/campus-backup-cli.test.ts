// @vitest-environment node
import { expect, test } from "vitest";
import { DatabaseSync } from "node:sqlite";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

test("backup CLI restores database and key from a configured writable directory", () => {
  const dir = mkdtempSync(join(tmpdir(), "campus-backup-cli-"));
  const data = join(dir, "data");
  const output = join(dir, "writable", "backups");
  mkdirSync(data);
  const db = new DatabaseSync(join(data, "campus.sqlite"));
  try {
    db.exec(
      "PRAGMA journal_mode=WAL; CREATE TABLE evidence (value TEXT); INSERT INTO evidence VALUES ('fictional restore proof');",
    );
    writeFileSync(join(data, "integration-key"), "synthetic-test-key");
    const run = spawnSync(process.execPath, [resolve("scripts/backup.mjs")], {
      cwd: dir,
      env: { ...process.env, CAMPUS_DATA_DIR: data, CAMPUS_BACKUP_DIR: output },
      encoding: "utf8",
    });
    expect(run.status, run.stderr).toBe(0);
    const backupFile = readdirSync(output).find((name) =>
      name.endsWith(".sqlite"),
    );
    expect(backupFile).toBeTruthy();
    const restored = new DatabaseSync(join(output, backupFile!));
    try {
      expect(restored.prepare("SELECT value FROM evidence").get()?.value).toBe(
        "fictional restore proof",
      );
    } finally {
      restored.close();
    }
    expect(readFileSync(join(output, backupFile! + ".key"), "utf8")).toBe(
      "synthetic-test-key",
    );
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
