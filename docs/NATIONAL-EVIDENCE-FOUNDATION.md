# National evidence foundation

**Current source-readiness assessment:** [National source readiness and product utility — 4 November 2026](./NATIONAL-SOURCE-READINESS-2026-11.md).

## Positioning

ISEYC Civic Intelligence Observatory is a **national civic intelligence platform**, not only a Civic Mandate submission dashboard. Civic Mandate published records are **one community evidence stream**.

## Delivered in this branch

- Evidence-registry contract note (`contracts/evidence-registry.v1.md`)
- Pilot indicator catalog with full methodology (`data/indicators/nga-pilot-indicators.json`)
- Live World Bank WDI retrieval for three national series (population, primary enrollment, under-5 mortality)
- Dataset-level source assessment for INEC, UBEC, NBS, CBN, NPC, Budget Office, BPP/NOCOPO and health sources
- INEC 2023 registered-voter/PVC state table transcribed for 36 states and FCT, with arithmetic reconciliation warnings retained
- Evidence page includes a searchable historical state-level voter/PVC snapshot and explains the CVR count discrepancy
- Overview and Evidence IA: multi-stream framing; platform remains useful with zero Mandate rows
- Attribution and limitations required on every pilot indicator

## Not yet

- Production Vercel deployment (requires founder project create)
- Subnational official series
- Full observation store / offline cache
- NBS microdata integration
- Final consolidated 2025–26 INEC CVR result and current register
- UBEC harmonised current school-level data
- Public NOCOPO machine-readable procurement feed
- Approved HFR/HEFA/NPHCDA health facility observations
- Automatic interpretation or rankings


## Current source-quality decisions

The INEC 2023 PDF is an official source but its uncollected-PVC arithmetic does not reconcile. The Observatory keeps source-published and calculated values separate and flags the issue. INEC's phase-one CVR count also differs by two between two official statements. Neither discrepancy is silently resolved.

The expanded source registry is a discovery and assessment catalogue, not proof of ingestion. Each dataset must have its own access, vintage, geography, completeness, methodology and reuse assessment.
