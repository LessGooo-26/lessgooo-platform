# Campus studio validation — 2026-09-17

Changes: Google Meet participant links alongside Zoom; video link imports;
automatic offline transcripts and TXT/VTT exports; campus/web search; colourful
navigation; corrected owner identity; local service inbox and public Google Form.

Source of truth consulted: docs/index.md, product/campus-expansion.md,
product/campus-studio.md, business/services.md, business/pricing.md,
design/brand.md, users/permissions-matrix.md, ARCHITECTURE.md, accepted ADRs,
UNKNOWN.md and the product/UI/testing/deployment skills.

Automated validation: `npm test` — 63 tests passed; `npm run typecheck` — passed;
`npm run lint` — no errors, three pre-existing Fast Refresh warnings. One local
test run reported a worker termination timeout after passing all tests and
returned exit code 0; CI separately checks the committed revision.

Functional verification on isolated localhost:4175 storage:
- Generated a short spoken cloud lesson and uploaded its MP4 through the API.
- The automatic worker produced the spoken text, language and timestamps offline.
- Browser transcript expansion showed the text; clicking 0:08 moved playback to
  8.56 seconds. The video had a caption track. TXT and VTT endpoints returned 200.
- Imported the MDN CC0 flower MP4 from its HTTPS link: 1,128,375 bytes saved.
- Local service submission returned a receipt and increased the teacher inbox count.
- Direct public service form submission saved one explicitly marked TEST response.
- Google Forms showed one response and a linked private spreadsheet. Its alert
  arrived in lessgooo.ai26@gmail.com and was verified in Gmail.
- The original logo fits the public form header without cropping its wordmark.
- English navigation displays Carles in his profile and no invented greeting.
- Desktop, 834 px tablet and 390 px phone layouts were inspected. The phone and
  tablet had no horizontal page overflow. English/French switching and the
  Google search URL were verified; no browser console errors were found.
- `npm run build` and `npm run backup` passed. The main app was restarted after
  backup; test uploads and requests remain in the separate QA database.

Important files: server/studio.ts, server/safe-download.ts, server/http.ts,
scripts/transcribe.py, src/campus/StudioPanel.tsx, src/campus/studio.css and the
new studio tests. Existing profile/media/class adapters remain in use.

Limits: imports support public direct HTTPS files up to 200 MB, not search/watch
pages. Transcript quality depends on speech; drafts need review. Live calls open
Google Meet/Zoom. Public enquiries and alerts work through Google Forms; those
responses are not mirrored into the local demo. Paid consultations await confirmed
commercial details. The campus itself remains a local demo, without production
authentication or public backend hosting. General chat AI setup remains pending.
