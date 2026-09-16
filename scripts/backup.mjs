import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
const source = resolve(
  process.env.CAMPUS_DATA_DIR || ".local-data",
  "campus.sqlite",
);
if (!existsSync(source))
  throw new Error("Démarrez le campus avant de créer une sauvegarde.");
mkdirSync("backups", { recursive: true });
const destination = resolve(
  "backups",
  `campus-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`,
);
const db = new DatabaseSync(source, { readOnly: true });
try {
  await backup(db, destination);
  console.info(`Sauvegarde complète (données et fichiers) : ${destination}`);
} finally {
  db.close();
}
