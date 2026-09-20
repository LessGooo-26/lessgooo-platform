# LESSGOOO application architecture

Last reviewed: 2026-09-18. See [README](README.md#architecture-and-service-count)
for diagrams, dependencies and connection details.

| Surface | Runtime | Data | Deployment |
|---|---|---|---|
| Public website | React/TypeScript/Vite static files | Approved public content | GitHub Pages, ADR-001 |
| Campus demo | One Node HTTP process, React assets and API | Embedded SQLite and attachment chunks | Local process/Compose, ADR-003 |
| Teaching lab | Same campus container, one replica | Persistent SQLite volume | Private Kubernetes, ADR-004 |

The campus is a modular monolith: HTTP, domain rules, storage, studio workers and
integration adapters share one deployable runtime. There are **zero independent
business microservices and one application service**. SQLite is an embedded
library, not a database server. Transcription is an optional Python child process
and is absent from the standard container.

UI components do not own domain rules. Institutional copy is governed by docs/.
The API filters demo personas, checks local Host/Origin, and uses transactions
and optimistic versions. A persona selector is not authentication.

Traefik, Argo CD and observability are infrastructure, not business microservices.
Lab traffic enters through localhost port-forward. No public application load
balancer, DNS name or production identity system is provisioned.

Permanent backend/authentication selection remains
[SECURITY-001](docs/UNKNOWN.md). Containerization does not resolve authentication,
privacy, recovery or availability requirements. Do not scale SQLite to multiple
writers.
