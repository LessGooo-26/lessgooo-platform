# LESSGOOO Knowledge Base

This directory is the authoritative product and organizational knowledge base
for the LESSGOOO application.

DevSecOps teaching project requested on 2026-09-18: [scope](product/devsecops-project.md),
[private lab decision](decisions/ADR-004-private-devsecops-lab.md), and the
[step-by-step README](../README.md).

Campus expansion approved on 2026-09-16: [learning, career and integrations](product/campus-expansion.md).
Studio and service intake requested on 2026-09-17: [scope](product/campus-studio.md) and [operation](engineering/campus-studio.md).

Guided lessons and professional service briefs requested on 2026-09-23: [scope](product/learning-experience.md) and [validation](quality/learning-experience-validation.md).

Photo labels, backgrounds and a simpler bilingual homework experience requested on 2026-09-23: [scope](product/gallery-homework-experience.md) and [validation](quality/gallery-homework-validation.md).

## Purpose

Codex and human developers should use these documents to determine what
LESSGOOO is, how it operates, what the application should do, and which facts
are confirmed.

## Reading order

1. `organization/lessgooo-overview.md`
2. `organization/mission-vision-values.md`
3. `product/product-vision.md`
4. `product/app-scope.md`
5. Relevant domain document
6. `../ARCHITECTURE.md`
7. Relevant accepted ADRs
8. `UNKNOWN.md` when information is missing

## Sections

### organization/
Institutional identity, terminology, partners, locations and operating context.

### business/
Business model, services, audiences, pricing rules and revenue-related rules.

### programs/
The authoritative description of training programs.

### users/
Actors, roles, responsibilities and authorization boundaries.

### product/
Digital-product scope, features, workflows, user stories and non-goals.

### design/
LESSGOOO brand, UX and accessibility principles.

### engineering/
Engineering standards, testing, Git and deployment conventions.

### decisions/
Architecture Decision Records (ADRs).

### plans/
Roadmaps and active implementation plans.

### quality/
Definition of done and acceptance criteria.

## Truth priority

When documents conflict, do not silently choose.

Use this order as a starting point:

1. latest ACCEPTED ADR for architecture;
2. latest explicitly approved product/business requirement;
3. program specification;
4. permissions specification;
5. existing implementation;
6. examples and README material.

If a conflict affects business behavior, record it in `UNKNOWN.md`.

Courses and company services expanded on 2026-09-23: [catalog scope](programs/course-service-catalog.md).

Whole-site review requested on 2026-09-23: [scope and findings](product/site-review.md).

- Whole-site validation and feature coverage: [quality/site-review-validation.md](quality/site-review-validation.md).

Campus workspace design inspired by Microsoft/Google patterns: [scope](product/workspace-interface.md) and [validation](quality/workspace-interface-validation.md).
