# Repository Assessment

Date: 2026-08-29

## Assessment basis

This report describes the repository as inspected on 2026-08-29. It separates
implemented repository state from planned LESSGOOO product scope.

- **CONFIRMED** means the fact is directly evidenced by a repository file or
  Git metadata.
- **INFERRED** means the conclusion follows from the inspected repository but
  is not an approved institutional fact.
- **UNKNOWN** means the repository does not currently provide the answer.

No application code, dependency, architecture, or deployment configuration was
created or changed during this assessment. The governing sources are
[`AGENTS.md`](../../../AGENTS.md), [`docs/index.md`](../../index.md),
[`ARCHITECTURE.md`](../../../ARCHITECTURE.md),
[`ADR-001`](../../decisions/ADR-001-static-frontend-deployment.md), and
[`ADR-002`](../../decisions/ADR-002-institutional-source-of-truth.md).

## 1. Existing technology stack

**CONFIRMED:** No application technology stack currently exists in the
repository. There is no `package.json`, lockfile, application source directory,
framework configuration, TypeScript configuration, HTML entry point, or build
configuration.

**CONFIRMED:** The only implemented content is a Markdown-based institutional
knowledge and instruction layer under `docs/`, `.agents/`, `.github/`, and
`tests/`, plus the root instruction and architecture documents.

**UNKNOWN:** The frontend framework, package manager, runtime version, styling
approach, internationalization library, and testing tools have not been
selected. [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) permits React/TypeScript
or a repository-selected equivalent; it does not make a final selection.

## 2. Existing directory structure

The repository currently contains:

```text
.
|-- .agents/skills/       LESSGOOO-specific Codex workflows
|-- .github/              GitHub-scoped instructions only
|-- docs/
|   |-- business/         Business source-of-truth documents
|   |-- decisions/        Accepted architecture decisions
|   |-- design/           Brand and UX guidance
|   |-- engineering/      Coding, testing, Git, and deployment guidance
|   |-- organization/     Institutional source-of-truth documents
|   |-- plans/            Active and completed plans
|   |-- product/          Product vision, scope, workflows, and guardrails
|   |-- programs/         Program-family documents
|   |-- quality/          Definition of done and acceptance criteria
|   `-- users/            Roles and preliminary permissions
|-- tests/                Test instructions only; no test files
|-- AGENTS.md             Repository-wide operating instructions
|-- ARCHITECTURE.md       Initial architecture boundary
`-- CODEX_FIRST_TASK.md   Bootstrap assessment instruction
```

**CONFIRMED:** There is no `src/`, `app/`, `pages/`, `public/`, `assets/`,
`dist/`, or equivalent application directory. There is also no `.gitignore`.

## 3. Existing package scripts

**CONFIRMED:** There are no package scripts because no `package.json` exists.
Consequently, `npm run lint`, `npm run typecheck`, `npm test`, and
`npm run build` are not currently repository commands and must not be claimed
as working validation.

## 4. Existing pages and features

**CONFIRMED:** No web page or executable product feature is implemented.

The public pages listed in
[`docs/product/app-scope.md`](../../product/app-scope.md)—Home, About, Programs,
program-family pages, Contact, admissions/enquiry information, Partners, and
FAQ—are approved Phase 1 scope, not existing pages.

The learner, parent, instructor, and administration modules in that same file
are explicitly future authenticated scope. They must not be represented as
implemented, and they cannot be implemented as server functionality on GitHub
Pages. The only currently described workflow is conceptual; see
[`docs/product/workflows.md`](../../product/workflows.md).

## 5. Existing Git and GitHub configuration

**CONFIRMED:**

- The directory is a Git working tree.
- The current branch is `master`.
- The repository has no commits.
- No Git remote is configured.
- All bootstrap-created content is untracked.
- There is no `.gitignore`.
- `.github/` contains only `.github/AGENTS.md`; there are no issue templates,
  pull-request templates, Dependabot configuration, CODEOWNERS, or workflows.

The current `master` branch name differs from the recommended `main` branch in
[`docs/engineering/git-workflow.md`](../../engineering/git-workflow.md). This is
configuration drift, not an application-architecture conflict, because no
history or remote exists yet.

## 6. Existing tests

**CONFIRMED:** No test runner, test configuration, fixtures, or test cases
exist. [`tests/AGENTS.md`](../../../tests/AGENTS.md) and
[`docs/engineering/testing.md`](../../engineering/testing.md) define testing
expectations but do not constitute an executable suite.

Important future regression requirements already documented include preventing
staff from automatically receiving instructor permissions, preventing invented
prices or accreditation claims, keeping partnership wording precise, and
protecting private data from public routes.

## 7. Existing deployment configuration

**CONFIRMED:** No deployment implementation exists. There is no GitHub Actions
workflow, Pages artifact configuration, build output, custom domain file, or
deployment script.

**CONFIRMED:** The accepted target is a static frontend deployed through GitHub
Actions to GitHub Pages, as specified by
[`ADR-001`](../../decisions/ADR-001-static-frontend-deployment.md) and
[`docs/engineering/deployment.md`](../../engineering/deployment.md).

**UNKNOWN:** The GitHub repository, Pages URL, custom domain, Node/runtime
version, build command, build output directory, and deployment environments are
not configured or documented.

## 8. Architecture and ADR conflicts

No implemented application conflicts can be present because there is no
application implementation.

The following gaps must be resolved without violating the accepted decisions:

- A static frontend stack still needs to be selected within the boundary in
  [`ARCHITECTURE.md`](../../../ARCHITECTURE.md).
- Public institutional content must originate from the knowledge base or
  approved structured content, per
  [`ADR-002`](../../decisions/ADR-002-institutional-source-of-truth.md).
- Authentication, authorization, payments, private learner records, attendance,
  results, uploads, and database writes must remain outside the GitHub Pages
  runtime. A backend choice requires a new ADR.
- The preliminary permissions matrix contains `Proposed`, `Unknown`, and `TBD`
  entries and therefore cannot yet serve as an authorization policy; see
  [`docs/users/permissions-matrix.md`](../../users/permissions-matrix.md).

## 9. Security concerns

**CONFIRMED:** No credential or secret value was found in the inspected files.
The matches for words such as `secret` and `credential` are policy statements,
not secrets.

Current risks and missing controls are:

- There is no `.gitignore` to reduce the chance of committing environment
  files, dependency directories, generated output, or local tooling state.
- There is no CI validation or dependency scanning because there is no workflow
  or dependency manifest.
- There is no security policy, dependency update configuration, or code-owner
  review configuration.
- No privacy, retention, consent, or access-control design exists for future
  learner, parent, staff, finance, attendance, or assessment data.
- The backend, authentication, authorization, and storage model for sensitive
  data remains **UNKNOWN**, already tracked as `SECURITY-001` in
  [`docs/UNKNOWN.md`](../../UNKNOWN.md).

These findings do not justify adding backend or authentication behavior to the
static Phase 1 site.

## 10. Missing information for the UNKNOWN registry

The existing registry correctly captures accreditation wording, partnership
wording, location, brand, parent accounts, secretary financial permissions,
commercial terms, and sensitive-data architecture. The following additional
questions should be formally resolved before their dependent work is approved:

- **TECH-001 — Frontend implementation stack:** Which framework, package
  manager, supported runtime version, styling system, testing tools, and
  internationalization approach are approved for Phase 1?
- **DEPLOY-001 — GitHub Pages identity:** What GitHub repository, organization,
  Pages URL, custom domain, default branch, and deployment environment should
  be used?
- **CONTENT-001 — Phase 1 launch content:** Which approved copy, program details,
  calls to action, contact channels, enquiry process, languages, and media are
  required for the first public release?
- **ADMISSION-001 — Enquiry/admission boundary:** Is Phase 1 limited to contact
  information, or may it collect submissions? If submissions are permitted,
  where are they processed and what privacy/retention rules apply?
- **I18N-001 — Bilingual policy:** Which pages must be available in English and
  French at launch, who approves translations, and which language is the
  fallback?
- **ACCESS-001 — Accessibility target:** Which conformance target and supported
  browser/device baseline are required?
- **ANALYTICS-001 — Public-site telemetry:** Is analytics allowed, and if so,
  which provider and consent/privacy requirements apply?
- **LEGAL-002 — Public policies:** Which privacy notice, terms, cookie policy,
  and data-controller/contact wording are approved for publication?
- **BRAND-002 — Asset rights:** Which logos, photos, partner marks, fonts, and
  other assets are approved and licensed for web publication?

These are proposed registry entries, not resolved facts. This assessment does
not modify [`docs/UNKNOWN.md`](../../UNKNOWN.md) because no answers were supplied.

## 11. Recommended MVP sequence

This is a technical sequence, not approval of unknown institutional content:

1. Resolve the Phase 1 technical, deployment, brand, contact, content,
   bilingual, and legal UNKNOWN items needed to begin safely.
2. Select the static frontend stack and record the selection in an ADR if it
   narrows or changes the current architecture.
3. Establish the repository baseline: default branch, remote, `.gitignore`,
   dependency lockfile, runtime version, formatting, linting, typechecking, and
   test configuration.
4. Model approved public institutional content as centralized structured data
   traceable to the knowledge base.
5. Build the shared mobile-first shell, navigation, language behavior,
   accessibility foundations, and low-bandwidth asset strategy.
6. Implement a minimal public journey: Home, About, Programs index, approved
   program detail content, and Contact/enquiry information.
7. Add Partners, FAQ, and other Phase 1 pages only when their wording and assets
   are confirmed.
8. Add regression tests for institutional-truth guardrails, navigation,
   accessibility-critical behavior, and static route generation.
9. Add GitHub Actions validation, then a Pages deployment job that runs only
   after successful validation.
10. Validate mobile, tablet, desktop, keyboard use, static hosting, and
    low-bandwidth behavior before the first release.

Authenticated modules are excluded from this MVP. Their backend, privacy, and
authorization architecture must be resolved separately before implementation.

## 12. Exact validation commands that currently work

Run these commands from the repository root:

```powershell
git rev-parse --is-inside-work-tree
git status --branch --short
git diff --check
rg --files -g '!node_modules/**'
```

Observed results on 2026-08-29:

- `git rev-parse --is-inside-work-tree` returned `true`.
- `git status --branch --short` reported no commits on `master` and the
  bootstrap-created paths as untracked.
- `git diff --check` exited successfully with no whitespace errors in tracked
  changes. Because all current content is untracked, this command does not
  validate those files.
- `rg --files -g '!node_modules/**'` successfully enumerated 40 files before
  this assessment was added.

There are currently no executable lint, typecheck, unit-test, integration-test,
or build commands. Those commands can only be documented after an actual stack
and package scripts exist.
