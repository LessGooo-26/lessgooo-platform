# Gallery and homework validation — 2026-09-23

## Outcome and important files

- PhotoOptions.tsx and PersonalSpace.tsx: per-photo labels and calendar dates, gallery cover/background, personal campus background, resets and label search. Controls expand only when needed.
- workspace-store.ts and lib/workspace.ts: additive media columns, validated owner-only metadata and gallery changes, per-persona background persistence and existing read-access enforcement.
- HomeworkBoard.tsx, lib/homework.ts and homework.css: named task cards, three views, a compact dashboard, newest-attempt access and translated unchanged demo submissions.
- CampusApp.tsx and LessonReader.tsx: direct entry into the attached practice tab, immediate saved-work view after submission, clear feedback and consistent language labels.
- lib/model.ts: progress counts distinct in-track validated lessons.
- english.json/french.json: remaining static labels, error messages, default persona names and demo autonomy levels follow the selected language.

## Source of truth consulted

AGENTS.md; docs/index.md; docs/product/app-scope.md; docs/product/campus-expansion.md;
docs/product/learning-experience.md; docs/design/brand.md; docs/users/permissions-matrix.md;
ARCHITECTURE.md; accepted local-campus ADR-003 and private-lab ADR-004; docs/UNKNOWN.md;
tests/AGENTS.md; the product, UI and testing repository skills. The approved new scope is
[gallery-homework-experience.md](../product/gallery-homework-experience.md).

## Automated checks

- npm test: 100 tests in 14 files passed.
- Targeted gallery tests: 7 passed, including a failed save that preserves the draft while its error changes from French to English.
- npm run typecheck: passed. The production build also runs tsc -b.
- npm run lint: no errors; three existing React Fast Refresh warnings in shared UI components.
- npm run build: passed. Existing bundle-size advisory remains; campus JavaScript is approximately 526 kB before gzip, with the lesson reader loaded separately.
- git diff --check: passed.

New regressions cover metadata persistence, invalid dates, owner and viewer permissions,
image validation, cross-gallery covers, cover removal, independent persona backgrounds,
revoked sharing, profile preservation, label search, compact homework cards, parent
read-only actions, teacher review, language persistence, untouched demo translations,
latest attempts, access to earlier work and attachments, duplicate-safe progress and direct practice entry.

## Browser walkthrough

Compiled app at loopback port 4183, with a separate synthetic SQLite directory
.local-data/qa-gallery-homework-20260923. Real saved photos and homework were not used
for mutation tests. The real local app was also loaded from localhost:5173.

- Saved a label and manually chosen date; reloaded and checked both persisted.
- Applied a gallery background and a personal campus background independently; checked both persisted and both reset.
- Confirmed French navigation into homework keeps French selected and English restores English interface copy and bundled feedback.
- Submitted two clearly marked synthetic responses through the linked activity. Verified the final flow immediately opens the saved work with its pending status and attachment control.
- Checked 390×844 phone, 820×1180 tablet and 1280×900 desktop layouts, including document width versus scroll width and text contrast over backgrounds.
- Used the keyboard to expand photo options and exercised labelled inputs and buttons.
- No console errors from the compiled QA application. An old development-origin tab had a stale module-load error; the fresh localhost origin and compiled preview loaded successfully.

## Assumptions and remaining unknowns

Photo dates are optional manual dates, with upload date as fallback; they are not inferred
from image metadata. Learner/teacher text, personal labels, names and filenames are kept
as authored. Proper product names and the language selector’s native language names are
retained. No online translation service is used.

No new institutional rule is invented. Production authentication, personal-data hosting
and the institutional unknowns listed in docs/UNKNOWN.md remain outside this local demo
change. No paid infrastructure or external message was created.
