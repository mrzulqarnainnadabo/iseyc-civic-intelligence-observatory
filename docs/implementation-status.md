# Implementation status — Civic Intelligence Observatory

**Repository:** mrzulqarnainnadabo/iseyc-civic-intelligence-observatory  
**Main SHA (checkpoint):** e28eb1a8649334e461736479020a93b84f5d2518  
**Status date:** 2026-11-14  
**Document purpose:** Accurate description of what is implemented, tested and still gated. Replaces the 2026-10-31 foundation-seed note.

---

## Product purpose

The Observatory is the public evidence workspace inside ISEYC’s civic intelligence infrastructure. It holds curated observations, source provenance, geographic context and institutional accountability information for Nigeria. It is not a national statistics office, a representative survey, a government performance monitor or a complete national evidence system.

It must remain useful when upstream feeds are empty, unavailable or invalid.

---

## What is implemented on main

### Application and experiences
- React + Vite + TypeScript application with production build pipeline.
- Public routes and workspaces for Overview, Departments, Evidence, Geography, Issues, Accountability, Briefs and Source coverage.
- Persistent, visible demonstration-mode warning when the demo adapter is active.
- Mobile-first layout with restrained institutional styling.

### Evidence and adapters
- CommunityRecord v0.1 published-only adapter (Civic Mandate). Fails closed on malformed or truncated feeds. No silent pulse fallback.
- Community Observation v0.1 published-only adapter (distinct from demands). Strict public-field allowlist and pagination checks.
- Evidence Vault v0.1 adapter for dual-reviewed, published source-linked records.
- INEC historical PVC / voter-register snapshot for all 36 states + FCT with explicit source-arithmetic warnings.
- Pilot national indicator files (including INEC CVR, Ekiti, Osun and nga-pilot-indicators).
- Source registry (`data/source-registry.json`).

### Contracts and governance
- Versioned contracts under `contracts/` and `docs/` (Community Observation, Evidence Vault, INEC public evidence, product operating model).
- Explicit evidence rules: published ≠ verified; community reports ≠ prevalence; national ≠ state/LGA; allocation ≠ expenditure ≠ delivery.
- Official ISEYC seal preserved (frozen blob SHA 18722abe3773ad096589461dc63332f03e60256c).

### Quality gates on main
- npm test, typecheck and production build are part of the verified workflow.
- Observatory quality CI gates present.

---

## Competing evidence work (open, not merged)

These branches contain additional national evidence snapshots. They must not be merged blindly.

| PR | Branch | Observations (national-source-snapshots) | Notable extra | Status |
|----|--------|------------------------------------------|---------------|--------|
| #42 | feat/unified-national-evidence-v2 | 91 | Strong BudgIT H1-2026 health spend coverage | Open |
| #39 | feat/verified-national-evidence-snapshots | 104 | State-budget source-coverage register (37 jurisdictions); Agora aggregates | Open |
| #38 | feat/nphcda-health-evidence-snapshots | — | NPHCDA primary-healthcare focus (draft) | Draft |
| #36 | feat/national-source-snapshots-and-department-evidence | — | Earlier expansion | Draft |

**Comparison notes (2026-11-14 audit)**
- Intersection of observation IDs between #42 and #39 is only 21 records.
- #42 emphasises per-state BudgIT health actual-spend observations.
- #39 emphasises Agora 2025 budget-implementation aggregates and selected state budget documents, plus a readiness register for state budget sources.
- Neither branch is a complete national picture. Both contain provisional / secondary figures that require explicit reconciliation status.
- Decision rule remains provenance and data quality, not observation count.

No production merge or deployment of these evidence PRs has occurred.

---

## Known limitations (current)

1. National evidence coverage is incomplete. Many priority source families (NPHCDA facility functionality, full state budget schedules, NEMIS completeness, etc.) remain catalogue-only or not yet extracted.
2. State-level budget documents are partially discovered; full extraction and validation are not complete.
3. Competing evidence snapshots have not been reconciled into a single coherent release candidate.
4. Visual hierarchy and department workspaces still require refinement for institutional presentation readiness.
5. Observatory production smoke tests remain gated until the founder confirms the production SHA equals the approved checkpoint.

---

## What this product does not do

- Invent statistics, geographic coverage or source documents.
- Treat community submissions as national prevalence or public opinion.
- Convert national figures into state/LGA/facility figures without supporting data.
- Equate budget allocation with expenditure or expenditure with verified delivery.
- Silently fall back to synthetic or demo data in live mode.
- Auto-publish AI-generated findings or contact public officials.

---

## Immediate next gates

1. Select one coherent national-evidence release candidate from #39 / #42 (and useful non-duplicative content from #38) based on provenance, not count.
2. Align Civic Brain (PRs #43 / #44) to the retained Observatory API contract.
3. Update department workspaces and overview for clear national evidence position.
4. Produce a national evidence coverage report and department research briefs from validated observations only.
5. End-to-end integration tests across Mandate → Observatory → Brain.

---

## Related documents

- [README](../README.md)
- [Product operating model](PRODUCT-OPERATING-MODEL-v1.md)
- [National source readiness](NATIONAL-SOURCE-READINESS-2026-11.md)
- [National evidence foundation](NATIONAL-EVIDENCE-FOUNDATION.md)
- [Evidence Vault contract](EVIDENCE-VAULT-CONTRACT-V1.md)
- [Community Observation contract](COMMUNITY-OBSERVATION-CONTRACT.md)

*This document describes the repository state as of the named main SHA and the open PRs listed above. It is not a claim of national completeness.*
