# Deployment

## Production target

The LESSGOOO V1 public frontend is a static React application built by Vite and
deployed through GitHub Actions to GitHub Pages. GitHub Pages is not a backend
and must not hold private learner, parent, finance or administrative data.

The production build command is `npm run build`. It writes the deployable site
to `dist/`. Vite is configured with the repository base path
`/lessgooo-platform/`, so generated scripts and styles resolve below the Pages
repository URL.

React Router uses hash-based routing. Public application routes therefore
appear after `#/`, for example:

```text
https://lessgooo-26.github.io/lessgooo-platform/#/programs
```

The default GitHub Pages URL is expected to be:

```text
https://lessgooo-26.github.io/lessgooo-platform/
```

This URL assumes the configured GitHub owner and repository remain
`LessGooo-26/lessgooo-platform`. A custom production domain is not currently
documented.

## Continuous integration

`.github/workflows/ci.yml` runs for:

- every pull request;
- every push to `main`.

The CI job performs, in order:

1. checkout;
2. Node.js 22 setup with npm caching;
3. reproducible dependency installation with `npm ci`;
4. `npm run lint`;
5. `npm run typecheck`;
6. `npm test`;
7. `npm run build`.

The job has read-only repository-content permission. Concurrent runs for the
same workflow and Git reference are cancelled when superseded.

## Production deployment

`.github/workflows/deploy-pages.yml` runs only after a push to `main`. It does
not run for pull requests or other branches.

The `validate-and-build` job repeats the complete validation sequence before
configuring Pages and uploading `dist/` as the GitHub Pages artifact. The
`deploy` job declares `needs: validate-and-build`, so lint, typecheck, test,
build or artifact failures prevent deployment.

The deployment uses the protected `github-pages` environment and concurrency
group `pages`. A new deployment waits instead of cancelling an active Pages
deployment.

### Workflow permissions

- `validate-and-build`: `contents: read` for checkout and `pages: read` so the
  official Pages configuration action can read the repository's Pages metadata.
- `deploy`: `actions: read` to read the uploaded artifact, `pages: write` to
  create the Pages deployment, and `id-token: write` for GitHub's deployment
  identity token.

No plaintext secrets, API keys or external-hosting credentials are required.

## Required repository setting

In GitHub, open **Settings → Pages** and set **Build and deployment → Source**
to **GitHub Actions**. The repository and organization must also permit GitHub
Actions to run. GitHub creates or uses the `github-pages` environment during
deployment; optional environment protection rules may restrict it to `main`.

## Troubleshooting

When CI or deployment fails:

1. Open the failed run under the repository's **Actions** tab.
2. Identify the first failing step; later steps may only be skipped because of
   that failure.
3. For `npm ci` failures, confirm `package.json` and `package-lock.json` are in
   sync and that the npm registry was reachable.
4. For lint, typecheck, test or build failures, run the matching package script
   locally and fix the underlying issue. Do not remove or weaken the gate.
5. For missing asset errors, confirm Vite still uses
   `base: '/lessgooo-platform/'` and inspect `dist/index.html` after a build.
6. For route-refresh problems, confirm the application entry still uses
   `HashRouter`; URLs should contain `#/` before the client route.
7. If artifact upload fails, confirm `dist/` exists and the build completed.
8. If deployment reports a Pages or environment error, confirm the Pages
   source is **GitHub Actions**, Actions are enabled, and the `github-pages`
   environment permits deployments from `main`.
9. Re-run a job only after addressing the underlying failure. Do not add
   secrets or broaden permissions as a generic troubleshooting step.

## Backend boundary

GitHub Pages serves public static assets only. Authentication, authorization,
databases, payments, private records, uploads and server-side operations
require a separately accepted future architecture decision.

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
