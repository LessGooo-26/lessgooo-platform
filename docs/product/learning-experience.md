# Guided lessons and service briefs

Status: CONFIRMED product request from the owner on 2026-09-23.
Implementation details below describe the local campus demo; they do not establish
institutional academic or commercial policy.

## Requested experience

Services must ask for a country and enough relevant context to understand the
request. Each field needs its own question and explanation. Lessons must provide
useful illustrated explanations, goals, professional context, practical projects,
references and corrected interview questions without crowding the interface.

## Service intake

The six existing services retain their scope. All requests collect name, email,
country/territory (ISO region code), optional city/region, time zone, reply language,
preferred contact method, desired outcome, preferred timing and contact consent.
Phone is required only when the requester selects a phone reply. No street address,
password, identity document or child date of birth is requested.

| Service | Additional questions |
|---|---|
| DevOps/cloud training | Current role and experience, priority skills, equipment/environment, practice time |
| Interview preparation | Target role, interview format, experience/projects, optional interview date |
| Application support | Target role, target job market, available application materials, main obstacle |
| Children | Adult relationship, age range, interests, available adult/equipment support |
| Team workshop | Organisation, audience, topics, delivery constraints, optional budget |
| Consultation | Context, technical environment, attempts/results, expected decision, optional budget |

Questions and expectations are authored in English and French. Switching service
clears service-specific answers while keeping contact details. Validation rejects
missing required answers, unrelated question keys, invalid countries/time zones
and phone replies without a number. The instructor inbox shows the complete brief.
Earlier saved requests remain readable without inventing missing location data.

A preferred date is not an appointment. Consultation price/currency/duration still
remain UNKNOWN in `docs/UNKNOWN.md`. Submission does not book or charge anything.
Children still ask an adult to send a request. Existing local persona visibility
rules remain enforced by the server.

The public Google Form remains a separate intake channel. This change updates the
campus form, not the external Google Form or its response/email configuration.
The local demo explicitly requests synthetic information.

## Learning experience

The bundled catalog has 57 distinct lesson IDs: 39 DevOps and 18 Kids entries.
There are 52 topic guides and five legacy-ID aliases. A duplicate legacy
`kids-cloud` row is displayed once; saved records are not deleted or reset.

The library groups lessons into collapsible chapters, with one open action per
lesson. Search expands matching chapters. Learners still see their permitted
track, while instructors can access both tracks and their own custom lessons.

Each bundled topic guide includes:

1. A learning goal, an illustrated four-stage flow, role and realistic scenario.
2. Three guided practice steps with prerequisites, commands/file examples where
   appropriate, expected evidence and cleanup/recovery guidance.
3. Environment notes for local, Linux VM and cloud/staging adaptations. AWS lessons
   offer a no-account design activity and a separate authorised sandbox path.
   These checklists do not claim that every cloud implementation is executable
   verbatim. The existing README provides the full optional EKS capstone.
4. A misconception check with feedback, retry and expandable interview/explanation
   answers. These are practice aids, not grades or certification rules.
5. Subject-specific primary documentation, selected external YouTube references
   where available and a clearly labelled topic search for additional videos.

The four reader tabs are Understand, Guided project, Check yourself and Resources.
The project tab keeps the selected lesson ID when opening the existing submission
editor. Guided exercises provide a starting point; the original instructor task
and review criteria remain visible as the assignment to extend and submit.
Only the existing instructor review changes validation/progress.

Instructor-written explanations, tasks, criteria and stored URLs are not overwritten.
Custom lessons without a bundled guide retain their own content and HTTPS resource.
Bundled lesson documentation comes from `lesson-references.ts` to correct old generic
links without rewriting user data. Bundled guides are maintained in source files;
the instructor editor still edits the original lesson fields.

## Presentation and limits

Illustrations are small local SVG/icon compositions. Motion starts only after the
learner presses Play, stops after one pass, and becomes manual stepping for reduced
motion preferences. Videos are links, with no third-party iframe/autoplay requests.
English/French teaching content is local; learner text is not sent for translation.
The reader and full guide catalog load only when a lesson is opened.

The implementation follows ADR-003 and ADR-004: local/private synthetic-data demo,
static GitHub Pages website, no new production identity or permissions model.
Practice duration remains an estimate, not an approved timetable.

## Sources of truth

- [Campus studio](campus-studio.md)
- [Campus expansion](campus-expansion.md)
- [DevSecOps teaching project](devsecops-project.md)
- [Permissions matrix](../users/permissions-matrix.md)
- [DevOps program](../programs/devops-cloud-ai.md) and [Kids program](../programs/kids.md)
- [Private lab decision](../decisions/ADR-004-private-devsecops-lab.md)
- [Validation record](../quality/learning-experience-validation.md)
