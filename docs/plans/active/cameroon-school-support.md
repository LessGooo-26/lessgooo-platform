# Cameroon school support — implementation plan

Owner scope: ../programs/school-support.md. Latest request adds a major school-support module; earlier campus work is committed at 46da887. Work on codex/campus-local and push at the end. Do not reset local data.

- [x] Read repository product/permission/architecture/brand rules; ask billing-period and timetable clarification.
- [x] Inspect official MINESEC/GCE/OBC and educational resources.
- [x] Record research sources and boundaries; implement bilingual catalog/schema, class/subject coverage, original chapter/exercise bank and transparent guidance.
- [x] Implement transactional school store/API, optimistic catalog changes, attempts/progress, expiring session presence and media links using existing file storage.
- [x] Build public/campus school space: simple class selection, learning steps, timetable, library, quiz/challenges, learner/parent progress, guidance.
- [x] Build accessible settings forms for classes/subjects/chapters/questions/resources/prices/timetable; export/import and status/coverage controls.
- [x] Connect public programs/nav, campus tools/search, docs and README.
- [x] Add domain/API/UI regressions, run lint/typecheck/test/build; inspect mobile/tablet/desktop and keyboard.
- [ ] Review diff, commit, push, verify remote and CI. Report implemented content counts and remaining unverified completeness/production requirements honestly.

Research references (checked 2026-09-23):
- https://www.minesec.gov.cm/web/index.php/fr/systeme-educatif/progammes-officiels (both subsystems + general/technical/teacher training)
- https://files.minesec.gov.cm/folder/90/ENSEIGNEMENT_GENERALl and https://files.minesec.gov.cm/folder/48/GENERAL_EDUCATION (linked by MINESEC)
- https://www.minesec.gov.cm/web/index.php/fr/systeme-educatif/manuels-scolaires (page currently labels 2023/24; not proof of current 2026/27 edition)
- https://minesec-distance.schoolfaqs.net/ (by subsystem/cycle/class; lesson, laboratory, exam resources; external portal bearing MINESEC attribution)
- https://minesec-distance.schoolfaqs.net/revision (BEPC, GCE OL/AL, TVEE, mock exam collections; do not relabel mocks official exams)
- https://camgceb.org/examinations/timetables/ (2026 practical timetable visible), https://camgceb.org/past-questions-and-others/
- https://officedubac.cm/ (2026 exam calendar, 2026/27 school calendar)
- https://officedubac.cm/wp-content/uploads/2025/12/2026-CALENDRIER_EXAMENS.pdf
- https://officedubac.cm/wp-content/uploads/2026/09/Calendrier-Scolaire-Cameroun-2026-2027.pdf
- https://support.khanacademy.org/hc/en-us/articles/360030753412-Why-Mastery-Learning-by-Sal-Khan (practice with feedback/retry)
- https://nrich.maths.org/topics-mathematics-secondary-students (topic-based challenging problem solving)
- https://phet.colorado.edu/fr/ (interactive science/maths)
- https://www.minesup.gov.cm/index.php/direction-de-lassistance-et-des-oeuvres-universitaires-daou/ (guidance authority, no invented admissions)
- https://schoolap.com/search (simple search), https://sujetexam.com/ (exam/class/year browsing; no copies imported).

Engineering coverage delivered: 26 general classes, 24 subject descriptions, 24 original chapters, 48 explained questions, four generated-practice topics and 20 resource entry points. See ../quality/school-support-validation.md and ../product/school-support-guide.md.

Outstanding content/product decisions (not claimed complete):
- [ ] Confirm billing period, teaching start/place and subject-by-class timetable.
- [ ] Obtain and validate complete current curricula, technical streams and prescribed-book lists.
- [ ] Add and educationally review the remaining chapters, exercises, exam sessions and authorised books/recordings.
- [ ] Resolve SECURITY-001 before real accounts, private learner data or public multiuser backend deployment.
