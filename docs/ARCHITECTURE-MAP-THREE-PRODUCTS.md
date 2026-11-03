# ISEYC three-product architecture map

**Audit date:** 2026-11-03  
**Status:** Stage 1 audit findings + Stage 2 shared-contract ownership (this branch).

## Product roles

| Product | Repo | Live | Role |
|---------|------|------|------|
| **Civic Mandate Nigeria** | `2027-street-mandate` | Yes — `2027-street-mandate.vercel.app` | System of record for community intake, moderation, **Published** public community records |
| **Civic Brain** | `iseyc-civic-brain` | Yes — `iseyc-civic-brain.vercel.app` | Interpretation layer over **published** records + (future) validated observations |
| **Observatory** | `iseyc-civic-intelligence-observatory` | **No** (404) | Exploration of national evidence, indicators, published community stream |

## Verified SHAs (audit)

| Repo | main HEAD |
|------|-----------|
| Mandate | `925daa96d594` |
| Brain | `e348d7b5251f` |
| Observatory | `b92184a4f007` |

### Observatory unmerged stack

| Branch | SHA | Contents |
|--------|-----|----------|
| `feat/national-evidence-foundation` | `21e3370` | Multi-stream IA, WDI pilot catalog, client fetch |
| `feat/evidence-gateway-v1` | `c99acaf` | **Includes foundation** + server Evidence Gateway + observation contract |
| `feat/shared-civic-evidence-contracts` | (this) | Shared entity ownership + schemas |

**Merge sequence (safe):**

1. Review/merge **`feat/evidence-gateway-v1` → main** (2 commits ahead of main; includes foundation — **do not** merge foundation alone first unless you cherry-pick).
2. Then merge **shared contracts** branch (or include it in the same PR if preferred).
3. Create **Vercel project** for Observatory so `/api/evidence/*` is live.
4. Brain/Mandate consume contracts after Observatory main has them (or copy schemas into each repo until a shared package exists).

**Do not** open a separate PR for `feat/national-evidence-foundation` against main after gateway is merged — it would be redundant/conflicting.

## Live Mandate public APIs

| Endpoint | Behaviour |
|----------|-----------|
| `GET /api/pulse` | Published-only “voices”: id, sentence, mandate, duty, office, state, lga, created |
| `GET /api/civic-intelligence` | Aggregates + methodology + limitations; pilot framing |

~24 published records; ~3 states represented. Explicitly **not** national prevalence.

## Brain

- `api/chat.js`, `api/public-records.js`, evidence/routing libs on main.
- Open PRs include stage4 engine (#10) and others — **not** assumed merged.
- Consumes Mandate published surface; **does not** yet consume Observatory Evidence Gateway.

## Observatory Evidence Gateway (unmerged)

- Allowlisted World Bank pilots only; observation + receipt contracts.
- Persistence **ephemeral** until approved durable store.
- SPA rewrite excludes `/api/*` once deployed.

## Data ownership (mandatory)

| Entity | Owner product | Consumers |
|--------|---------------|-----------|
| CommunityRecord (published) | **Mandate** | Brain, Observatory |
| ResponseRecord / follow-up | **Mandate** (+ operator desk) | Observatory, Brain (read) |
| EvidenceSource / Dataset registry | **Observatory** (catalog) | Brain, Mandate (optional link) |
| Indicator / IndicatorObservation / RetrievalReceipt | **Observatory gateway** | Brain, Observatory UI |
| InstitutionalResponsibility (documented) | Shared registry (start in Observatory contracts; Brain may route) | Brain, Observatory |
| IntelligenceBrief (published) | Human desk; **Observatory** presentation | Brain draft only until approved |

## Distinctions enforced in contracts

Community report ≠ verified fact · Published ≠ independently verified · National ≠ state · Announcement ≠ implementation · Empty Mandate ≠ no need · Suggested related ≠ merged issue.

## Out of scope until authorised

- Merge/deploy · Mandate publication rule changes · New Supabase · Brain auto-publish · Fake PHC data · Bulk scrape
