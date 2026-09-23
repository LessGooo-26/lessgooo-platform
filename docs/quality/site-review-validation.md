# Whole-site review — 2026-09-23

Scope: [owner request and findings](../product/site-review.md). This report distinguishes working code, automated evidence and external activation. It does not claim the local demonstration is production ready.

## Changes delivered

- Connected the public site and campus to the same nine-area course/service catalog. Added searchable public cards, refreshable course detail URLs, prerequisites, practice phases, expected evidence, related authored lessons and documentation links.
- Added company services, getting-started guidance and FAQ. Expanded About, Kids, IoT, Languages and collaboration pages using approved facts. Removed contact placeholders and internal source-of-truth phrasing from visitor-facing text.
- Added public enquiry drafts using the existing tailored question model and validation. Country, time zone, contact preferences, course/service context and consent travel into a readable brief. Review/edit, copy/download and user-controlled email preparation work without a backend. The existing Google Form stays separate.
- Shared English/French selection across public content and campus, including other same-origin tabs. Public lesson previews now translate the authored text and use subject-specific documentation.
- Campus search indexes course areas and photo labels; selected course, lesson, homework and session results open directly. Other results explicitly open their section. Accent-insensitive search and a Show more action support larger catalogs.
- Browser Back/Forward now works between campus sections. Route changes dismiss stale detail dialogs. Public pages update titles and focus their content, skip links preserve routes, mobile menus close with Escape, and campus has one main landmark.
- Static-campus error guidance points visitors back to the usable public catalog.

## Requirements coverage

| Requirement | Evidence / remaining scope |
|---|---|
| Nine courses offered as company services | Shared bilingual data, public directory/detail routes, campus profiles, tailored company enquiries. These are outlines and starter activities, not nine full assessed curricula. |
| Helpful descriptions and prerequisites | Role, audience, equipment/accounts, four phases, final project, evidence and company preparation are visible per area. Commercial terms remain unconfirmed. |
| Rich lessons and attached projects | Existing 57-lesson library: illustrated flows, environment instructions, attached exercises, knowledge checks, interview answers and official references. Learning UI and curriculum tests pass. Browser checked direct opening of a Linux permissions lesson. |
| Simple homework and strict language | Existing six-card workflow, feedback, history and role-aware actions retained. Tests cover revisions, progress, older attachments and language. Browser checked French gallery → homework navigation and English restoration. |
| Photo labels, dates, gallery and personal backgrounds | Existing persistence, ownership, access revocation, moves and background-reset tests pass. No real gallery records or uploads were changed during this review. |
| Country and tailored service requests | Existing domain and server tests cover required questions, consent, company area, deduplication and private handling. New public tests verify context handoff, language changes, retained form values and no network transmission/storage on draft review. |
| Notes, slides, arbitrary files and videos | Existing regression tests cover private notes, revisions, upload order/limits, exact bytes, HTTP range seeking, safe download disposition and backup. No new live external download/transcription run in this review. |
| Careers, live classes, parent/teacher/child roles | Existing domain/workspace tests cover role access, career consent, meeting links, attendance and private data. No new permissions or account types introduced. |
| DevSecOps capstone and deployment documentation | Existing ten-phase project and README remain. Tests cover discoverability, French phases and child restrictions. CI checks security, container runtime and SBOM. No AWS resources provisioned. |
| Drive, live payments, general AI assistant | Prepared integration code and simulated tests are not proof of live activation. Drive consent, merchant activation, AI provider/key setup and SECURITY-001 remain external/owner decisions. |

## Validation

- npm test: 120 tests passed across 16 files. New interaction tests preload lazy modules so cold Vite transforms do not consume the interaction timeout; no assertions or existing checks were removed.
- npm run typecheck and npm run build: passed. Production client/server compile successfully; no new dependencies. Course details, enquiry UI and the lesson reader use lazy chunks.
- ESLint: zero errors, three existing Fast Refresh warnings in campus UI primitives.
- git diff --check: passed.
- Browser: desktop public catalog and campus, 390px course detail/contact/homework, and 820px contact/homework checked without horizontal overflow. Course → company enquiry preserved selection; direct campus course/lesson search and browser Back worked. French homework stayed French after gallery navigation. Public keyboard skip and mobile Escape have automated regression coverage. Console checks showed no errors on the inspected flows.
- Browser preference restored to English; temporary viewport overrides reset. No original learner records, work, gallery data or integration secrets were modified. Forms used synthetic data in automated tests; no message was sent.

## Sources and limits

Consulted docs/index.md; organization overview, mission/values and partners; product vision, scope, workflows, campus expansion/studio, learning and gallery/homework experience; program catalog, Kids, IoT and languages; business services; role/permission documents; design/brand; architecture and accepted ADRs; deployment/testing quality guidance; docs/UNKNOWN.md.

Assumption: improve the existing public website and local campus within their accepted architecture. Public hash routes continue to support static GitHub Pages. Pushes to codex/campus-local run CI but do not publish the branch to the main-branch Pages site.

Remaining substantive work: fully author and assess the new course areas beyond their outlines; select production identity/authorization and private hosting; finish external account activation; confirm current schedules, prices, qualification/certification claims and delivery commitments. These must not be presented as completed features or institutional promises.
