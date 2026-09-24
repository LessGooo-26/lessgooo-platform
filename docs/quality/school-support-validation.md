# Cameroon school support — validation, 2026-09-24

Scope and confirmed conditions: [school support](../programs/school-support.md).
Usage: [operator guide](../product/school-support-guide.md).

## Automated checks

- `npm run lint`: passed, zero errors; three pre-existing React Fast Refresh warnings in shared button/sidebar/tabs components.
- `npm run typecheck`: passed; `npm run build` also runs TypeScript before bundling.
- `npm test`: **154 tests, 20 files passed**, including 21 new school tests. Existing coverage retained. Vitest's existing single-worker setting retained.
- `npm run build`: passed. School space is lazy loaded (123.67 kB / 44.63 kB gzip); settings are a separate lazy chunk (21.87 kB / 8.12 kB gzip). No new dependencies or large-chunk warning.
- `node --import tsx scripts/publish-school-catalog.mjs reports/school-export-check.json`: exercised with the bundled catalogue. Output validated (26 classes / 24 chapters / 20 resources), original `published-catalog.json` restored to `null`. No snapshot containing private learner data was created or committed.
- `git diff --check`: passed before staging.
- Pages-mode build: `PAGES_BUILD=1 node node_modules/vite/bin/vite.js build --outDir reports/pages-build` passed (PowerShell used `$env:PAGES_BUILD = '1'`). The preview at port 4189 served `/lessgooo-platform/#/school` with the catalogue fallback, correct base-path links, one top-level heading and no application console errors. The first browser permission attempt expired; its permitted retry succeeded.

New regressions cover owner-provided fees and unknown billing period, opening hours without an invented subject allocation, bilingual content, historical booklist/mocks labels, identifiers and references, safe HTTPS links, quiz completeness/scoring, timetable conflicts/cancellation, missing marks and interest-led guidance, generated problem determinism, public export filtering, version conflicts, persistent school state without overwriting campus data, media ownership/completion/sharing, unpublished content, server grading/stale quizzes, parent isolation/read-only access, profile validation, presence deduplication/expiry/roster privacy, safe audio signatures, HTTP persona/origin/method restrictions, language stability, draft preservation and editor validation.

## Browser checks

Public page: desktop, 390 px and 320 px; tablet library at 768 px. No horizontal overflow in the inspected views. French/English switching and class/subsystem selection keep the selected interface language. The first mathematics quiz was completed in the public page: 2/2 and detailed French corrections displayed. The start-learning link preserves `#/school` and focuses the content. Document cards distinguish historical lists, mocks and external enrichment.

Campus: school tool/navigation and explicit demonstration label; teacher settings loaded; original 2,000 F CFA registration and unknown billing period displayed; changing a fee in the unsaved draft blocked leaving the editor. The draft was discarded, preserving the saved amount. Chapter editor exposes bilingual explanations, prerequisites, examples, challenges and quiz controls. At 390 px its measured document width remained within the viewport. No application console errors appeared in the inspected school tabs. Temporary viewport overrides were reset.

Keyboard: activating the start-learning link with Enter retained the school route and focused the content container. Live local presence: the teacher demonstration signal changed from 0 to 1 active profile, displayed its online state, then returned to 0 after leaving. No persistent attendance record was created.

## Coverage boundaries

This validates a local, configurable educational module, not a production multiuser school. Real accounts/parent links and public backend exposure remain SECURITY-001. No AWS resources, purchases, production secrets or external learner messages were created. Existing local SQLite content was not reset.

Initial coverage is exactly 26 general classes, 24 subject descriptions, 24 original revision chapters, 48 explained questions, 4 arithmetic-variant topics and 20 resource entry points. Empty class/subject combinations are explicitly shown as incomplete. Technical streams can be configured but are not exhaustively seeded. Full curricula, every historical exam, the current prescribed-book list for every stream, complete legal redistribution rights and full educational review remain outstanding. Initial research dates and source editions are documented.

CI results and commit/remote verification are reported with the delivered commit; local checks do not stand in for uncompleted remote security/image gates.
