# Courses and company services

Status: CONFIRMED scope, requested by the owner on 2026-09-23.

LESSGOOO offers these nine areas both as courses and as services to companies:

1. DevOps
2. Cloud
3. Cybersecurity
4. Linux system administration
5. Website development with AI
6. Modern secretarial practice
7. AI infographics
8. AI graphic design
9. AI automation

AI infographics means explaining information, data or a process visually. AI graphic design means creating visual communication such as posters and brand materials. They are separate catalog entries.

## Campus experience

Each entry explains the subject in everyday language, who it helps, the role and practical outcome, the knowledge, equipment and accounts needed to begin, four learning phases with a concrete starter exercise, a final project and success checklist, and an official documentation link. A company section explains the service, example deliverables and information to prepare. English and French are authored independently.

Prerequisites are preparation guidance for these introductory outlines, not formal admissions rules. Advanced labs may need additional equipment or access. Cloud and AI subscriptions are not included or assumed free. Learners can begin with local tools and sample data. Course outlines and starter activities must not be described as fully authored, assessed lesson libraries.

The catalog sits alongside the existing enrolled lesson library. Existing DevOps and Kids enrollment, submissions, custom lessons, access and progress are preserved. Related lessons appear only when already present in the viewer's permitted lesson list. Course inquiries do not enroll a student.

Training and company project requests can select an area. Company projects require one and show area-specific brief questions. Selected areas persist with the local request and are shown in the teacher inbox. Existing requests without an area remain readable. A duplicate open request is scoped to email, service and area. Company requests retain existing service-request permissions (no child submissions; teacher-only handling).

## Unconfirmed commercial details

Prices, duration, dates, formal entry qualifications, certifications, software licenses and delivery commitments remain UNKNOWN. A request is an inquiry, not a booking, payment or service-level agreement. Company deliverables are examples to scope, not guaranteed package inclusions. Production credentials and private company data do not belong in the demo form. The existing external public form is unchanged; the local campus stores the expanded intake. The public website also offers a browser-only draft of the same tailored questions; visitors review, copy/download or open their own email application and send it themselves. The static site neither stores nor sends requests.

## Implementation source

Course text: src/campus/lib/course-catalog.ts. Request validation: src/campus/lib/studio.ts and service-intake.ts. No new runtime dependencies, enrollment types or database migrations are required.

Validation: [checks and scope boundaries](../quality/course-catalog-validation.md).
