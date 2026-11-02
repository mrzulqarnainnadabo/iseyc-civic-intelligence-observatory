# Stage 1 status — ISEYC Civic Intelligence Observatory

**Branch:** `feat/stage1-observatory-import`  
**PR:** https://github.com/mrzulqarnainnadabo/iseyc-civic-intelligence-observatory/pull/1  
**Product version:** 0.2.1  
**Last documentation revision:** 2026-11-02

This document describes the **actual Stage 1 implementation on this branch**. It is not a roadmap and does not claim production readiness.

---

## What Stage 1 is

Stage 1 is a **standalone, integration-ready foundation** for a national civic intelligence interface. It helps people explore:

* what kinds of public sources are registered;
* how community reports, official data, research, media and independent verification differ;
* how accountability stages (referral, announcement, funding, implementation, verification) stay distinct;
* what remains unknown.

It is **not** a live national statistics platform, a poll, a ranking tool, or a campaign product.

---

## Application architecture

| Layer | Implementation |
|-------|----------------|
| Stack | React 18, Vite, TypeScript, React Router (hash routes) |
| Entry | `src/main.tsx` — six lazy-loaded routes under `AppShell` |
| Data access | `ObservatoryAdapter` interface; selected by `src/adapters/index.ts` |
| Default adapter | **Demo adapter only** (`createDemoAdapter`) |
| HTTP adapter | Implemented in `src/adapters/httpAdapter.ts`, **not selected by default**, not activated in the UI |
| Validation | `src/lib/validate.ts` + JSON Schemas under `schemas/` |
| Scripts | `validate:registry`, `typecheck`, `test`, `build`, `verify` |

### Six implemented experiences

1. **Overview** — entry questions, evidence-class legend, registry coverage, accountability funnel (demo records labelled).
2. **Issues / Sectors** — filter published demo records by sector, state and text.
3. **Geography** — 36 states and FCT map/table exploration; map presence is not evidence coverage.
4. **Evidence library** — registered sources and evidence items with status and limitations.
5. **Accountability** — stage strips and claim strength; institution mappings marked unverified.
6. **Briefs** — scoped synthesis with explicit caveats; not an approved institutional publication.

---

## Source registry

* **26** registered sources in `data/source-registry.json` (mirrored under `src/data/`).
* Registration means the project has catalogued a source with metadata and a link-status field.
* **Registration is not independent verification.** A `confirmed` or `domain-confirmed` URL status only means the link or domain was checked as reachable or attributed — not that every claim in that source was audited.
* Typical mix (illustrative; re-run `npm run validate:registry` for live counts): confirmed, domain-confirmed, and not-reconfirmed entries coexist.

---

## Geography

* Map data: `src/data/geo/nigeria-map.json`.
* **37 geographic units:** 36 states and the Federal Capital Territory (FCT).
* Dataset validation requires exactly 37 state/FCT entries.
* Stage 1 does **not** invent official LGA or ward identifier systems. Optional free-text LGA labels on **synthetic** demo records are demonstration only.

---

## Adapters and data boundaries

### Demo adapter (default)

* Mode: `demo`.
* **Real project data:** source registry and national map outlines.
* **Synthetic demonstration data:** civic records, evidence items, and institution assignment examples.
* Synthetic records use `synthetic: true`, origin `observatory-demo`, and titles prefixed with `Demonstration:`.
* Query flags for review: `?demo=empty`, `?demo=error`, `?demo=slow`.

### HTTP adapter (inactive)

* Code exists for a future live envelope (`schemaVersion` 1.0, `datasetMode: live`).
* Requires explicit endpoint configuration; HTTPS enforced (localhost exception for development).
* **Not wired** into `selectAdapter`. Stage 1 does not fetch live Civic Mandate or Civic Brain data.

---

## Evidence classifications and limitations

Evidence kinds (kept distinct in types and UI):

| Kind | What it can support | What it cannot establish alone |
|------|---------------------|--------------------------------|
| Official data | Published institutional material | Completeness or delivery |
| Published research | Documented study findings | National prevalence unless the study states it |
| Media report | Journalistic leads | Official findings or verified outcomes |
| Community submission | That a report was made (after review rules elsewhere) | How common a problem is |
| Independently verified | Claims checked under a stated method | Anything outside the verification scope |

Accountability integrity rules embedded in product language and rules helpers:

* Referral ≠ acknowledgement  
* Announcement ≠ implementation  
* Implementation ≠ independently verified delivery  
* AI or automated analysis ≠ independent verification  

Institution objects carry `responsibilityBasis: 'unverified'` until a legal basis is attached and reviewed.

---

## Validation and tests

| Command | Purpose |
|---------|---------|
| `npm run validate:registry` | Registry structure and source counts |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest (adapters, briefs, components, registry, rules, validate) |
| `npm run build` | Typecheck + production Vite build |
| `npm run verify` | Registry + typecheck + test + build |

CI: see `.github/workflows/ci.yml` (registry, typecheck, test, build on pull requests to `main` and pushes to this branch).

---

## Known limitations (honest)

1. **Demo records and evidence are synthetic.** They must never be cited as real Nigerian findings.
2. **No live Mandate/Brain integration in Stage 1.** That is Stage 2+ work under versioned contracts.
3. **Sector taxonomy is eight sectors** in Stage 1 types/schemas. Expansion (e.g. agriculture, environment) is deferred to Stage 2 contracts — not silently rewritten here.
4. **Institution–duty mappings are illustrative and unverified.**
5. **No LGA/ward master list** in Stage 1.
6. **Browser and accessibility audits** are not fully automated in CI beyond component tests.
7. **Not production-launched.** Merge of this branch does not by itself authorise public institutional claims about national coverage.

---

## Deferred to Stage 2 and beyond

* Shared versioned contracts (`PublicMandateRecord`, evidence/verification, duty–sector crosswalk).
* Ten-sector taxonomy and refined geographic aliases.
* Controlled live adapter activation against approved public APIs only.
* Institutional UX polish (separate stacked PR).
* Any national evidence ingestion or publication workflows.

---

## Production posture

* This branch is for **review and foundation merge only** when the founder authorises.
* No production deployment, secrets changes, or live data enablement are implied by this document.
