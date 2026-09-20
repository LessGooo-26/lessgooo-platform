#!/usr/bin/env bash
set -euo pipefail
image="${1:-lessgooo-campus:ci}"
name="campus-smoke-${RANDOM}"
cleanup() { docker rm -f -v "$name" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --name "$name" --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges:true -v /app/.local-data -p 127.0.0.1:4173:4173 "$image"
ready=0
for attempt in $(seq 1 45); do
  if curl --fail --silent http://127.0.0.1:4173/api/health >/dev/null; then ready=1; break; fi
  sleep 2
done
if [[ "$ready" != 1 ]]; then docker logs "$name"; exit 1; fi
curl --fail --silent http://127.0.0.1:4173/campus.html >/dev/null
# Exercise the Node SQLite binary and writable volume with the root read-only.
docker exec "$name" node scripts/backup.mjs
docker exec "$name" node --input-type=module -e '
  import assert from "node:assert/strict";
  import { readdirSync } from "node:fs";
  import { join } from "node:path";
  import { DatabaseSync } from "node:sqlite";
  const directory = process.env.CAMPUS_BACKUP_DIR;
  const files = readdirSync(directory).filter(file => file.endsWith(".sqlite"));
  assert.equal(files.length, 1, "Expected a backup on the fresh test volume");
  const backup = new DatabaseSync(join(directory, files[0]), { readOnly: true });
  try {
    assert.equal(backup.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  } finally {
    backup.close();
  }
'
test "$(curl --silent -o /dev/null -w '%{http_code}' -H 'Host: attacker.invalid' http://127.0.0.1:4173/api/health)" = 403
test "$(curl --silent -o /dev/null -w '%{http_code}' -H 'Origin: https://attacker.invalid' http://127.0.0.1:4173/api/health)" = 403
test "$(curl --silent -o /dev/null -w '%{http_code}' -H 'Sec-Fetch-Site: cross-site' http://127.0.0.1:4173/api/health)" = 403
printf 'Healthy container and valid SQLite backup; foreign Host, Origin and cross-site requests rejected.\n'
