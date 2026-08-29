# Repository Assessment

Date: 2026-08-29

## Assessment basis

This report describes the repository as it exists on the assessment date. It
separates implemented behavior from documented plans and uses the evidence
states defined in [`AGENTS.md`](../../../AGENTS.md):

- **CONFIRMED** — explicitly documented in a repository source of truth.
- **INFERRED** — reasonably derived from code or repository structure, but not
  an official institutional fact.
- **UNKNOWN** — missing or conflicting information.

No application code, dependencies, or architecture were changed while
preparing this assessment.

## 1. Existing technology stack

### Implemented stack

There is currently no implemented application technology stack. In particular,
the repository has no `package.json`, dependency lockfile, application source
directory, HTML entry point, framework configuration, compiler configuration,
or generated site output.

Git is initialized locally on branch `main`, using a standard non-bare
repository configuration in [`.git/config`](../../../.git/config). There are no
commits and no configured remote.

### Documented target

The planned Phase 1 architecture is a static web frontend deployed to GitHub
Pages by GitHub Actions. React/TypeScript is named as one option, not as a final
selection; the architecture explicitly permits a repository-selected
equivalent. See [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) and
[`ADR-001`](../../decisions/ADR-001-static-frontend-deployment.md).

The permanent frontend framework is therefore **UNKNOWN** and should remain so
until it is selected deliberately. A permanent backend is also **UNKNOWN** and
must not be selected without a new ADR.

## 2. Existing directory structure

The current non-Git structure is:

```text
.
|-- .agents/
|   `-- skills/                 # Repository-specific Codex workflows
|-- .github/
|   `-- AGENTS.md               # GitHub/CI instructions only
|-- docs/
|   |-- business/               # Business model, pricing, services, audiences
|   |-- decisions/              # Accepted architecture decisions
|   |-- design/                 # Brand and UX constraints
|   |-- engineering/            # Coding, testing, Git, deployment guidance
|   |-- organization/           # Institutional source-of-truth material
|   |-- plans/
|   |   |-- active/
|   |   `-- completed/
|   |-- product/                # Vision, scope, features, workflows, non-goals
|   |-- programs/               # Program-family specifications
|   |-- quality/                # Acceptance criteria and definition of done
|   |-- users/                  # Roles and initial permissions matrix
|   |-- AGENTS.md
|   |-- index.md
|   `-- UNKNOWN.md
|-- tests/
|   `-- AGENTS.md               # Test-writing instructions; no tests
|-- AGENTS.md
|-- ARCHITECTURE.md
`-- CODEX_FIRST_TASK.md
```

There are no `src`, `app`, `public`, `scripts`, build-output, or test-source
directories. The knowledge-base routing and truth priority are defined in
[`docs/index.md`](../../index.md).

## 3. Existing package scripts

No package scripts exist because there is no `package.json`. Consequently,
`npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` are not
currently repository commands and must not be reported as working validation.
The quality guidance only requires such checks *when configured*; see the
[`definition of done`](../../quality/definition-of-done.md).

## 4. Existing pages and features

### Implemented

No pages or runtime features exist.

### Confirmed Phase 1 scope, not yet implemented

The planned public site includes Home, About, Programs, LESSGOOO Kids,
DevOps/Cloud/AI, Linux, Languages, Modern Secretariat, IoT/Arduino, Contact,
admissions/enquiry information, Partners, and FAQ. These are scope items, not
released features. See [`app-scope.md`](../../product/app-scope.md).

The core planned visitor workflow is discovery, program selection, and contact
or enquiry/application. See [`workflows.md`](../../product/workflows.md).

Authenticated learner, parent, instructor, and administration capabilities are
future possibilities, not Phase 1 requirements. The feature registry contains
no registered feature records or statuses beyond its template guidance; see
[`features.md`](../../product/features.md).

Confirmed program families are documented under [`docs/programs`](../../programs/),
but current commercial terms must not be inferred. Simulator-based heavy
equipment learning is exploratory/partial rather than a confirmed active
offering; see
[`heavy-equipment-simulator.md`](../../programs/heavy-equipment-simulator.md).

## 5. Existing Git and GitHub configuration

- Git repository: initialized, non-bare, branch `main`.
- Commit history: none; `main` has no commits.
- Working tree: all project files are currently untracked.
- Remotes: none configured.
- Ignore rules: no `.gitignore` exists.
- Git hooks: only Git's sample hook files are present; none are enabled.
- GitHub configuration: [`.github/AGENTS.md`](../../../.github/AGENTS.md) contains
  instructions, but there are no issue templates, pull-request template,
  ownership rules, dependency-update configuration, or workflows.

The recommended branch and review practices are documented in
[`git-workflow.md`](../../engineering/git-workflow.md), but they are not
enforced by repository configuration.

## 6. Existing tests

There are no executable tests, fixtures, test-runner configuration, coverage
configuration, or test package scripts. [`tests/AGENTS.md`](../../../tests/AGENTS.md)
contains test authoring rules only.

Future tests should protect both technical behavior and confirmed business
rules, including negative permission cases, omission of invented prices or
accreditation, precise partnership wording, and prevention of private-data
exposure. See [`testing.md`](../../engineering/testing.md).

## 7. Existing deployment configuration

There is no executable deployment configuration. No GitHub Actions workflow,
Pages configuration, build configuration, artifact definition, custom domain,
or environment configuration is present.

The accepted target is GitHub Actions to GitHub Pages for the Phase 1 static
frontend. The documented pipeline must perform reproducible installation and
configured quality checks before build, artifact upload, and deployment. See
[`deployment.md`](../../engineering/deployment.md) and
[`ADR-001`](../../decisions/ADR-001-static-frontend-deployment.md).

## 8. Conflicts with architecture or accepted ADRs

No implemented-code conflict exists because there is no application or
deployment implementation to compare.

The documentation is aligned on these constraints:

- Phase 1 is a static public frontend deployed to GitHub Pages.
- GitHub Pages must not host server-side authorization or private records.
- A backend selection requires a future ADR.
- Institutional and business facts must originate in the knowledge base or
  approved structured content.

These constraints are established by [`ARCHITECTURE.md`](../../../ARCHITECTURE.md),
[`ADR-001`](../../decisions/ADR-001-static-frontend-deployment.md), and
[`ADR-002`](../../decisions/ADR-002-institutional-source-of-truth.md).

One point should be resolved before scaffolding: `ARCHITECTURE.md` suggests
"React/TypeScript or repository-selected equivalent," so it does not yet
constitute a confirmed framework decision. Selecting a framework would not
conflict with the ADR if it produces static assets, but the decision and its
rationale should be recorded in the implementation plan (and in an ADR if it
becomes a durable architectural commitment).

## 9. Security concerns

Current concerns are primarily missing safeguards rather than discovered
runtime vulnerabilities:

1. There is no application or dependency inventory to audit, so client-side,
   supply-chain, and dependency vulnerabilities cannot yet be assessed.
2. There is no `.gitignore`; this increases the risk that future environment
   files, local build output, editor state, or credentials could be staged.
3. There is no CI workflow enforcing validation, secret-safe deployment, or a
   successful-build prerequisite for Pages deployment.
4. There is no automated dependency-update or dependency-scanning
   configuration.
5. All repository content is untracked and there is no commit history or remote,
   so review provenance and change history do not yet exist.
6. Authentication, authorization, privacy, backend, and storage models for
   learner, parent, finance, and staff data are unresolved. Such data must not
   be placed in the static site; this is already tracked as `SECURITY-001` in
   [`docs/UNKNOWN.md`](../../UNKNOWN.md).
7. The permissions matrix is explicitly initial and contains Proposed, Unknown,
   and TBD cells. Those cells are not permissions and cannot safely drive an
   authenticated implementation; see
   [`permissions-matrix.md`](../../users/permissions-matrix.md).
8. Public copy could create legal or reputational risk if it invents prices,
   accreditation, address, partner scope, certification, employment, or
   internship claims. The content controls in [`pricing.md`](../../business/pricing.md),
   [`partners.md`](../../organization/partners.md), and
   [`non-goals.md`](../../product/non-goals.md) must be enforced through
   structured content and tests once implementation begins.

No plaintext credentials or private learner records were found in the current
project files. This is a repository-content observation, not a guarantee about
untracked files outside the project or future history.

## 10. Missing information for `docs/UNKNOWN.md`

The existing registry already tracks accreditation wording, partner wording,
official address, final brand system, parent accounts, secretary finance
permissions, current commercial terms, and sensitive-data architecture.

The following additional items are missing and should be added to
[`docs/UNKNOWN.md`](../../UNKNOWN.md) before their corresponding public or
authenticated behavior is implemented:

- **CONTACT-001 — Official contact channels:** approved public telephone,
  email, messaging links, social profiles, and hours are not documented.
- **ADMISSIONS-001 — Phase 1 enquiry/application workflow:** the supported call
  to action, required fields, destination/owner, consent wording, retention,
  spam protection, and whether submission is an enquiry or formal application
  are not defined.
- **PROGRAM-002 — Currently active public offerings:** program families are
  documented, but the active/inactive status and approved public description
  for each current offering are not consistently confirmed. This is separate
  from commercial terms.
- **CONTENT-001 — Bilingual content authority:** French/English readiness is a
  confirmed product principle, but source language, approved translations,
  translation ownership, fallback behavior, and initial launch-language scope
  are not defined.
- **PRIVACY-001 — Public-site data handling:** even before authenticated
  records, an enquiry form would need confirmed privacy notice, consent,
  collection, retention, access, and deletion rules.
- **DOMAIN-001 — Production URL and Pages ownership:** the GitHub organization,
  repository remote, Pages source/environment, production domain, and DNS
  ownership are not configured or documented.

These are **UNKNOWN**. They must not be presented as settled LESSGOOO policy.
This assessment does not modify the registry because the assigned task is to
assess the repository, not approve or resolve institutional questions.

## 11. Recommended MVP sequence

This sequence stays within the accepted static-frontend boundary and avoids
depending on unresolved claims:

1. **Resolve launch blockers in the knowledge base.** Confirm public contact
   channels, Phase 1 enquiry behavior, active program statuses, launch-language
   scope, approved partner wording/assets, and the minimum usable brand assets.
2. **Record the frontend/tooling decision.** Choose a static-output-capable
   frontend approach, package manager, supported runtime, routing strategy for
   GitHub Pages, content model, localization approach, test tools, and browser
   support. Add an ADR where the choice is durable or constrains later work.
3. **Establish repository safeguards.** Add an appropriate `.gitignore`,
   reproducible dependency lockfile, formatting/lint/typecheck/test/build
   scripts, and secret-safe conventions. Do not add a backend.
4. **Create centralized public content.** Model only confirmed organization,
   program, contact, partner, and navigation data. Optional unknown fields such
   as price, schedule, duration, address, and certification claims must be
   omitted or use approved neutral wording. Follow
   [`ADR-002`](../../decisions/ADR-002-institutional-source-of-truth.md).
5. **Build the smallest visitor journey.** Implement accessible, mobile-first,
   low-bandwidth Home, About, Programs/program detail, and Contact/Enquiry
   surfaces. Add Partners and FAQ only when their publishable content is
   confirmed. Treat the scoped page list as a content/navigation requirement,
   not a reason to duplicate templates.
6. **Add tests with the first behavior.** Cover static-route generation,
   keyboard-accessible navigation, language handling, program rendering,
   broken links, and negative business rules: no invented prices, accreditation,
   address, employment outcomes, or expanded partner claims.
7. **Add gated Pages CI/CD.** Reproducibly install, lint, typecheck, test, build,
   upload, and deploy only after validation succeeds. Configure the Pages base
   path/custom domain only after repository ownership is confirmed.
8. **Validate release readiness.** Check mobile, tablet, desktop, keyboard,
   labels, contrast, performance on constrained connections, static asset paths,
   console errors, and all documented acceptance criteria before publishing.
9. **Keep authenticated features out of this MVP.** Begin learner, parent,
   instructor, finance, or administration work only after the relevant UNKNOWN
   items are resolved and backend/security decisions are accepted in ADRs.

## 12. Exact validation commands that currently work

There are no application lint, typecheck, test, or build commands because no
application tooling exists. The following read-only repository checks work in
the current Windows PowerShell environment:

```powershell
git rev-parse --is-inside-work-tree
git branch --show-current
git remote -v
git status --short
rg --files -g '!node_modules' -g '!dist' -g '!build'
rg -n --hidden -g '!.git/**' '(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,})' .
```

Expected observations on 2026-08-29:

- `git rev-parse --is-inside-work-tree` returns `true`.
- `git branch --show-current` returns `main`.
- `git remote -v` returns no remotes.
- `git status --short` reports the project content as untracked.
- `rg --files ...` lists the documentation/bootstrap files and no application
  source or package manifest.
- The targeted credential-pattern scan returns no matches. A no-match exit code
  from `rg` is `1`, which means "not found," not a scan failure.

Commands such as `npm install`, `npm run lint`, `npm run typecheck`, `npm test`,
and `npm run build` are intentionally not run: there is no package manifest and
the task prohibits dependency installation or application scaffolding.
