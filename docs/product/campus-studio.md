# Campus studio and service requests

CONFIRMED — owner request, 2026-09-17:
- The owner's name is Carles. Remove hard-coded personal greetings and invented instructor names.
- Live classes, video imports by link, automatic video transcripts, campus and online search.
- A colourful, simple bilingual workspace, using the existing LESSGOOO logo palette.
- A service request page, owner alerts, and paid direct consultations.

Consultation amount, currency, duration and availability remain UNKNOWN. Do not
take payments or promise a booking until those details and the live merchant
account are confirmed. An enquiry is not a booking or an employment guarantee.

Implementation decisions for the local demo: Google Meet and Zoom participant
links open the provider's meeting page. No fake meeting room or embedded Google
Meet is claimed. Google Vids is a video editor, not a conferencing service.
Imports accept public HTTPS file URLs with a 200 MB limit. Search result pages,
sign-in pages, DRM streams and platform watch pages are not direct file URLs.
Users confirm their right to save a file. All DNS addresses and redirects are
checked, and connections are pinned to a checked public address.

Speech recognition runs locally with faster-whisper and a multilingual model.
No video or transcript is sent to an AI provider. Transcripts are drafts: names,
technical words and silence may be misrecognized. Files retain their existing
visibility rules. Transcripts follow file visibility; only the owner can retry.

Campus search uses only the current persona's visible records. Google search
opens a new tab and sends only the query deliberately submitted by the user.
Local service requests are visible in the teacher inbox. Public intake uses a
separate Google Form owned by lessgooo.ai26@gmail.com if successfully configured;
it must not expose the local demo API. No email delivery is claimed without
verification. Public authentication/hosting remains governed by ADR-003 and
SECURITY-001.

Sources checked: [Google Meet](https://workspace.google.com/products/meet/),
[Google Vids](https://workspace.google.com/products/vids/),
[faster-whisper](https://github.com/SYSTRAN/faster-whisper).
