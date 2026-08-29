# ADR-001 â€” Static Frontend Deployment

Status: ACCEPTED
Date: 2026-08-29

## Context

The initial LESSGOOO application should be simple to host and deploy through
GitHub Actions and GitHub Pages.

## Decision

The first deployment target is a static web frontend deployable to GitHub Pages.

## Consequences

- The frontend must successfully produce static deployment assets.
- Server-only runtime behavior cannot depend on GitHub Pages.
- Future authentication and private data require a backend/service.
- A backend selection requires another ADR.