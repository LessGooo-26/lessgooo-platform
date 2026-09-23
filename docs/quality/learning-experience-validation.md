# Learning experience validation — 2026-09-23

## Local checks

- `npm test`: 84 tests in 13 files passed, including the six service schemas,
  missing/mismatched fields, consent, country/time zone, conditional phone,
  privacy, bilingual labels, error recovery, legacy requests, guide coverage,
  correct Python/Ansible/Jenkins references, attached project callback, quiz retry,
  custom lessons and reduced-motion stepping.
- `npm run typecheck`: passed.
- `npm run lint`: passed with no errors; three existing
  React Fast Refresh warnings remain in shared UI components.
- `npm run build`: passed. Vite reports a campus chunk size advisory above 500 kB;
  the authored guides are a separate lazy-loaded reader chunk (about 66 kB gzip).
- `git diff --check`: passed.

## Browser verification

Used the compiled application at loopback port 4183 and a separate synthetic
SQLite directory `.local-data/qa-learning-20260923`, not the user's saved records.

- Desktop 1280x720: chapter library, French Python lesson, four-tab reader and SVG
  flow rendered correctly.
- Mobile 390x844: two-column reader tabs, single-column service questions, native
  country selector and wrapped explanatory text remained usable.
- Tablet 820x1180: switched to the learner view; arrow-key tab navigation selected
  Guided project; submission opened with the Python lesson title.
- A synthetic request was submitted and the instructor inbox showed Cameroon,
  Africa/Douala, French reply preference and all four training answers.
- A clearly marked synthetic submission saved through the lesson reader.
- No warning/error console messages were recorded during this browser walkthrough.
- Responsive viewport override was restored after testing.

## Reference checks

A bounded HTTP check covered 72 unique documentation URLs. The initial run found
66 HTTP 200 responses, two moved LearnFree/GCFGlobal pages returning 404, two GNU
403 responses, a GNU timeout and a Canva 403. The two moved links were replaced
with the publisher's current Windows Basics and Internet Safety for Kids series.
Canva's canonical Design School URL was confirmed using web retrieval. GNU URLs
are official manuals but automated retrieval was blocked/rate-limited; those
responses do not establish that the manuals are unavailable to a browser.

Representative primary documentation was also read for Python, Docker, Git,
GitHub Actions, GitLab, Jenkins, AWS, Terraform, Ansible, Kubernetes, Helm, Argo CD,
Prometheus, OpenTelemetry and SRE. Resources are links; copyrighted tutorials are
not copied into lessons. YouTube links were checked for four existing videos;
older publication dates are visible and additional video searches are explicitly
not presented as reviewed recommendations.

## Not executed

No AWS resources, Kubernetes clusters, paid products or production services were
created during this work. The full catalog's external lab commands were not all
executed. Cloud access, tool versions, capacity and costs must be checked in the
learner's authorised environment. No external public form, email or payment was
sent. The local automated tests and walkthrough do not prove production readiness
or replace instructor review of learner work.
