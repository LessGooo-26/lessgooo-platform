# Course and company-service catalog validation

Date: 2026-09-23.

## Implemented

Nine bilingual course profiles share one structured catalog with nine corresponding company offerings. Profiles contain plain-language descriptions, audiences, professional use cases, topic-specific and common preparation checklists, four starter phases, a practical project, success criteria and official documentation links. Infographics and graphic design have separate aims and briefs.

The Courses page has accessible catalog and lesson-library tabs. Existing lessons, custom content, enrollment tracks and grading are unchanged. Related lessons are taken only from the viewer's visible lesson list. The new profiles are introductory outlines and activities, not nine fully authored assessed curricula.

Training inquiries carry the selected area. Company projects require an area and its specific answers. The server validates the area and rejects unrelated answers. The inbox displays the area; duplicate detection includes it. Legacy requests without an area remain readable. Company requests retain existing permissions and local-demo storage. The external Google Form is unchanged.

## Source of truth consulted

- docs/index.md; docs/product/product-vision.md; docs/product/app-scope.md
- docs/product/learning-experience.md; docs/product/campus-studio.md
- docs/programs/devops-cloud-ai.md; linux.md; web-development.md; modern-secretariat.md; kids.md
- docs/business/services.md; docs/design/brand.md; docs/UNKNOWN.md
- ARCHITECTURE.md; docs/decisions/ADR-003-local-campus-demo.md
- Owner-confirmed expansion: docs/programs/course-service-catalog.md

## Automated validation

- npm test: 110 tests passed in 15 files.
- npm run typecheck: passed.
- npm run lint: zero errors; three existing Fast Refresh warnings in shared UI primitives.
- npm run build: passed. Existing large-campus-chunk advisory remains; no new dependencies.
- Final accessibility and French-message edits: affected catalog and intake UI tests rerun.
- git diff --check: passed.

Regression coverage includes all nine bilingual profiles, keyboard open/close and focus restoration, accent-insensitive search, selected-area handoff, visible-lesson filtering, adaptive company questions, contact-detail retention, request payloads, area-specific server validation, storage, duplicate behavior, child rejection, requester isolation and teacher-only request handling.

## Browser validation

Local dev server at http://localhost:5173/campus.html#courses. Checked desktop, 820px tablet and 390px mobile; no horizontal overflow in catalog or mobile dialog. Checked English/French course titles, French search, four-phase detail, web-course-to-company-form handoff, correct selected area and translated questions, catalog/lesson tab switching, and no browser console errors. Viewport override reset and original English preference restored. No test request was saved to the real local database; storage tests use isolated in-memory stores.

## Assumptions and remaining unknowns

The requested change concerns the campus Courses and Services screens. Prerequisites are introductory preparation guidance, not official admissions criteria. Starter projects use fictional/sample data. No paid cloud or AI account was provisioned. Pricing, schedules, formal admissions requirements, certifications and commercial commitments remain UNKNOWN. Official links point to tool documentation; their language can differ from the campus. Some documentation sites restrict automated retrieval.
