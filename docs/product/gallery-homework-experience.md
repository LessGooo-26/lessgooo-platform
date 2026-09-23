# Gallery, language and homework experience

CONFIRMED — requested by the owner on 2026-09-23. The owner explicitly selected both gallery and personal campus backgrounds.

## Photo galleries

- Every completed photo displays a label (falling back to its original filename) and a date.
- The owner can edit a label of up to 160 characters and an optional calendar date. A photo date is entered manually; no capture date is guessed from the file. Without one, display the original upload date. Editing never changes that upload date or the original bytes.
- Photo options provide two independent choices: gallery background/cover and personal campus background. Both can be reset.
- A gallery background must be a completed image owned by the gallery owner and currently in that gallery. Moving it out clears the background reference and preserves the file.
- A personal background may use any completed image the persona can already view. It creates no sharing permission. Read access is checked before returning the preference and again when serving the image. It is hidden if sharing is revoked.
- Existing gallery visibility and owner-only editing remain in force. Viewers can set a personal background but cannot edit someone else’s labels, dates or gallery appearance.
- Optional fields and additive SQLite columns keep existing files, profiles and galleries readable. No new dependency or external image service is needed.

## Language

The selected English or French interface persists when navigating to homework, opening an activity or feedback, switching sections and reloading. Interface labels, dates and unchanged bundled homework examples follow the selected language. The switch retains native language names to remain recognisable.

Personal names, photo labels, filenames, gallery names, learner submissions and teacher-written feedback remain as authored. Only exact, unchanged bundled examples are translated; no user work is sent to a translation provider or rewritten in storage. Proper tool and product names remain unchanged.

## Homework

- Three views: To do, Waiting for feedback (To review for a teacher), and Completed.
- Named cards show the next action, with revisions first and remaining lessons in module order. Initially show six cards, with an explicit option to show more.
- Opening an activity from homework goes directly to its practice tab. Feedback has a clear submitted-work section and a return-to-activity action for revisions.
- A successful submission opens the saved work immediately, showing its waiting status and the existing attachment action.
- Teachers start with pending reviews and can filter by learner. Parents see the child’s activities and feedback; they cannot submit as the child.
- The dashboard shows three named next steps and one link to all homework, replacing the dense numbered grid.
- Earlier submissions and attachments remain reachable through the collapsed Other attempts list in the saved-work view.
- A lesson appears once per learner. The latest submission remains available, including a new attempt after an earlier validation. Progress still counts distinct, in-track lessons with at least one validated submission; duplicates and unknown lesson IDs cannot inflate it.
- Existing submission, review and attendance rules are unchanged. No deadline, grade or completion guarantee is invented.

Implementation choices: optional manual photo date, a light overlay on personal backgrounds for readability, and progressive disclosure of photo controls. Production authentication and institutional rules still follow the unresolved items in docs/UNKNOWN.md and ADR-003.
