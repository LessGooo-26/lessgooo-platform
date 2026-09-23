# Whole-site requirements review

Owner request: 2026-09-23. Review and improve the public website and existing campus against confirmed requests.

## Confirmed implementation scope

- Present the same nine course areas and company services on the public website and campus, with descriptions, prerequisites, practice phases and contact paths.
- Complete public information pages from approved program and organization documents. Provide practical FAQ and enquiry guidance without inventing commercial terms.
- Use the selected English/French language consistently in public lesson previews as well as the campus. User-authored data stays unchanged.
- Let visitors prepare a detailed enquiry, review it, copy/download it or open their own email application. Static hosting must not claim to store or send it. The existing external Google Form remains available and unchanged.
- Make campus search include the new course areas, labels on photos and direct opening of lessons, homework and sessions already visible to the persona.
- Keep public routes refreshable on GitHub Pages; preserve current enrollment, saved work, gallery access and all backend permission boundaries.
- Review the other established features with existing domain/integration tests and browser checks; record the evidence and remaining gaps.

## Boundaries

This is an improvement of approved public content and the local campus. SECURITY-001 still governs real multi-user accounts and public backend hosting. Live payments, general AI assistance and Drive authorization depend on the owner's external configuration. Their pending state must remain visible. No real learner records, production secrets, cloud purchases, automatic external messages or new academic/commercial promises are authorized by this review.

The nine new course profiles contain introductory outlines and starter activities. They do not establish nine complete assessed curricula or new enrollment tracks. The existing 57-lesson library remains the authored practice library.

## Review findings before changes

- Public program information was disconnected from the new nine-area catalog; several public pages had only an introduction.
- English public lesson previews still showed French seeded lesson text and old resource URLs.
- Public contact text said contact information was unavailable even though an approved email existed.
- The public/campus language stores had independent in-memory values despite sharing a preference key.
- Campus search omitted new course areas and photo labels, and lesson/homework results opened only a section.
- Campus navigation replaced browser history, preventing expected Back navigation between sections.

Validation and feature coverage will be recorded in docs/quality/site-review-validation.md.
