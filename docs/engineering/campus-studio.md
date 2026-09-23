# Local video studio and service intake

This extends the local demo (ADR-003), not the public authenticated backend.
See [confirmed scope](../product/campus-studio.md).

## Video import

`POST /api/studio/import` accepts a public HTTPS file URL, an optional filename,
and confirmation that the user may download it. The persistent queue streams
one download at a time to a private temporary file, then stores 4 MB chunks in
SQLite. The browser remains usable and shows progress. Maximum file size:
200 MB; maximum import time: ten minutes. Cancellation removes unfinished data.
Server restart marks unfinished imports for retry. Original files are kept.
The download worker runs separately from the speech worker, so a long transcript
does not block a new file import.

DNS results and every redirect are validated; only public IPv4 on HTTPS port
443 is supported, and the request is pinned to the validated address. No cookies
or authorization headers are forwarded. Web pages, manifests and compressed
HTTP responses are refused. This is a direct-file importer, not a YouTube/Google
page extractor, DRM remover or login bypass. Completed jobs clear their source
URL; it is never returned in the browser job list.

## Automatic speech recognition

The optional engine is `faster-whisper==1.2.1` (MIT) with the multilingual base
model, CPU int8 and four threads. The web application adds no npm dependency.
Python packages and model weights are ignored under `.local-data`.

Set up a project-local Python 3.12 environment at
`.local-data/transcription-venv`, install `scripts/transcription-requirements.txt`,
then run `scripts/setup-transcription.py` with that Python. Setup downloads model
weights from the model publisher. Inference is offline: no recordings leave the
computer. The Windows installation has been configured and tested.

Optional overrides: `CAMPUS_TRANSCRIPTION_PYTHON` and
`CAMPUS_TRANSCRIPTION_MODEL`. Without a local engine/model, the UI reports that
transcription is unavailable; uploads and downloads still work. The standard
Docker image does not include Python or model weights. To enable it there, use a
derived image with the Python requirements and mount the downloaded model; set
both paths explicitly. Do not bake recordings, keys or the local database into
an image.

Recognised uploaded/imported videos are queued automatically, one inference at a
time. Recordings need an audio track and a known duration up to two hours. Each
job has a one-hour execution timeout. Failed jobs can be retried by the owner.
The database stores timestamped segments, language and status. TXT/VTT downloads,
caption tracks, clickable timestamps and search inherit the source file's current
visibility. Automatic transcripts are labelled drafts. They are not certified
transcriptions and do not replace human review.

## Service intake and alerts

The live [public request form](https://docs.google.com/forms/d/e/1FAIpQLSeXMG4O9HBeEPy6rty_wLkPMXgmyz9lqpOhVdll3URqm4XKrg/viewform)
belongs to `lessgooo.ai26@gmail.com`. It uses the original logo, a LESSGOOO blue
accent, bilingual questions and email validation. It accepts anyone with the link;
responses are not shown to other respondents. A private response spreadsheet is
linked. Google Forms email notifications are enabled; delivery of the clearly
marked test request was verified in the owner's Gmail on 2026-09-17.

Manage responses through the link in Services & requests. Public responses stay
in Google Forms/Sheets; they are not synchronised into the local demo inbox.
The local demo intake has separate persisted requests, contact consent, duplicate
prevention, teacher-only status/notes updates, a new-request badge and in-app
alerts while the campus is open. Private follow-up notes are excluded from learner
responses. Neither intake books an appointment or charges a client.

Consultation price, currency, duration, availability and live merchant approval
remain pending. No fee or payment guarantee has been invented.

## Meetings and search

Existing class/coaching storage retains the `zoom` field for compatibility; it
now validates Google Meet meeting codes as well as Zoom participant links. Host
Zoom links remain blocked. Meeting creation and calls open the provider website.
Calendar downloads, attendance and replay links remain available.

Search combines visible lessons, homework, classes, help, notes, media, galleries,
transcripts and curated resources. Google/Google Images open only after clicking
a search link; only the entered query is sent, not campus records.
