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
test "$(curl --silent -o /dev/null -w '%{http_code}' -H 'Host: attacker.invalid' http://127.0.0.1:4173/api/health)" = 403
test "$(curl --silent -o /dev/null -w '%{http_code}' -H 'Origin: https://attacker.invalid' http://127.0.0.1:4173/api/health)" = 403
test "$(curl --silent -o /dev/null -w '%{http_code}' -H 'Sec-Fetch-Site: cross-site' http://127.0.0.1:4173/api/health)" = 403
printf 'Healthy container; foreign Host, Origin and cross-site requests rejected.\n'
