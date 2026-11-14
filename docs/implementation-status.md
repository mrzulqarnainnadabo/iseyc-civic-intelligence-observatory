# Implementation status — Civic Intelligence Observatory

**Repository:** mrzulqarnainnadabo/iseyc-civic-intelligence-observatory  
**Main SHA (checkpoint):** e28eb1a8649334e461736479020a93b84f5d2518  
**Working branch:** feat/national-evidence-reconciliation-v1  
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

## National evidence reconciliation (2026-11-14)

Record-level comparison of open evidence PRs completed. See:

- `docs/RECONCILIATION-DECISION-2026-11-14.md`
- `data/indicators/national-evidence-reconciliation-matrix.v1.json`

| PR | Branch | Observations | Head SHA |
|----|--------|--------------|----------|
| #42 | feat/unified-national-evidence-v2 | 91 | e4e69c4f96e282bdb74dfcbfd758ce9888fecf7d |
| #39 | feat/verified-national-evidence-snapshots | 104 | 46d61526d122da406aa9a361ea50ac177684d6df |
| #38 | feat/nphcda-health-evidence-snapshots | draft | — |
| #36 | earlier expansion | draft | — |

**Reconciliation outcome**
- Total unique observations: **174**
- Shared identical: **21** (official core — WHO, NIMC, NPHCDA, IMF, selected NITDA)
- Only in #39: **83**
- Only in #42: **70**
- Classification: 70 publisher_supported_official · 97 publisher_supported_secondary · 7 conflicting_or_unreconciled

**Lagos 2025 IGR discrepancy (retained dual)**
- BudgIT: ₦1.71 trillion
- Agora Policy: ₦1.85 trillion  
Both kept with mutual attribution. Do not average or prefer.

**Recommended architecture:** new consolidated feature branch (this branch), not a blind choice or merge of #39 or #42.

No production merge or deployment of the competing evidence PRs has occurred.

---

## Known limitations (current)

1. National evidence coverage is incomplete. Many priority source families remain catalogue-only or not yet extracted.
2. State-level budget documents are partially discovered (coverage register tracks 37 jurisdictions); full extraction is not complete.
3. Consolidated national-source-snapshots.json has not yet been built on this branch (next increment).
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

1. Build consolidated `national-source-snapshots.json` on this branch from the shared official core + attributed secondary sets + state-budget coverage register.
2. Align Civic Brain (evaluate #43 / #44) to the retained Observatory observation contract.
3. Update department workspaces and overview for clear national evidence position.
4. Produce a national evidence coverage report and department research briefs from validated observations only.
5. End-to-end integration tests across Mandate → Observatory → Brain.

---

## Related documents

- [README](../README.md)
- [Reconciliation decision](RECONCILIATION-DECISION-2026-11-14.md)
- [Product operating model](PRODUCT-OPERATING-MODEL-v1.md)
- [National source readiness](NATIONAL-SOURCE-READINESS-2026-11.md)
- [National evidence foundation](NATIONAL-EVIDENCE-FOUNDATION.md)
- [Evidence Vault contract](EVIDENCE-VAULT-CONTRACT-V1.md)
- [Community Observation contract](COMMUNITY-OBSERVATION-CONTRACT.md)

*This document describes the repository state as of the named main SHA and the open PRs listed above. It is not a claim of national completeness.*
