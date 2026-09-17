# Media, profiles and bilingual campus — 2026-09-17

Implemented: chunked video/file uploads with progress and cancellation, native
video playback and HTTP range seeking, direct downloads, purpose-based photo
galleries, editable own profiles and photos, a parent home page, English by
default and a remembered French choice. The original logo and derived six-colour
palette are used throughout. The application remains a local demonstration.

Validation:
- `npm run lint`: passes, with the three pre-existing Fast Refresh warnings.
- `npm run typecheck`: passes.
- `npm test`: 56 tests pass. New checks cover media hashes, cross-chunk ranges,
  suffix ranges, HEAD, invalid ranges, unsafe inline formats, ownership,
  gallery sharing changes during upload, cancellation, parent uploads versus
  homework rights, profile persistence, and language changes without draft loss.
- `npm run build`: static frontend and Node backend compile.
- `npm run backup`: existing data and the separate encryption key backed up
  before restarting the main local server. No secrets or databases are committed.
- Real browser test in an isolated database on port 4175: upload a 12-second
  H.264 MP4, load metadata, play to completion, seek and trigger a download.
  Fetching its download URL produced the same SHA-256 as the original file.
- Browser gallery test: create a named orange gallery, add a purpose, upload
  a PNG and display the photo and download link in that gallery.
- Browser profile test: change name, biography and image; save and reopen.
  The saved data and image remain available. The greeting uses the saved name.
- Parent view: direct homework, classes, photos and help actions; remembered
  view on reload. Mobile navigation opens and supports keyboard access.
- Responsive checks at 390, 820 and 1280 pixels: no horizontal overflow;
  the original logo loads and remains visible in the compact header.
- English/French: labels, forms, explanations, authored courses, project
  catalog, dates and screen-reader labels translated locally. Personal notes,
  names and profile content stay as written.

Files: `PersonalSpace.tsx`, `personal-space.css`, `LanguageSwitch.tsx`,
`lib/language.tsx`, translation catalogs, `CampusApp.tsx`, `WorkspacePanel.tsx`,
`workspace-api.ts`, `workspace-store.ts`, `media-stream.ts`, and the media/profile
regression tests. No new runtime dependencies.

Sources consulted: `docs/index.md`, product/campus-expansion and product-vision,
design/brand, users/roles and permissions-matrix, engineering/local-campus,
engineering/testing and git-workflow, quality/acceptance-criteria and
definition-of-done, ARCHITECTURE, UNKNOWN, ADR-001, ADR-002 and
ADR-003-local-campus-demo. Product, UI, testing and deployment skills applied.

Remaining: OpenAI integration has not been implemented or connected because no
API key is configured and the secure account/key setup decision is pending.
Real authentication, institutional permissions and live external-service
activation remain separate from this local demonstration. Video codecs depend
on browser support; unsupported formats still download in their original form.
