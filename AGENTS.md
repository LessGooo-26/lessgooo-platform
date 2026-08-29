# LESSGOOO â€” Codex Operating Instructions

You are working inside the official LESSGOOO software repository.

## Core operating rule

Do not invent LESSGOOO facts.

Before implementing anything involving the organization, programs, pricing,
locations, partnerships, staff, learners, parents, permissions, schedules,
certificates, accreditation, legal status, branding, academic rules, or
business rules:

1. Read `docs/index.md`.
2. Read the relevant source-of-truth documents under `docs/`.
3. Inspect existing implementation and tests.
4. Check accepted decisions under `docs/decisions/`.
5. If the answer is still not known, classify it as UNKNOWN instead of guessing.

## Evidence states

Use these three states:

- CONFIRMED â€” explicitly documented in the repository source of truth.
- INFERRED â€” reasonably derived from code or architecture but not an official fact.
- UNKNOWN â€” not documented or conflicting.

Never publish INFERRED or UNKNOWN information as an official LESSGOOO fact.

## Knowledge map

Start here:

- `docs/index.md`
- `docs/organization/lessgooo-overview.md`
- `docs/organization/mission-vision-values.md`
- `docs/product/product-vision.md`
- `ARCHITECTURE.md`
- `docs/UNKNOWN.md`

Then use:

- Organization: `docs/organization/`
- Business: `docs/business/`
- Programs: `docs/programs/`
- Roles & permissions: `docs/users/`
- Product requirements: `docs/product/`
- Brand & UX: `docs/design/`
- Engineering: `docs/engineering/`
- Architecture decisions: `docs/decisions/`
- Active plans: `docs/plans/active/`
- Quality rules: `docs/quality/`
- Reusable workflows: `.agents/skills/`

## Autonomy

For requests to explain, diagnose, review, or plan:
- inspect relevant materials;
- report findings;
- do not modify code unless asked.

For requests to build, fix, refactor, or change:
- inspect the relevant docs and code first;
- make the smallest coherent in-scope change;
- run relevant non-destructive validation;
- do not ask for permission for normal local reads, edits, linting, testing,
  typechecking, or builds.

Require explicit approval before:
- deleting significant data;
- destructive migrations;
- changing production secrets;
- external purchases;
- materially changing business scope;
- publishing unconfirmed institutional claims.

## Never fabricate

Never fabricate:

- prices or fees;
- schedules;
- addresses;
- staff identities;
- instructor qualifications;
- partnerships;
- government approvals;
- accreditation;
- certificates;
- employment guarantees;
- internships;
- academic rules;
- user permissions;
- legal claims.

If not documented, use UNKNOWN and point to `docs/UNKNOWN.md`.

## Development protocol

Before coding:

1. Understand the requested outcome.
2. Read relevant repository instructions.
3. Read relevant LESSGOOO documentation.
4. Inspect existing code and tests.
5. Identify architectural constraints.
6. Check accepted ADRs.
7. Implement the smallest coherent solution.
8. Add or update tests when behavior changes.
9. Run relevant validation.
10. Review the diff.
11. Update source-of-truth documentation when a confirmed business rule changes.

## Definition of done

Use the commands that actually exist in this repository.

Typical JavaScript/TypeScript checks may include:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Never invent a command if it is not defined in `package.json`.

A task is not complete when a relevant existing validation command fails.

For UI changes verify, where practical:

- mobile layout;
- tablet layout;
- desktop layout;
- keyboard usability;
- accessible labels;
- no obvious console errors;
- low-bandwidth friendliness.

## Architecture boundaries

- UI components should not own domain business rules.
- Centralize business/domain rules.
- Do not hardcode secrets.
- Do not commit credentials.
- Prefer existing dependencies.
- Explain any new dependency.
- Avoid unnecessary framework changes.
- Do not silently replace accepted architecture decisions.
- GitHub Pages is a static frontend deployment target, not a general backend.

## Business-change protocol

When a confirmed LESSGOOO business rule changes:

1. update source-of-truth documentation;
2. update structured data/configuration;
3. update or add tests;
4. update implementation;
5. run validation.

## Final report

After implementation, report:

- what changed;
- why;
- important files changed;
- source-of-truth documents consulted;
- validation commands run and their results;
- assumptions;
- UNKNOWN items that remain.