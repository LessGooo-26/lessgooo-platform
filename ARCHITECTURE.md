# LESSGOOO Application Architecture

Status: INITIAL
Date: 2026-08-29

## Phase 1

    User Browser
         |
         v
    Static Web Frontend
    React/TypeScript or repository-selected equivalent
         |
         v
    GitHub Pages

GitHub Actions performs validation/build/deployment.

## Future architecture

    Browser
       |
       v
    LESSGOOO Frontend
       |
       | HTTPS
       v
    Backend / API / Auth
       |
       v
    Database / Storage

## Boundaries

GitHub Pages:
- public static assets;
- compiled frontend;
- public content.

Future backend/service:
- authentication;
- authorization;
- private records;
- payments;
- attendance;
- results;
- file uploads;
- administrative operations;
- database writes.

## Rule

Do not select a permanent backend by assumption.
Document the decision in an ADR first.