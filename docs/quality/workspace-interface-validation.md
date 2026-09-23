# Campus workspace interface validation — 2026-09-23

Scope: [owner request and design references](../product/workspace-interface.md).

## Delivered

- Grouped campus navigation and an original LESSGOOO tool launcher, using the existing React/Radix/lucide components and brand.
- Search accessible from every campus page, with Ctrl/Cmd+K, accent-insensitive local tool/course/lesson matching, direct lesson opening and query handoff to the existing full campus search. Repeating the same launcher query resets a subsequently edited full-search query.
- Up to six starred shortcuts and four recent section IDs per demo persona in this browser. Invalid/forbidden IDs are discarded. Preferences tolerate corrupt or unavailable storage. Clearing recent sections and intentionally removing all favorites work.
- A calmer home workspace, short tool descriptions, and responsive header/drawer/dialog. The parent's overview and existing homework workflow are preserved.
- Navigation uses the existing visible-section rules, honours the unsaved-work cancellation event, and restores keyboard focus. English/French remain selected during navigation. No dependency or production permission was added.

## Evidence

- `npm test`: 133 tests across 17 files passed. Thirteen additional cases cover role visibility, invalid and empty preference data, persona isolation, storage failure, persistence, the six-pin limit, exact lesson dispatch, query handoff, keyboard focus, French/accent search and cancellation.
- An unrestricted repeat run hit the existing backup CLI test’s five-second timeout under concurrent worker load (132/133 passed). A two-worker repeat then hit the same limit in an existing multi-step company form test. That form test passed in isolation in 1.1 seconds. Vitest now runs files with one worker to keep memory/CPU contention predictable on small machines; assertions and timeouts are unchanged. The complete suite was rerun with that setting.
- `npm run typecheck`: passed. `npm run build`: passed after final responsive and repeated-search corrections; client and server artifacts compile. No large-chunk warning. The campus entry is about 352 kB (111 kB gzip); existing lazy lesson/catalog chunks remain separate.
- `npm run lint`: zero errors; the three pre-existing Fast Refresh warnings in UI primitives remain.
- Browser checks at 1280, 768, 390 and 320 pixels: header, homepage and launcher; mobile drawer; parent overview; teacher/child/adult tool visibility. Fixed a mobile header overlap and tablet flex-width overflow discovered during these checks. Final inspected layouts have no horizontal overflow.
- Browser interactions: starred gallery shortcut survives reload and was restored to the prior unpinned setting; Customize/Escape returns focus; Ctrl+K opens focused search; Docker result opens its matching lesson; complete search receives the query, including a repeated query after editing the search page. French labels remain French. No errors/warnings in the inspected browser console.
- Demo profile restored to adult, language to English, temporary viewport override reset. No learner records, submissions, gallery media, notes or integration secrets were changed by browser QA. New browser preference keys contain section IDs only.

## Important files and source material

`WorkspaceHub.tsx` and `workspace-hub.css` implement the workspace and launcher. `campus-navigation.ts` centralizes existing navigation visibility and descriptions. `use-workspace-preferences.ts` handles browser preferences. `CampusApp.tsx` connects navigation/search; `StudioPanel.tsx` accepts the initial search. README now explains these controls.

Consulted `docs/index.md`, `docs/design/brand.md`, `docs/product/campus-expansion.md`, `docs/product/site-review.md`, `docs/users/permissions-matrix.md`, `ARCHITECTURE.md`, accepted ADR-003, deployment guidance and `docs/UNKNOWN.md`. Official Microsoft Edge Workspaces and Google Workspace references are linked in the design scope.

Assumption: useful productivity/navigation patterns belong in the existing local campus; they do not change the organization's services or imply an affiliation with Microsoft/Google. Browser preferences are not cross-device account synchronization. Existing production identity/private hosting and external integration activation remain unresolved as recorded in `docs/UNKNOWN.md`. A push to `codex/campus-local` updates the repository and runs CI; it does not publish this branch to main-branch GitHub Pages.
