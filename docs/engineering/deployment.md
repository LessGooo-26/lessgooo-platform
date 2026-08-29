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