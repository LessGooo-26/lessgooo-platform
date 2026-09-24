import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { publicSnapshot } from "../src/school/public-snapshot.ts";

// Usage: node --import tsx scripts/publish-school-catalog.mjs path/to/export.json
// Only prepares a repository file. It does not commit, push or contact a service.
try {
  const input = process.argv[2];
  if (!input || process.argv.length !== 3)
    throw new Error("Provide one exported catalogue JSON path.");
  if (statSync(input).size > 6 * 1024 * 1024)
    throw new Error("Maximum input size: 6 MB.");
  const catalog = publicSnapshot(JSON.parse(readFileSync(input, "utf8")));
  const target = fileURLToPath(
    new URL("../src/school/published-catalog.json", import.meta.url),
  );
  writeFileSync(target, JSON.stringify(catalog, null, 2) + "\n");
  console.info(
    `Public snapshot prepared: ${catalog.classes.length} classes, ${catalog.chapters.length} chapters, ${catalog.resources.length} resources. Review the diff and run the repository checks before publishing.`,
  );
} catch (error) {
  console.error(
    error instanceof Error && error.name !== "ZodError"
      ? error.message
      : "Invalid catalogue: check fields and references.",
  );
  process.exitCode = 1;
}
