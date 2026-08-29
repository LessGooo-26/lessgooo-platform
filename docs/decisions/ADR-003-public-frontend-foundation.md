# ADR-003 — Public Frontend Foundation

Status: ACCEPTED
Date: 2026-08-29

## Context

LESSGOOO V1 begins with the public website only. The repository needs a typed,
testable frontend that produces static assets for the repository Pages path,
supports later French and English content, and does not introduce a backend.

## Decision

- Use React and TypeScript, built with Vite.
- Use React Router with hash-based routing so direct navigation and refreshes
  work on GitHub Pages without server rewrite rules.
- Build for the `/lessgooo-platform/` repository base path.
- Keep translatable interface copy behind a typed locale boundary. Approved
  institutional content will remain sourced from the knowledge layer or future
  approved structured content.
- Use ESLint, Vitest, and React Testing Library as the initial quality tools.
- Deploy the generated static `dist` directory through GitHub Actions Pages
  actions after lint, typecheck, tests, and build succeed.

## Consequences

- Application code must not depend on server-side routing or runtime services.
- URLs use a fragment for client-side routes while GitHub Pages remains the
  host.
- Adding public content requires source-of-truth review; locale readiness does
  not authorize unapproved translations of institutional facts.
- Authentication, private data, payments, and backend behavior remain outside
  this architecture.
