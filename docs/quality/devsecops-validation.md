# DevSecOps project validation — 2026-09-18

## Scope

README, architecture reference, a bilingual ten-phase campus project, CI and
private lab deployment examples. The user's two pre-existing documentation edits
were preserved; deployment.md received an additional lab section.

## Executed locally

- npm run lint: passed, with three existing React Refresh warnings in shared
  button/sidebar/tabs primitives.
- npm run typecheck: passed.
- npm test: 67 tests passed across 10 files, including project discovery,
  English/French content, Kids separation and a real backup/restore CLI test.
- npm run build: passed, including an offline README download in the app bundle.
- actionlint 1.7.12: passed. Shell scripts also passed Bash syntax checks.
- Kustomize 5.8.1 rendered the EKS overlay. Kubeconform 0.8.0 validated all nine
  core application/storage resources against Kubernetes 1.35 schemas.
- Trivy 0.74.0 scanned current source, production AND development npm packages,
  secrets and configuration: no HIGH/CRITICAL findings. Real local .env.local,
  data, backups and reference copies were excluded from this local check.
- Gitleaks 8.30.1 scanned the available Git history: no leaks found.
- Helm 4.3.0 rendered pinned releases: Traefik 41.6.0 (8 resources), Argo CD
  10.9.2 (59), kube-prometheus-stack 91.4.1 (111), Blackbox 11.18.0 (4).
  CRD-backed resources were rendered; these counts do not equal running Pods.
- All 25 YAML documents parsed; five dashboard panels validated; three Mermaid
  diagrams parsed successfully; README links and all ten phase anchors resolved.
- Browser checks used a separate synthetic-data server on port 4183. Requested
  widths 390, 820 and 1440 had no horizontal document overflow. Keyboard Enter
  expanded a phase, project search found Argo CD, the French switch worked,
  and no browser warning/error logs were observed.

## Not executed here

Docker is not installed on this workstation. Docker build/Compose, the container
smoke test, containerized Semgrep, final-image vulnerability scan/SBOM/signing
and registry push must run in the Linux GitHub workflow or a Docker-enabled lab.
See the dated hosted-CI follow-up below for checks subsequently run on GitHub.

No AWS resources were purchased or created. EKS provisioning, server-side
Kubernetes dry-run, actual CNI enforcement, volume provisioning, Argo sync,
live scrape/alert delivery and cloud restore/teardown remain operator lab steps.
No production data, secret values or accounts were used.

The gates are implemented and fail closed; unexecuted checks have not been
disabled or represented as passing. Production authentication remains
SECURITY-001. External alert receivers and production TLS/secret-store integration
are not configured.

## Source-of-truth consulted

docs/index.md; organization overview and mission/values; product vision and
app scope; campus-expansion and campus-studio; DevOps/Cloud/AI program;
roles and permissions matrix; brand; testing/local-campus/deployment/studio
engineering notes; UNKNOWN.md; accepted ADR-001/002/003. This request is recorded
in docs/product/devsecops-project.md and ADR-004-private-devsecops-lab.md.

## Hosted CI follow-up — 2026-09-20

The [first DevSecOps run](https://github.com/LessGooo-26/lessgooo-platform/actions/runs/35502937423)
received commit 6bd2598 successfully. Quality and source security passed,
including containerized Semgrep. Docker build, runtime/negative HTTP checks
and SPDX SBOM generation also passed. The final-image gate correctly failed:
Trivy reported 59 HIGH/CRITICAL Debian package findings and 11 in npm's bundled
dependencies. There were no secret findings in that image report.

The corrective Dockerfile uses the same digest-pinned official Node 22 / Alpine
3.24 image for build and runtime, and removes unused npm/Corepack/Yarn after
installing production dependencies. The local preflight scan of that base,
using the existing vulnerability database, found no HIGH/CRITICAL Alpine
package findings; its 11 npm findings are in the runtime tooling being removed.
This preflight is not a substitute for scanning the final built image with a
fresh database in GitHub Actions.

The smoke test now creates a SQLite backup on the writable volume and checks
its integrity under the same read-only-root, non-root and dropped-capabilities
settings. Workflow logs now list vulnerability IDs and affected versions while
preserving Trivy's failure status. No CVE exclusions, severity reductions,
ignore-unfixed option or continue-on-error bypass were added.

Local workflow lint, Bash syntax and Dockerfile HIGH/CRITICAL configuration
checks passed. A local rerun also found Vitest collecting third-party tests
from the ignored diagram-tool cache: test exclusions now extend Vitest's defaults
and explicitly exclude .local-data, preserving all 67 application tests.
The definitive result for each corrective commit is its
[DevSecOps run](https://github.com/LessGooo-26/lessgooo-platform/actions/workflows/ci.yml).
Image publication/signing and Pages remain main-branch operations; EKS and
other cloud execution remain unverified operator steps.
