# Deployment

## Initial target

GitHub Actions -> GitHub Pages for the public static frontend.

## CI expectations

A deployment pipeline should:

1. checkout;
2. install dependencies reproducibly;
3. lint if configured;
4. typecheck if configured;
5. test if configured;
6. build;
7. upload the Pages artifact;
8. deploy only after successful validation.

Do not weaken CI merely to make deployment pass.

## Backend boundary

GitHub Pages is not the server/backend for future private student, parent,
finance or administrative data.

Secrets belong in secure environment/CI secret storage, never in source files.
## Private DevSecOps teaching lab — 2026-09-18

See README.md and ADR-004-private-devsecops-lab.md. The owner requested a phased
student project with architecture, containers, shift-left security, SBOMs,
GitHub Actions, secrets, EKS, Traefik, Argo CD and Prometheus/Grafana.

The campus remains one demo service with SQLite. Kubernetes has one replica and
private ClusterIP ingress via loopback port-forward. No production authentication
or public backend is implied. EKS provisioning is an explicit, paid operator step.

CI now has quality/security/image gates, signed main-only GHCR publication and a
reusable Pages workflow downstream of those gates. This changes Pages behavior:
security or image failures prevent static publication. Configure branch/environment
protection in GitHub; workflow YAML alone does not enable required reviewers.

Tool versions/checksums and chart versions are pinned in deploy/tool-versions.env;
Docker's Node base is digest-pinned. Dependabot proposes action/npm/image updates.
Chart/security-tool updates require explicit review. Container backups use
CAMPUS_BACKUP_DIR=/app/.local-data/backups on the writable data volume.

Local verification and unexecuted cloud/container steps are recorded in
../quality/devsecops-validation.md. Existing private data and secrets were not
used for the new UI/backup tests.