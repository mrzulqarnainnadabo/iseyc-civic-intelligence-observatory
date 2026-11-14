# National Evidence Reconciliation Decision — 2026-11-14

**Branch:** feat/national-evidence-reconciliation-v1  
**Base:** docs/accurate-implementation-status-2026-11 @ 212243ce  
**Main checkpoint:** e28eb1a8649334e461736479020a93b84f5d2518

## Comparison performed

| Branch | Observations | Head SHA |
|--------|--------------|----------|
| #39 feat/verified-national-evidence-snapshots | 104 | 46d61526d122da406aa9a361ea50ac177684d6df |
| #42 feat/unified-national-evidence-v2 | 91 | e4e69c4f96e282bdb74dfcbfd758ce9888fecf7d |

- Shared identical records: **21**
- Only in #39: **83**
- Only in #42: **70**
- Total unique: **174**

Full record-level matrix: `data/indicators/national-evidence-reconciliation-matrix.v1.json`

## Classification summary

| Category | Count |
|----------|-------|
| publisher_supported_official | 70 |
| publisher_supported_secondary | 97 |
| conflicting_or_unreconciled | 7 |

No records were excluded solely for incomplete provenance in this pass; all carry a publisher and most carry a source URL. Suitability for national presentation is therefore “yes with explicit status”, not “independently verified”.

## Critical discrepancy retained

**Lagos State 2025 IGR**
- BudgIT (State of States 2026): ₦1.71 trillion
- Agora Policy: ₦1.85 trillion

Both figures are retained with mutual reference. They must not be averaged, ranked or silently preferred.

## Recommended architecture

**Produce a new consolidated feature branch** (this branch is the start of that work).

Rationale:
1. The 21 shared official records (WHO, NIMC, NPHCDA, IMF, selected NITDA) form a stable core and are identical across both PRs.
2. #39 supplies the state-budget source-coverage register (37 jurisdictions). This is a readiness catalogue, not extracted budget tables. It is the correct place to track what has been located vs extracted.
3. #39 supplies Agora 2025 aggregates and selected state BIR figures with secondary status.
4. #42 supplies denser BudgIT H1-2026 health actual-spend by state; these are secondary research and should be imported with their published limitations (including the internal aggregate discrepancy noted by BudgIT).
5. Choosing either #39 or #42 alone would discard material, well-attributed secondary coverage from the other branch.
6. Merging the two PRs blindly would mix two different curation decisions without an audit trail.

## What this branch does next

1. Import the shared official core into a single national-source-snapshots.json.
2. Import the state-budget coverage register from #39 unchanged.
3. Selectively import secondary records from both branches with explicit verificationStatus and sourceType.
4. Keep Lagos IGR both sides.
5. Do **not** merge PR #39 or #42.
6. Do **not** deploy.

## Civic Brain alignment note

Brain PRs #43 and #44 both aim at concise Observatory-evidence answers. The safer consumer is the one that:
- Accepts the final Observatory observation schema (id, value, unit, referencePeriod, geoLevel, sourcePublisher, sourceUrl, limitations, verificationStatus).
- Never treats a successful HTTP 200 as independent verification.
- Surfaces source + period before interpretation.
- Handles missing / unavailable / secondary states explicitly.

Exact Brain branch selection will follow once the consolidated Observatory snapshot is stable.

## Non-negotiables observed

- No invented statistics.
- No silent preference of the larger figure.
- Official seal untouched.
- No merge, no deploy, no production config change.
