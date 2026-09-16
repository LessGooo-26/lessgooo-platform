import { DatabaseSync, backup } from "node:sqlite";
import { mkdirSync, existsSync, copyFileSync, chmodSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from 'node:process';
if (existsSync('.env.local')) loadEnvFile('.env.local');
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
  const key = resolve(
    process.env.CAMPUS_DATA_DIR || ".local-data",
    "integration-key",
  );
  if (existsSync(key)) {
    copyFileSync(key, destination + ".key");
    chmodSync(destination + ".key", 0o600);
    console.info(
      "Clé de chiffrement sauvegardée à côté de la base ; conserver les deux fichiers privés.",
    );
  }
  console.info(`Sauvegarde complète (données et fichiers) : ${destination}`);
} finally {
  db.close();
}
