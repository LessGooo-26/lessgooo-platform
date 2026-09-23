# ADR-004 — Private DevSecOps teaching lab

Status: ACCEPTED for the teaching/documentation scope requested on 2026-09-18.

## Decision

Keep ADR-001 static hosting and ADR-003 local demo boundaries. Provide Compose
and Kubernetes assets for the existing Node application. Use one replica,
Recreate updates and persistent SQLite storage. Reach a ClusterIP Traefik
service through localhost port-forward. Preserve Host/Origin checks; Kubernetes
probes send the allowed Host header.

Use GitHub Actions for security/quality gates, scanned images, SBOMs and protected
publication. Argo CD reconciles a reviewed immutable image digest. Prometheus,
Grafana and a blackbox exporter observe cluster, ingress and HTTP health. No
application /metrics endpoint is claimed.

## Consequences

This is a private synthetic-data lab, not an institutional multiuser deployment.
EKS costs money; provisioning is an explicit operator step. Traefik has no public
load balancer. Argo CD and Grafana are private. SQLite is not horizontally scaled;
updates cause interruption. External integrations and speech models are optional
and are not configured by the lab. No credentials or real data are seeded.

Microservice decomposition, production identity, public TLS/DNS, shared storage,
high availability and a production secret provider need subsequent decisions.
SECURITY-001 remains open.
